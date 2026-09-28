import Link from "next/link";
import type { StageProgress } from "@/lib/progress";
import { sectionForStage, sectionHref } from "@/lib/sections";
import { cn } from "@/lib/cn";
import { ProgressBar } from "../ui/ProgressBar";

export function StageProgressList({ matterId, stages, current }: { matterId: number; stages: StageProgress[]; current: number | null }) {
  return (
    <ul className="divide-y divide-slate-100">
      {stages.map((s) => (
        <li key={s.stageNumber}>
          <Link
            href={sectionHref(matterId, sectionForStage(s.stageNumber), `stage-${s.stageNumber}`)}
            className={cn("grid grid-cols-[1.5rem_1fr_7rem_3rem] items-center gap-3 px-5 py-2.5 text-sm hover:bg-slate-50", current === s.stageNumber && "bg-brand-50/50")}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                s.percent === 100 ? "bg-emerald-100 text-emerald-800" : current === s.stageNumber ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              {s.stageNumber}
            </span>
            <span className={cn("truncate", current === s.stageNumber ? "font-medium text-slate-900" : "text-slate-700")}>
              {s.stageName}
              {current === s.stageNumber && <span className="ml-2 text-[11px] font-semibold tracking-wide text-brand-600 uppercase">Current</span>}
            </span>
            <ProgressBar percent={s.percent} size="sm" />
            <span className="text-right text-xs text-slate-500 tabular-nums">
              {s.completed}/{s.total}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
