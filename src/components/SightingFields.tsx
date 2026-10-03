"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { LatLng } from "./map/LocationPicker";
import { DESCRIPTION_MAX } from "@/lib/validation";

const LocationPicker = dynamic(() => import("./map/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-3xl border-2 border-ink bg-sky/40 sm:h-96" />,
});

/** Location, date/time and description - shared by the new and edit forms. */
export function SightingFields({
  location,
  onLocation,
  sightedAt,
  onSightedAt,
  description,
  onDescription,
  maxDateTime,
}: {
  location: LatLng | null;
  onLocation: (v: LatLng) => void;
  sightedAt: string;
  onSightedAt: (v: string) => void;
  description: string;
  onDescription: (v: string) => void;
  maxDateTime: string;
}) {
  const t = useTranslations("form");
  const left = DESCRIPTION_MAX - [...description].length;

  return (
    <>
      <fieldset>
        <legend className="label">{t("location")}</legend>
        <LocationPicker value={location} onChange={onLocation} />
      </fieldset>

      <div>
        <label htmlFor="sighted_at" className="label">{t("dateTime")}</label>
        <input
          id="sighted_at"
          type="datetime-local"
          required
          value={sightedAt}
          max={maxDateTime}
          onChange={(e) => onSightedAt(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          {t("description")} <span className="text-base font-normal text-ink/60">({t("optional")})</span>
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          className="input resize-y"
          aria-describedby="description-count"
        />
        <p id="description-count" className={`mt-1 text-right text-sm ${left < 0 ? "font-bold text-hat-dark" : "text-ink/60"}`}>
          {t("charsLeft", { count: left })}
        </p>
      </div>
    </>
  );
}
