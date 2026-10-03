"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/supabase/env";
import { MAX_UPLOAD_BYTES, detectImageKind } from "@/lib/images";
import { processImage } from "@/lib/process-image";
import { reverseGeocode } from "@/lib/geocode";
import { UPLOAD_LIMITS } from "@/lib/rate-limit";
import { firstErrorKey, newSightingSchema, sightingFieldsSchema } from "@/lib/validation";
import type { Profile } from "@/lib/types";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function requirePoster(): Promise<Profile | string> {
  const profile = await getProfile();
  if (!profile) return "not_authenticated";
  if (profile.banned_at) return "banned";
  if (!profile.display_name) return "no_display_name";
  return profile;
}

/** Storage path from a public URL ("…/object/public/sightings/<path>"). */
function storagePath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

export async function removeImages(imageUrls: string[]) {
  const paths = imageUrls
    .map(storagePath)
    .filter((p): p is string => !!p)
    .flatMap((p) => [p, p.replace(/\.jpg$/, "_thumb.jpg")]);
  if (paths.length) await createAdminClient().storage.from(BUCKET).remove(paths);
}

export async function createSighting(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const poster = await requirePoster();
  if (typeof poster === "string") return { ok: false, error: poster };

  const parsed = newSightingSchema.safeParse({
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    sighted_at: formData.get("sighted_at"),
    description: formData.get("description") ?? undefined,
    consent: formData.get("consent"),
  });
  if (!parsed.success) return { ok: false, error: firstErrorKey(parsed.error) };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "file_missing" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "file_too_large" };

  const admin = createAdminClient();

  // Rate limit (the database trigger is the backstop).
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [{ count: lastHour }, { count: lastDay }] = await Promise.all([
    admin.from("sightings").select("id", { count: "exact", head: true }).eq("user_id", poster.id).gte("created_at", hourAgo),
    admin.from("sightings").select("id", { count: "exact", head: true }).eq("user_id", poster.id).gte("created_at", dayAgo),
  ]);
  if ((lastHour ?? 0) >= UPLOAD_LIMITS.perHour || (lastDay ?? 0) >= UPLOAD_LIMITS.perDay) {
    return { ok: false, error: "rate_limited" };
  }

  const input = Buffer.from(await file.arrayBuffer());
  const kind = detectImageKind(input);
  if (!kind) return { ok: false, error: "file_type" };

  let images;
  try {
    images = await processImage(input, kind);
  } catch {
    return { ok: false, error: "file_type" };
  }

  const { latitude, longitude, sighted_at, description } = parsed.data;
  const place = await reverseGeocode(latitude, longitude);

  const id = randomUUID();
  const base = `${poster.id}/${id}`;
  const bucket = admin.storage.from(BUCKET);
  const upload = (path: string, body: Buffer) =>
    bucket.upload(path, body, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  const [full, thumb] = await Promise.all([upload(`${base}.jpg`, images.full), upload(`${base}_thumb.jpg`, images.thumb)]);
  if (full.error || thumb.error) {
    await bucket.remove([`${base}.jpg`, `${base}_thumb.jpg`]);
    return { ok: false, error: "generic" };
  }
  const imageUrl = bucket.getPublicUrl(`${base}.jpg`).data.publicUrl;

  const { error } = await admin.from("sightings").insert({
    id,
    user_id: poster.id,
    image_url: imageUrl,
    latitude,
    longitude,
    place_name: place.place_name,
    country: place.country,
    sighted_at: sighted_at.toISOString(),
    description,
    consent_given_at: new Date().toISOString(),
  });
  if (error) {
    await bucket.remove([`${base}.jpg`, `${base}_thumb.jpg`]);
    return { ok: false, error: error.message.includes("rate_limited") ? "rate_limited" : "generic" };
  }

  revalidatePath("/feed");
  revalidatePath("/me");
  return { ok: true, id };
}

export async function updateSighting(id: string, formData: FormData): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "not_authenticated" };

  const parsed = sightingFieldsSchema.safeParse({
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    sighted_at: formData.get("sighted_at"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: firstErrorKey(parsed.error) };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("sightings")
    .select("user_id,latitude,longitude")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "not_found" };
  if (existing.user_id !== profile.id) return { ok: false, error: "not_allowed" };

  const { latitude, longitude, sighted_at, description } = parsed.data;
  const moved = existing.latitude !== latitude || existing.longitude !== longitude;
  const place = moved ? await reverseGeocode(latitude, longitude) : null;

  const { error } = await admin
    .from("sightings")
    .update({
      latitude,
      longitude,
      sighted_at: sighted_at.toISOString(),
      description,
      ...(place ? { place_name: place.place_name, country: place.country } : {}),
    })
    .eq("id", id)
    .eq("user_id", profile.id);
  if (error) return { ok: false, error: "generic" };

  revalidatePath(`/s/${id}`);
  revalidatePath("/feed");
  revalidatePath("/me");
  return { ok: true };
}

/** Owner or admin deletes a sighting and its photos. */
export async function deleteSighting(id: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "not_authenticated" };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("sightings").select("user_id,image_url").eq("id", id).maybeSingle();
  if (!existing) return { ok: false, error: "not_found" };
  if (existing.user_id !== profile.id && profile.role !== "admin") return { ok: false, error: "not_allowed" };

  const { error } = await admin.from("sightings").delete().eq("id", id);
  if (error) return { ok: false, error: "generic" };
  await removeImages([existing.image_url]);

  revalidatePath("/feed");
  revalidatePath("/me");
  revalidatePath("/admin");
  return { ok: true };
}
