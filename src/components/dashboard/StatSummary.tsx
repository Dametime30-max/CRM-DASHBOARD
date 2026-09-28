import Link from "next/link";
import { cn } from "@/lib/cn";
import { STATUS_GROUPS, type StatusGroupKey } from "@/lib/domain";
import type { DashboardStats } from "@/server/services/dashboard";

function Kpi({ label, value, href, tone, hint }: { label: string; value: number; href: string; tone?: "red" | "amber"; hint: string }) {
  return (
    <Link href={href} className="card group block p-5 transition-colors hover:border-slate-300">
      <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</div>
      <div
        className={cn(
          "mt-2 text-3xl font-semibold tabular-nums",
          value > 0 && tone === "red" ? "text-red-700" : value > 0 && tone === "amber" ? "text-amber-700" : "text-slate-900",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500 group-hover:text-brand-700">{hint}</div>
    </Link>
  );
}

const PIPELINE: StatusGroupKey[] = ["new", "awaitingClient", "drafting", "awaitingExecution", "executed", "closed"];

export function StatSummary({ stats, activeView }: { stats: DashboardStats; activeView?: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Kpi label="Active matters" value={stats.active} href="/" hint="All matters not closed" />
      <Kpi label="Requiring attention" value={stats.attention} href="/?flag=attention" tone="amber" hint="Due soon, urgent or execution approaching" />
      <Kpi label="Overdue" value={stats.overdue} href="/?flag=overdue" tone="red" hint="Next action past its due date" />

      <div className="card p-5 md:col-span-3">
        <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">Matters by stage</div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {PIPELINE.map((key) => (
            <Link
              key={key}
              href={`/?view=${key}`}
              className={cn(
                "rounded-md border px-2 py-2 text-center transition-colors hover:border-brand-200 hover:bg-brand-50",
                activeView === key ? "border-brand-500 bg-brand-50" : "border-slate-200",
              )}
            >
              <div className="text-xl font-semibold text-slate-900 tabular-nums">{stats.groups[key]}</div>
              <div className="mt-0.5 text-xs leading-tight text-slate-500">{STATUS_GROUPS[key].label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
