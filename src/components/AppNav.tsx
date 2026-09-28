"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { IconList, IconPlus, IconScale } from "./ui/icons";

const LINKS = [
  { href: "/", label: "Matters", icon: IconScale, match: (p: string) => p === "/" || (p.startsWith("/matters/") && p !== "/matters/new") },
  { href: "/matters/new", label: "New matter", icon: IconPlus, match: (p: string) => p === "/matters/new" },
  { href: "/settings/checklist", label: "Checklist template", icon: IconList, match: (p: string) => p.startsWith("/settings") },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 lg:flex-col" aria-label="Main">
      {LINKS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-brand-100/80 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
