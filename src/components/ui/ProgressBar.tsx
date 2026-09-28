import { cn } from "@/lib/cn";

export function ProgressBar({ percent, size = "md", className }: { percent: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const colour = clamped === 100 ? "bg-emerald-600" : "bg-brand-600";
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-slate-200", size === "sm" ? "h-1.5" : size === "lg" ? "h-2.5" : "h-2", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full rounded-full", colour)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** Compact "68%" + bar, used in tables. */
export function ProgressCell({ percent, completed, total }: { percent: number; completed: number; total: number }) {
  return (
    <div className="flex min-w-28 items-center gap-2" title={`${completed} of ${total} checklist items complete`}>
      <ProgressBar percent={percent} size="sm" className="flex-1" />
      <span className="w-9 text-right text-xs font-medium text-slate-700 tabular-nums">{percent}%</span>
    </div>
  );
}
