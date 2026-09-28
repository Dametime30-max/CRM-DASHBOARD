import { cn } from "@/lib/cn";
import { STATUS_TONE, URGENCY_TONE, type MatterStatus, type Tone, type Urgency } from "@/lib/domain";

const TONES: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-sky-50 text-sky-800 ring-sky-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  violet: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  teal: "bg-teal-50 text-teal-800 ring-teal-200",
};

export function Badge({ tone = "slate", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status as MatterStatus] ?? "slate"}>{status}</Badge>;
}

export function UrgencyBadge({ urgency, hideNormal = false }: { urgency: string; hideNormal?: boolean }) {
  if (hideNormal && (urgency === "Normal" || urgency === "Low")) return null;
  return <Badge tone={URGENCY_TONE[urgency as Urgency] ?? "slate"}>{urgency}</Badge>;
}

export function SampleBadge() {
  return (
    <span className="rounded border border-dashed border-slate-300 px-1.5 py-px text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
      Sample
    </span>
  );
}
