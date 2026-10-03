import type { Locale } from "@/i18n/config";
import * as en from "./en";
import * as sv from "./sv";

// Add new languages here; missing ones fall back to English.
const pages: Partial<Record<Locale, typeof en>> = { en, sv };

export function legalFor(locale: string) {
  return pages[locale as Locale] ?? en;
}
