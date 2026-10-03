"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateSighting } from "@/app/actions/sightings";
import { toLocalInputValue } from "@/lib/client-image";
import { DESCRIPTION_MAX } from "@/lib/validation";
import { SightingFields } from "./SightingFields";
import type { LatLng } from "./map/LocationPicker";

export function EditSightingForm({
  id,
  initial,
}: {
  id: string;
  initial: { latitude: number; longitude: number; sighted_at: string; description: string | null };
}) {
  const t = useTranslations("form");
  const te = useTranslations("errors");
  const router = useRouter();
  const [location, setLocation] = useState<LatLng | null>({ latitude: initial.latitude, longitude: initial.longitude });
  const [sightedAt, setSightedAt] = useState("");
  const [description, setDescription] = useState(initial.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [maxDateTime, setMaxDateTime] = useState("");

  // Convert to the device's time zone after hydration (the server doesn't know it).
  useEffect(() => {
    setSightedAt(toLocalInputValue(new Date(initial.sighted_at)));
    setMaxDateTime(toLocalInputValue(new Date(Date.now() + 60_000)));
  }, [initial.sighted_at]);

  const tooLong = [...description].length > DESCRIPTION_MAX;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!location || tooLong || !sightedAt) return;
    const fd = new FormData();
    fd.set("latitude", String(location.latitude));
    fd.set("longitude", String(location.longitude));
    fd.set("sighted_at", new Date(sightedAt).toISOString());
    fd.set("description", description);
    setError(null);
    startTransition(async () => {
      const res = await updateSighting(id, fd);
      if (!res.ok) return setError(te(res.error));
      router.push(`/s/${id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <SightingFields
        location={location}
        onLocation={setLocation}
        sightedAt={sightedAt}
        onSightedAt={setSightedAt}
        description={description}
        onDescription={setDescription}
        maxDateTime={maxDateTime}
      />
      {error ? <p className="rounded-2xl border-2 border-hat bg-white p-3 font-semibold text-hat-dark" role="alert">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending || tooLong} className="btn-primary flex-1 !py-3">
          {pending ? t("saving") : t("save")}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary !py-3">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
