"use client";

import { useState } from "react";
import { percentOf } from "@/lib/progress";
import { cn } from "@/lib/cn";
import { ChecklistStage } from "./ChecklistStage";
import type { ChecklistStageView } from "./types";

/** Full checklist with stage jump links and an "outstanding only" filter. */
export function ChecklistView({ stages, matterId, addLabels = {} }: { stages: ChecklistStageView[]; matterId: number; addLabels?: Record<number, string> }) {
  const [outstandingOnly, setOutstandingOnly] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {stages.map((s) => {
            const done = s.items.filter((i) => i.completed).length;
            const pct = percentOf(done, s.items.length);
            return (
              <a
                key={s.stageNumber}
                href={`#stage-${s.stageNumber}`}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-brand-200 hover:bg-brand-50",
                  pct === 100 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600",
                )}
              >
                {s.stageNumber}. {s.stageName} <span className="tabular-nums opacity-70">{pct}%</span>
              </a>
            );
          })}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4 accent-brand-700" checked={outstandingOnly} onChange={(e) => setOutstandingOnly(e.target.checked)} />
          Show outstanding only
        </label>
      </div>
      {stages.map((s) => (
        <ChecklistStage
          key={s.stageNumber}
          stage={s}
          matterId={matterId}
          outstandingOnly={outstandingOnly}
          defaultOpen={s.items.some((i) => !i.completed)}
          addLabel={addLabels[s.stageNumber]}
        />
      ))}
    </div>
  );
}
