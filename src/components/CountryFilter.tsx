"use client";

import { useRouter } from "next/navigation";

export function CountryFilter({
  value,
  options,
  label,
  allLabel,
  baseHref,
}: {
  value: string | null;
  options: { code: string; name: string; count: number }[];
  label: string;
  allLabel: string;
  baseHref: string;
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => {
          const url = new URL(baseHref, window.location.origin);
          if (e.target.value) url.searchParams.set("country", e.target.value);
          router.push(url.pathname + url.search);
        }}
        className="rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm font-bold shadow-chunky-sm"
      >
        <option value="">🌍 {allLabel}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name} ({o.count})
          </option>
        ))}
      </select>
    </label>
  );
}
