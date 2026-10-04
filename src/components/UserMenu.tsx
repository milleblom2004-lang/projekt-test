"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/account";

/** Header menu for signed-in users: My page, Admin (admins only) and Log out. */
export function UserMenu({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = pathname.startsWith("/me") || pathname.startsWith("/admin");

  // Close on navigation, outside click and Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "block w-full px-4 py-2.5 text-left font-semibold hover:bg-sun";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-1.5 py-1.5 transition hover:bg-sun min-[400px]:px-2 sm:px-2.5 ${active ? "bg-ink text-white hover:bg-ink" : ""}`}
      >
        {t("myPage")}
        <svg viewBox="0 0 12 12" className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} aria-hidden>
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div role="menu" className="card absolute right-0 z-10 mt-2 w-44 overflow-hidden !rounded-2xl py-1 text-base text-ink">
          <Link href="/me" role="menuitem" className={item}>{t("myPage")}</Link>
          {isAdmin ? <Link href="/admin" role="menuitem" className={item}>{t("admin")}</Link> : null}
          <form action={signOut} className="border-t-2 border-ink/10">
            <button type="submit" role="menuitem" className={`${item} text-hat-dark`}>{t("logout")}</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
