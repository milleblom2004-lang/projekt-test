"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} rounded-full px-1.5 py-1.5 min-[400px]:px-2 sm:px-2.5 transition hover:bg-sun ${active ? "bg-ink text-white hover:bg-ink" : ""}`}
    >
      {children}
    </Link>
  );
}
