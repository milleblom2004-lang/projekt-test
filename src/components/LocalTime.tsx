"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

/**
 * Renders a timestamp in the visitor's own locale and time zone. The server
 * renders a UTC fallback; the browser replaces it after hydration.
 */
export function LocalTime({
  iso,
  dateOnly = false,
  className,
}: {
  iso: string;
  dateOnly?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const [text, setText] = useState(() => format(iso, locale, dateOnly, "UTC"));
  useEffect(() => setText(format(iso, locale, dateOnly)), [iso, locale, dateOnly]);
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}

export function format(iso: string, locale: string, dateOnly: boolean, timeZone?: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const text = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: dateOnly ? undefined : "short",
    timeZone,
  }).format(d);
  return timeZone === "UTC" && !dateOnly ? `${text} UTC` : text;
}
