"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-2 py-1.5 sm:px-2.5 transition hover:bg-sun ${active ? "bg-ink text-white hover:bg-ink" : ""}`}
    >
      {children}
    </Link>
  );
}
