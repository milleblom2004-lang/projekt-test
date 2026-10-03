"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/app/actions/locale";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="relative">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(async () => {
            await setLocale(next);
            router.refresh();
          });
        }}
        className="cursor-pointer appearance-none rounded-full border-2 border-ink bg-white py-1 pr-2 pl-2 text-sm font-bold uppercase"
      >
        {locales.map((l) => (
          <option key={l} value={l} aria-label={localeNames[l]}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
