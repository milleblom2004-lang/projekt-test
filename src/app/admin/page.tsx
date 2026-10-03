import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { thumbUrl } from "@/lib/images";
import { placeLabel } from "@/lib/place";
import { LocalTime } from "@/components/LocalTime";
import { AdminSightingActions } from "@/components/AdminSightingActions";
import { UnbanButton } from "@/components/UnbanButton";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

interface AdminSighting {
  id: string;
  user_id: string;
  image_url: string;
  place_name: string | null;
  country: string | null;
  sighted_at: string;
  created_at: string;
  description: string | null;
  hidden: boolean;
  users: { display_name: string | null; banned_at: string | null } | null;
}

interface ReportRow {
  id: string;
  sighting_id: string;
  reason: string;
  created_at: string;
  users: { display_name: string | null } | null;
}

const SIGHTING_COLS = "id,user_id,image_url,place_name,country,sighted_at,created_at,description,hidden,users(display_name,banned_at)";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const profile = await getProfile();
  if (profile?.role !== "admin") notFound();

  const tab = (await searchParams).tab === "recent" ? "recent" : (await searchParams).tab === "banned" ? "banned" : "reports";
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const admin = createAdminClient();

  let reported: { sighting: AdminSighting; reports: ReportRow[] }[] = [];
  let recent: AdminSighting[] = [];
  let banned: { id: string; display_name: string | null; banned_at: string }[] = [];

  if (tab === "reports") {
    const { data: reports } = await admin
      .from("reports")
      .select("id,sighting_id,reason,created_at,users(display_name)")
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<ReportRow[]>();
    const ids = [...new Set((reports ?? []).map((r) => r.sighting_id))];
    if (ids.length) {
      const { data: sightings } = await admin.from("sightings").select(SIGHTING_COLS).in("id", ids).returns<AdminSighting[]>();
      const byId = new Map((sightings ?? []).map((s) => [s.id, s]));
      reported = ids
        .filter((id) => byId.has(id))
        .map((id) => ({ sighting: byId.get(id)!, reports: (reports ?? []).filter((r) => r.sighting_id === id) }))
        .sort((a, b) => b.reports.length - a.reports.length);
    }
  } else if (tab === "recent") {
    const { data } = await admin.from("sightings").select(SIGHTING_COLS).order("created_at", { ascending: false }).limit(100).returns<AdminSighting[]>();
    recent = data ?? [];
  } else {
    const { data } = await admin
      .from("users")
      .select("id,display_name,banned_at")
      .not("banned_at", "is", null)
      .order("banned_at", { ascending: false })
      .returns<{ id: string; display_name: string | null; banned_at: string }[]>();
    banned = data ?? [];
  }

  const tabs = [
    ["reports", t("tabs.reports")],
    ["recent", t("tabs.recent")],
    ["banned", t("tabs.banned")],
  ] as const;

  const row = (s: AdminSighting, reports?: ReportRow[]) => (
    <li key={s.id} className="card flex flex-col gap-3 p-3">
      <div className="flex gap-3">
        <Link href={`/s/${s.id}`} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbUrl(s.image_url)} alt="" className="h-24 w-24 rounded-2xl border-2 border-ink object-cover" />
        </Link>
        <div className="min-w-0 text-sm">
          <p className="font-display text-lg font-semibold">
            {placeLabel(s, locale) || "—"}{" "}
            {s.hidden ? <span className="rounded-full bg-ink px-2 text-xs text-white">{t("hidden")}</span> : null}
          </p>
          <p>
            {t("by")} <b>{s.users?.display_name ?? "—"}</b>
            {s.users?.banned_at ? <span className="ml-1 rounded-full bg-hat px-2 text-xs font-bold text-white">{t("banned")}</span> : null}
          </p>
          <p className="text-ink/70"><LocalTime iso={s.created_at} /></p>
          {s.description ? <p className="line-clamp-2">{s.description}</p> : null}
        </div>
      </div>
      {reports ? (
        <ul className="rounded-2xl bg-sun/40 p-2 text-sm">
          {reports.map((r) => (
            <li key={r.id}>
              <b>{r.reason}</b> — {r.users?.display_name ?? "?"}, <LocalTime iso={r.created_at} />
            </li>
          ))}
        </ul>
      ) : null}
      <AdminSightingActions id={s.id} userId={s.user_id} hidden={s.hidden} userBanned={!!s.users?.banned_at} hasReports={!!reports?.length} />
    </li>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 font-display text-4xl font-bold">{t("title")}</h1>
      <nav className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <Link key={key} href={key === "reports" ? "/admin" : `/admin?tab=${key}`} className={`btn !px-4 !py-1.5 text-sm ${tab === key ? "bg-ink text-white" : "bg-white"}`}>
            {label}
          </Link>
        ))}
      </nav>

      {tab === "reports" ? (
        reported.length ? <ul className="flex flex-col gap-4">{reported.map(({ sighting, reports }) => row(sighting, reports))}</ul> : <p className="card p-6">{t("noReports")}</p>
      ) : null}
      {tab === "recent" ? <ul className="flex flex-col gap-4">{recent.map((s) => row(s))}</ul> : null}
      {tab === "banned" ? (
        banned.length ? (
          <ul className="flex flex-col gap-2">
            {banned.map((u) => (
              <li key={u.id} className="card flex items-center justify-between gap-3 p-3">
                <span>
                  <b>{u.display_name ?? "—"}</b> · <LocalTime iso={u.banned_at} />
                </span>
                <UnbanButton userId={u.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="card p-6">{t("noBanned")}</p>
        )
      ) : null}
    </div>
  );
}
