import { cn } from "@/lib/cn";
import { daysBetween, describeDue, formatDate, todayISO } from "@/lib/dates";

/** A date with a relative hint, coloured red when overdue and amber when close. */
export function DueLabel({ date, done = false, className }: { date: string | null | undefined; done?: boolean; className?: string }) {
  if (!date) return <span className="text-slate-400">—</span>;
  const today = todayISO();
  const diff = daysBetween(today, date);
  const tone = done ? "text-slate-500" : diff < 0 ? "text-red-700" : diff <= 3 ? "text-amber-700" : "text-slate-500";
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className="text-slate-800">{formatDate(date)}</span>
      {!done && <span className={cn("ml-1.5 text-xs font-medium", tone)}>{describeDue(date, today)}</span>}
    </span>
  );
}
