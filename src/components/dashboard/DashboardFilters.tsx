"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MATTER_STATUSES, SORT_OPTIONS, STATUS_GROUPS } from "@/lib/domain";
import { IconSearch } from "../ui/icons";

export function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const first = useRef(true);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Debounced search-as-you-type.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => update("q", q.trim()), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters = ["q", "view", "flag", "sort"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
      <div className="relative min-w-56 flex-1">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search client, matter number or lawyer…"
          className="input pl-9"
          aria-label="Search matters"
        />
      </div>
      <select className="input w-auto" value={params.get("view") ?? "active"} onChange={(e) => update("view", e.target.value === "active" ? "" : e.target.value)} aria-label="Status filter">
        <option value="active">All active matters</option>
        <option value="all">All matters (incl. closed)</option>
        <optgroup label="Stage">
          {Object.entries(STATUS_GROUPS).map(([key, g]) => (
            <option key={key} value={key}>
              {g.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Status">
          {MATTER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </optgroup>
      </select>
      <select className="input w-auto" value={params.get("flag") ?? ""} onChange={(e) => update("flag", e.target.value)} aria-label="Attention filter">
        <option value="">Any attention</option>
        <option value="attention">Requiring attention</option>
        <option value="overdue">Overdue</option>
      </select>
      <select className="input w-auto" value={params.get("sort") ?? "updated"} onChange={(e) => update("sort", e.target.value === "updated" ? "" : e.target.value)} aria-label="Sort by">
        {Object.entries(SORT_OPTIONS).map(([k, v]) => (
          <option key={k} value={k}>
            Sort: {v}
          </option>
        ))}
      </select>
      {hasFilters && (
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setQ("");
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
        >
          Clear
        </button>
      )}
      {pending && <span className="text-xs text-slate-400">Updating…</span>}
    </div>
  );
}
