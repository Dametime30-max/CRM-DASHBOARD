"use client";

import { useState, useTransition } from "react";
import { setMatterStatusAction } from "@/app/actions";
import { MATTER_STATUSES } from "@/lib/domain";

/** Inline status changer in the matter header. */
export function StatusSelect({ matterId, status }: { matterId: number; status: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="matter-status" className="sr-only">
        Matter status
      </label>
      <select
        id="matter-status"
        className="input w-auto py-1.5 text-sm font-medium"
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setError(null);
          startTransition(async () => {
            const res = await setMatterStatusAction(matterId, next);
            if (!res.ok) setError(res.error);
          });
        }}
      >
        {MATTER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {pending && <span className="text-xs text-slate-400">Saving…</span>}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
