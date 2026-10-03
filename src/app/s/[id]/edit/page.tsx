import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EditSightingForm } from "@/components/EditSightingForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("form");
  return { title: t("editTitle"), robots: { index: false } };
}

export default async function EditSightingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=/s/${id}/edit`);

  const supabase = await createClient();
  const { data: s } = await supabase
    .from("sightings")
    .select("id,user_id,image_url,latitude,longitude,sighted_at,description")
    .eq("id", id)
    .maybeSingle();
  if (!s) notFound();
  if (s.user_id !== profile.id) redirect(`/s/${id}`);

  const t = await getTranslations("form");
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 font-display text-4xl font-bold">{t("editTitle")}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.image_url} alt="" className="card mb-6 max-h-64 w-full object-contain" />
      <EditSightingForm id={s.id} initial={s} />
    </div>
  );
}
