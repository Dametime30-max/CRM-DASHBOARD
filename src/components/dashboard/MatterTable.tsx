import Link from "next/link";
import type { MatterSummary } from "@/server/services/matters";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { SampleBadge, StatusBadge, UrgencyBadge } from "../ui/Badge";
import { ProgressCell } from "../ui/ProgressBar";
import { DueLabel } from "../ui/DueLabel";
import { IconAlert } from "../ui/icons";

export function MatterTable({ matters }: { matters: MatterSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <th className="py-2.5 pr-3 pl-5 font-medium">Client / matter</th>
            <th className="px-3 py-2.5 font-medium">Lawyer</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Progress</th>
            <th className="px-3 py-2.5 font-medium">Next task</th>
            <th className="px-3 py-2.5 font-medium">Important date</th>
            <th className="py-2.5 pr-5 pl-3 font-medium">Last updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {matters.map((m) => (
            <tr
              key={m.id}
              className={cn(
                "group relative align-top transition-colors hover:bg-slate-50",
                m.flags.overdue && "bg-red-50/30",
              )}
            >
              <td className="py-3 pr-3 pl-5">
                <span className={cn("absolute inset-y-0 left-0 w-0.5", m.flags.overdue ? "bg-red-500" : m.flags.needsAttention ? "bg-amber-400" : "bg-transparent")} />
                <Link
                  href={`/matters/${m.id}`}
                  className="font-medium text-slate-900 group-hover:text-brand-700 after:absolute after:inset-0 after:content-['']"
                >
                  {m.clientName}
                </Link>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-mono">{m.matterNumber}</span>
                  <span>·</span>
                  <span>{m.matterType}</span>
                  {m.isSample && <SampleBadge />}
                </div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-slate-700">{m.responsibleLawyer ?? <span className="text-slate-400">—</span>}</td>
              <td className="px-3 py-3">
                <div className="flex flex-col items-start gap-1">
                  <StatusBadge status={m.status} />
                  <UrgencyBadge urgency={m.urgency} hideNormal />
                </div>
              </td>
              <td className="px-3 py-3">
                <ProgressCell percent={m.percent} completed={m.completedItems} total={m.totalItems} />
              </td>
              <td className="max-w-64 px-3 py-3">
                {m.nextAction ? (
                  <span className="line-clamp-2 text-slate-800">{m.nextAction}</span>
                ) : m.nextChecklistItem ? (
                  <span className="line-clamp-2 text-slate-600">
                    <span className="text-slate-400">Checklist: </span>
                    {m.nextChecklistItem}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-3 py-3">
                {m.importantDate ? (
                  <div>
                    <div className="text-xs text-slate-500">{m.importantDate.label}</div>
                    <DueLabel date={m.importantDate.date} done={m.status === "Closed"} />
                  </div>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
                {m.flags.reasons.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                    <IconAlert width={12} height={12} />
                    {m.flags.reasons[0]}
                  </div>
                )}
              </td>
              <td className="py-3 pr-5 pl-3 text-xs whitespace-nowrap text-slate-500">{formatDateTime(m.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
