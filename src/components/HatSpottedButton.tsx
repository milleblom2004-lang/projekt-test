"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { HatIcon } from "./HatLogo";

// Large, always-visible call to action. Login is requested on /new if needed.
export function HatSpottedButton() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  if (pathname.startsWith("/new")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1200] flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Link
        href="/new"
        className="pointer-events-auto flex items-center gap-2 rounded-full border-[3px] border-ink bg-hat py-3 pr-7 pl-4 font-display text-2xl font-bold text-white shadow-[0_5px_0_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-hat-dark active:translate-y-1 active:shadow-none"
      >
        <span className="rounded-full bg-white p-1">
          <HatIcon className="h-8 w-8" />
        </span>
        {t("hatSpotted")}
      </Link>
    </div>
  );
}
