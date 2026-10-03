import Link from "next/link";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { thumbUrl } from "@/lib/images";
import { placeLabel } from "@/lib/place";
import type { Sighting } from "@/lib/types";
import { LocalTime } from "./LocalTime";

export async function SightingCard({ s, showHidden = false }: { s: Sighting; showHidden?: boolean }) {
  const t = await getTranslations("sighting");
  const locale = await getLocale();
  const place = placeLabel(s, locale) || t("unknownPlace");
  return (
    <Link href={`/s/${s.id}`} className="card flex gap-3 overflow-hidden p-2.5 transition hover:-translate-y-0.5">
      <Image
        src={thumbUrl(s.image_url)}
        alt={t("photoAlt", { place })}
        width={112}
        height={112}
        unoptimized
        className="h-24 w-24 shrink-0 rounded-2xl border-2 border-ink object-cover sm:h-28 sm:w-28"
      />
      <div className="flex min-w-0 flex-col gap-0.5 py-1">
        <p className="truncate font-display text-lg font-semibold">📍 {place}</p>
        <LocalTime iso={s.sighted_at} className="text-sm font-semibold text-ink/70" />
        {s.description ? <p className="line-clamp-2 text-sm">{s.description}</p> : null}
        <p className="mt-auto text-sm text-ink/70">{t("by", { name: s.users?.display_name ?? t("anonymous") })}</p>
        {showHidden && s.hidden ? (
          <span className="self-start rounded-full bg-ink px-2 text-xs font-bold text-white">{t("hiddenBadge")}</span>
        ) : null}
      </div>
    </Link>
  );
}
