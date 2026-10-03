"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/supabase/env";
import { displayNameSchema, firstErrorKey } from "@/lib/validation";
import type { ActionResult } from "./sightings";

export async function setDisplayName(name: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "not_authenticated" };
  const parsed = displayNameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: firstErrorKey(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ display_name: parsed.data }).eq("id", profile.id);
  if (error) {
    return { ok: false, error: error.code === "23505" ? "display_name_taken" : "generic" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Delete the account, all sightings (cascade) and all photos. */
export async function deleteAccount(confirmation: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "not_authenticated" };
  if (confirmation.trim().toUpperCase() !== "DELETE") return { ok: false, error: "confirm_mismatch" };

  const admin = createAdminClient();
  const bucket = admin.storage.from(BUCKET);

  // Remove every file in the user's folder (paginated).
  for (;;) {
    const { data, error } = await bucket.list(profile.id, { limit: 1000 });
    if (error) return { ok: false, error: "generic" };
    if (!data?.length) break;
    const { error: rmError } = await bucket.remove(data.map((f) => `${profile.id}/${f.name}`));
    if (rmError) return { ok: false, error: "generic" };
    if (data.length < 1000) break;
  }

  // Deleting the auth user cascades to users -> sightings -> reports.
  const { error } = await admin.auth.admin.deleteUser(profile.id);
  if (error) return { ok: false, error: "generic" };

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}
