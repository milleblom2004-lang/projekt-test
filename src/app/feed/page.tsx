import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_SIGHTING_COLUMNS, type Sighting } from "@/lib/types";
import { countryName } from "@/lib/place";
import { SightingCard } from "@/components/SightingCard";
import { CountryFilter } from "@/components/CountryFilter";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("feed");
  return { title: t("title") };
}

const PAGE_SIZE = 24;
const PERIODS = { "24h": 86_400_000, "7d": 7 * 86_400_000, all: 0 } as const;
type Period = keyof typeof PERIODS;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; country?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const period: Period = sp.period && sp.period in PERIODS ? (sp.period as Period) : "all";
  const country = sp.country && /^[A-Z]{2}$/.test(sp.country) ? sp.country : null;
  const page = Math.max(1, Math.min(100, Number(sp.page) || 1));

  const t = await getTranslations("feed");
  const locale = await getLocale();
  const supabase = await createClient();

  let query = supabase
    .from("sightings")
    .select(PUBLIC_SIGHTING_COLUMNS)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(page * PAGE_SIZE + 1);
  if (PERIODS[period]) query = query.gte("created_at", new Date(Date.now() - PERIODS[period]).toISOString());
  if (country) query = query.eq("country", country);

  const [{ data, error }, { data: countries }] = await Promise.all([
    query.returns<Sighting[]>(),
    supabase.rpc("sighting_countries"),
  ]);
  const rows = data ?? [];
  const hasMore = rows.length > page * PAGE_SIZE;
  const visible = rows.slice(0, page * PAGE_SIZE);

  const countryOptions = ((countries ?? []) as { country: string; sightings: number }[])
    .map((c) => ({ code: c.country, name: countryName(c.country, locale), count: Number(c.sightings) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  const href = (p: Partial<{ period: Period; country: string | null; page: number }>) => {
    const params = new URLSearchParams();
    const np = p.period ?? period;
    const nc = p.country === undefined ? country : p.country;
    if (np !== "all") params.set("period", np);
    if (nc) params.set("country", nc);
    if (p.page && p.page > 1) params.set("page", String(p.page));
    const s = params.toString();
    return s ? `/feed?${s}` : "/feed";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 font-display text-4xl font-bold">{t("title")}</h1>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border-2 border-ink bg-white p-1 shadow-chunky-sm" role="group" aria-label={t("periodLabel")}>
          {(Object.keys(PERIODS) as Period[]).map((p) => (
            <Link
              key={p}
              href={href({ period: p, page: 1 })}
              aria-current={p === period ? "true" : undefined}
              className={`rounded-full px-3 py-1 text-sm font-bold ${p === period ? "bg-hat text-white" : "hover:bg-sun"}`}
            >
              {t(`period.${p}`)}
            </Link>
          ))}
        </div>
        <CountryFilter
          value={country}
          options={countryOptions}
          label={t("country")}
          allLabel={t("allCountries")}
          baseHref={href({ country: null, page: 1 })}
        />
      </div>

      {error ? <p className="card p-4">{t("error")}</p> : null}
      {!error && visible.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-display text-xl font-semibold">{t("empty")}</p>
          <p className="mt-1 text-ink/70">{t("emptyHint")}</p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {visible.map((s) => (
          <li key={s.id}>
            <SightingCard s={s} />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div className="mt-6 text-center">
          <Link href={href({ page: page + 1 })} scroll={false} className="btn-secondary">
            {t("loadMore")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
