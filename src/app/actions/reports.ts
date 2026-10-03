"use server";

import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { firstErrorKey, reportSchema } from "@/lib/validation";
import type { ActionResult } from "./sightings";

export async function reportSighting(input: {
  sighting_id: string;
  reason: string;
  details?: string;
}): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "not_authenticated" };
  if (profile.banned_at) return { ok: false, error: "banned" };

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstErrorKey(parsed.error) };
  const { sighting_id, reason, details } = parsed.data;

  const admin = createAdminClient();
  const { data: sighting } = await admin.from("sightings").select("id").eq("id", sighting_id).maybeSingle();
  if (!sighting) return { ok: false, error: "not_found" };

  const { error } = await admin.from("reports").insert({
    sighting_id,
    user_id: profile.id,
    reason: details ? `${reason}: ${details}` : reason,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "already_reported" };
    if (error.message.includes("rate_limited")) return { ok: false, error: "rate_limited" };
    return { ok: false, error: "generic" };
  }
  return { ok: true };
}
