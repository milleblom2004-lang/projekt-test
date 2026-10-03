import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { PUBLIC_SIGHTING_COLUMNS, type Sighting } from "@/lib/types";
import { placeLabel } from "@/lib/place";
import { LocalTime } from "@/components/LocalTime";
import { MiniMapLoader } from "@/components/map/MapLoader";
import { ReportButton } from "@/components/ReportButton";
import { ShareButton } from "@/components/ShareButton";
import { DeleteSightingButton } from "@/components/DeleteSightingButton";
import { AdminSightingActions } from "@/components/AdminSightingActions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getSighting = cache(async (id: string) => {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("sightings")
    .select(`${PUBLIC_SIGHTING_COLUMNS},consent_given_at`)
    .eq("id", id)
    .maybeSingle<Sighting>();
  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const s = await getSighting((await params).id);
  if (!s) return {};
  const t = await getTranslations("sighting");
  const locale = await getLocale();
  const place = placeLabel(s, locale) || t("unknownPlace");
  const title = t("metaTitle", { place });
  return {
    title,
    description: s.description ?? t("metaDescription"),
    robots: s.hidden ? { index: false } : undefined,
    openGraph: { title, description: s.description ?? undefined, images: [{ url: s.image_url }] },
    twitter: { card: "summary_large_image", title, images: [s.image_url] },
  };
}

export default async function SightingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const isNew = (await searchParams).new === "1";
  const [s, profile] = await Promise.all([getSighting(id), getProfile()]);
  if (!s) notFound();

  const t = await getTranslations("sighting");
  const locale = await getLocale();
  const place = placeLabel(s, locale) || t("unknownPlace");
  const isOwner = profile?.id === s.user_id;
  const isAdmin = profile?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {isNew ? (
        <p className="mb-4 rounded-2xl border-2 border-ink bg-mint/40 p-3 text-center font-display text-lg font-semibold" role="status">
          🎉 {t("published")}
        </p>
      ) : null}
      {s.hidden ? (
        <p className="mb-4 rounded-2xl border-2 border-ink bg-sun p-3 font-semibold">{t("hiddenNotice")}</p>
      ) : null}

      <article className="card overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image_url} alt={t("photoAlt", { place })} className="max-h-[70vh] w-full bg-ink/5 object-contain" />
        <div className="flex flex-col gap-3 p-4 sm:p-6">
          <h1 className="font-display text-3xl font-bold">📍 {place}</h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="font-bold">{t("sightedAt")}</dt>
            <dd><LocalTime iso={s.sighted_at} /></dd>
            <dt className="font-bold">{t("postedBy")}</dt>
            <dd>{s.users?.display_name ?? t("anonymous")}</dd>
            <dt className="font-bold">{t("postedAt")}</dt>
            <dd><LocalTime iso={s.created_at} /></dd>
          </dl>
          {s.description ? <p className="text-lg whitespace-pre-line">{s.description}</p> : null}

          <div className="flex flex-wrap gap-2 pt-2">
            <ShareButton title={t("metaTitle", { place })} />
            {!isOwner ? <ReportButton sightingId={s.id} loggedIn={!!profile} /> : null}
            {isOwner ? (
              <>
                <Link href={`/s/${s.id}/edit`} className="btn-secondary">✏️ {t("edit")}</Link>
                <DeleteSightingButton id={s.id} redirectTo="/me" />
              </>
            ) : null}
          </div>
          {isAdmin ? <AdminSightingActions id={s.id} userId={s.user_id} hidden={s.hidden} redirectAfterDelete="/admin" /> : null}
        </div>
        <div className="h-56 border-t-2 border-ink">
          <MiniMapLoader latitude={s.latitude} longitude={s.longitude} />
        </div>
      </article>

      <p className="mt-4">
        <Link href="/" className="font-semibold underline">← {t("backToMap")}</Link>
      </p>
    </div>
  );
}
