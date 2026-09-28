import Link from "next/link";
import type { MatterSummary } from "@/server/services/matters";
import { DueLabel } from "../ui/DueLabel";
import { IconAlert, IconArrowRight } from "../ui/icons";

/** Compact list of matters that need attention, shown above the table. */
export function AttentionList({ matters }: { matters: MatterSummary[] }) {
  const flagged = matters
    .filter((m) => m.flags.needsAttention)
    .sort((a, b) => Number(b.flags.overdue) - Number(a.flags.overdue) || (a.importantDate?.date ?? "9").localeCompare(b.importantDate?.date ?? "9"))
    .slice(0, 6);
  if (flagged.length === 0) return null;
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center gap-2">
          <IconAlert className="text-amber-600" /> Requiring attention
        </h2>
        <Link href="/?flag=attention" className="text-xs font-medium text-brand-700 hover:underline">
          View all
        </Link>
      </div>
      <ul className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
        {flagged.map((m) => (
          <li key={m.id} className="md:border-b md:border-slate-100 md:odd:border-r">
            <Link href={`/matters/${m.id}`} className="group flex items-start justify-between gap-3 px-5 py-3 hover:bg-slate-50">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900">
                  {m.clientName} <span className="font-mono text-xs font-normal text-slate-500">{m.matterNumber}</span>
                </div>
                <div className={m.flags.overdue ? "text-xs text-red-700" : "text-xs text-amber-700"}>{m.flags.reasons.join(" · ")}</div>
                {m.nextAction && <div className="truncate text-xs text-slate-500">{m.nextAction}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm">
                {m.importantDate && <DueLabel date={m.importantDate.date} />}
                <IconArrowRight className="text-slate-300 group-hover:text-brand-600" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
