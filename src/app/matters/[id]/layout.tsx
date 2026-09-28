import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkspace } from "./data";
import { StatusBadge, SampleBadge, UrgencyBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusSelect } from "@/components/matter/StatusSelect";
import { WorkspaceTabs } from "@/components/matter/WorkspaceTabs";
import { IconPencil } from "@/components/ui/icons";
import { formatDate } from "@/lib/dates";
import { WORKSPACE_SECTIONS } from "@/lib/sections";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const ws = await loadWorkspace(id);
  return { title: `${ws.client.fullName} (${ws.matter.matterNumber})` };
}

export default async function MatterLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const { id } = await params;
  const { matter, client, progress, checklist } = await loadWorkspace(id);

  // Outstanding checklist items per checklist-backed section, shown on the tabs.
  const outstandingByStage = new Map<number, number>();
  for (const i of checklist) if (!i.completed) outstandingByStage.set(i.stageNumber, (outstandingByStage.get(i.stageNumber) ?? 0) + 1);
  const counts: Record<string, number> = { checklist: progress.outstanding };
  for (const s of WORKSPACE_SECTIONS) {
    if ("stages" in s) counts[s.key] = s.stages.reduce((n, st) => n + (outstandingByStage.get(st) ?? 0), 0);
  }

  return (
    <div>
      <div className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700 hover:underline">
          Matters
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono text-slate-700">{matter.matterNumber}</span>
      </div>

      <header className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-6 px-6 pt-5 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{client.fullName}</h1>
              {client.preferredName && <span className="text-sm text-slate-500">(“{client.preferredName}”)</span>}
              {matter.isSample && <SampleBadge />}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="font-mono font-medium text-slate-800">{matter.matterNumber}</span>
              <span>{matter.matterType}{matter.willType ? ` — ${matter.willType}` : ""}</span>
              {matter.responsibleLawyer && <span>Lawyer: {matter.responsibleLawyer}</span>}
              <span>Opened {formatDate(matter.dateOpened)}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={matter.status} />
              <UrgencyBadge urgency={matter.urgency} hideNormal />
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <StatusSelect key={matter.status} matterId={matter.id} status={matter.status} />
              <Link href={`/matters/${matter.id}/edit`} className="btn-secondary py-1.5">
                <IconPencil width={14} height={14} /> Edit details
              </Link>
            </div>
            <div className="w-64">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">Progress</span>
                <span className="text-sm text-slate-600">
                  <span className="text-lg font-semibold text-slate-900 tabular-nums">{progress.percent}%</span>
                  <span className="ml-1.5 text-xs">
                    {progress.completed}/{progress.total}
                  </span>
                </span>
              </div>
              <ProgressBar percent={progress.percent} size="lg" />
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 px-4">
          <WorkspaceTabs matterId={matter.id} counts={counts} />
        </div>
      </header>

      {children}
    </div>
  );
}
