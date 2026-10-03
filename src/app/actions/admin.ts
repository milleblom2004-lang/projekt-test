"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "./sightings";

async function requireAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin" ? profile : null;
}

function refresh(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/feed");
  if (id) revalidatePath(`/s/${id}`);
}

export async function setSightingHidden(id: string, hidden: boolean): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "not_allowed" };
  const { error } = await createAdminClient().from("sightings").update({ hidden }).eq("id", id);
  if (error) return { ok: false, error: "generic" };
  refresh(id);
  return { ok: true };
}

export async function dismissReports(sightingId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "not_allowed" };
  const { error } = await createAdminClient().from("reports").delete().eq("sighting_id", sightingId);
  if (error) return { ok: false, error: "generic" };
  refresh();
  return { ok: true };
}

/** Ban (or unban) a user. Banning also hides all their sightings. */
export async function setUserBanned(userId: string, banned: boolean): Promise<ActionResult> {
  const me = await requireAdmin();
  if (!me) return { ok: false, error: "not_allowed" };
  if (userId === me.id) return { ok: false, error: "not_allowed" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ banned_at: banned ? new Date().toISOString() : null })
    .eq("id", userId)
    .neq("role", "admin");
  if (error) return { ok: false, error: "generic" };
  if (banned) await admin.from("sightings").update({ hidden: true }).eq("user_id", userId);
  refresh();
  return { ok: true };
}
