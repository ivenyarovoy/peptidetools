"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dosage", label: "Dosage" },
  { href: "/mixing", label: "Mixing" },
  { href: "/partners", label: "Partners" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 sm:gap-2">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-sky-500/15 text-sky-300"
                : "text-slate-300 hover:bg-slate-800 hover:text-sky-300"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
