"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setDisplayName } from "@/app/actions/account";
import { DISPLAY_NAME_MAX } from "@/lib/validation";

export function DisplayNameForm({ next, initial = "" }: { next?: string; initial?: string }) {
  const t = useTranslations("onboarding");
  const te = useTranslations("errors");
  const router = useRouter();
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await setDisplayName(name);
      if (!res.ok) return setError(te(res.error));
      if (next) router.replace(next);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor="display_name" className="label !mb-0">{t("label")}</label>
      <input
        id="display_name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={DISPLAY_NAME_MAX}
        required
        autoComplete="nickname"
        className="input"
      />
      <p className="text-sm text-ink/70">{t("hint")}</p>
      {error ? <p className="text-sm font-semibold text-hat-dark" role="alert">{error}</p> : null}
      {saved ? <p className="text-sm font-semibold text-emerald-700" role="status">{t("saved")}</p> : null}
      <button type="submit" disabled={pending || name.trim().length < 2} className="btn-primary !py-3">
        {pending ? "…" : t("submit")}
      </button>
    </form>
  );
}
