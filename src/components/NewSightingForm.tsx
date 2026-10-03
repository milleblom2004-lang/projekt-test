"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createSighting } from "@/app/actions/sightings";
import { prepareImage, toLocalInputValue } from "@/lib/client-image";
import { MAX_UPLOAD_BYTES } from "@/lib/images";
import { DESCRIPTION_MAX } from "@/lib/validation";
import { SightingFields } from "./SightingFields";
import type { LatLng } from "./map/LocationPicker";

const ACCEPT = "image/jpeg,image/png,image/heic,image/heif,.heic,.heif,.jpg,.jpeg,.png";

export function NewSightingForm() {
  const t = useTranslations("form");
  const te = useTranslations("errors");
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [sightedAt, setSightedAt] = useState(() => toLocalInputValue(new Date()));
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [maxDateTime] = useState(() => toLocalInputValue(new Date(Date.now() + 60_000)));

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) return;
    setError(null);
    if (original.size > MAX_UPLOAD_BYTES) {
      setError(te("file_too_large"));
      return;
    }
    const name = original.name.toLowerCase();
    const okType =
      ["image/jpeg", "image/png", "image/heic", "image/heif"].includes(original.type) ||
      /\.(jpe?g|png|heic|heif)$/.test(name);
    if (!okType) {
      setError(te("file_type"));
      return;
    }
    setPreparing(true);
    try {
      const prepared = await prepareImage(original);
      setPhoto(prepared.file);
      setPreview(prepared.previewUrl);
    } finally {
      setPreparing(false);
    }
  }

  const tooLong = [...description].length > DESCRIPTION_MAX;
  const canSubmit = !!photo && !!location && !!sightedAt && consent && !tooLong && !pending && !preparing;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !photo || !location) return;
    setError(null);
    const fd = new FormData();
    fd.set("photo", photo);
    fd.set("latitude", String(location.latitude));
    fd.set("longitude", String(location.longitude));
    fd.set("sighted_at", new Date(sightedAt).toISOString()); // local -> UTC
    fd.set("description", description);
    fd.set("consent", consent ? "true" : "false");
    startTransition(async () => {
      try {
        const res = await createSighting(fd);
        if (res.ok) router.push(`/s/${res.id}?new=1`);
        else setError(te(res.error));
      } catch {
        setError(te("generic"));
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <span className="label">{t("photo")}</span>
        <input ref={fileInput} type="file" accept={ACCEPT} onChange={onFile} className="sr-only" id="photo" />
        <label
          htmlFor="photo"
          className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed border-ink bg-white p-3 text-center transition hover:bg-sun/40"
        >
          {preparing ? (
            <span className="font-semibold">{t("preparing")}</span>
          ) : photo ? (
            <>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={t("previewAlt")} className="max-h-80 rounded-2xl object-contain" />
              ) : (
                <span className="font-semibold">📷 {t("noPreview")}</span>
              )}
              <span className="btn-secondary !py-1.5 text-sm">{t("changePhoto")}</span>
            </>
          ) : (
            <>
              <span className="text-5xl" aria-hidden>📷</span>
              <span className="font-display text-xl font-semibold">{t("choosePhoto")}</span>
              <span className="text-sm text-ink/70">{t("photoHint")}</span>
            </>
          )}
        </label>
      </div>

      <SightingFields
        location={location}
        onLocation={setLocation}
        sightedAt={sightedAt}
        onSightedAt={setSightedAt}
        description={description}
        onDescription={setDescription}
        maxDateTime={maxDateTime}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-ink bg-sun/50 p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-1 h-6 w-6 shrink-0 accent-hat"
        />
        <span className="font-semibold">{t("consent")}</span>
      </label>

      {error ? (
        <p className="rounded-2xl border-2 border-hat bg-white p-3 font-semibold text-hat-dark" role="alert">{error}</p>
      ) : null}

      {!location || !photo ? <p className="text-sm text-ink/70">{t("missingHint")}</p> : null}

      <button type="submit" disabled={!canSubmit} className="btn-primary !py-4 text-xl">
        {pending ? t("publishing") : t("publish")}
      </button>
    </form>
  );
}
