"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINKS = [
  { href: "/", label: "Generator" },
  { href: "/instructions", label: "Instructions" },
  { href: "/style-guide", label: "Style Guide" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE}/img/logo.png`} alt="InfoBeans" width={120} height={38} className="h-8 w-auto" />
          <span className="hidden border-l border-gray-200 pl-3 text-sm font-medium text-ink-light sm:inline">
            Profile Generator
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "text-brand-500" : "text-ink-light hover:text-ink"
                }`}
              >
                {link.label}
                {active && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand-500" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
