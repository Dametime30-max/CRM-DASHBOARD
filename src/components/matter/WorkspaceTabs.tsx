"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { sectionHref, WORKSPACE_SECTIONS } from "@/lib/sections";

export function WorkspaceTabs({ matterId, counts }: { matterId: number; counts: Partial<Record<string, number>> }) {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Matter sections">
      {WORKSPACE_SECTIONS.map((s) => {
        const href = sectionHref(matterId, s.key);
        const active = pathname === href;
        const count = counts[s.key];
        return (
          <Link
            key={s.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "border-brand-600 text-brand-800" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
            )}
          >
            {s.label}
            {count !== undefined && count > 0 && (
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-brand-100 text-brand-800" : "bg-slate-100 text-slate-600")}>
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
