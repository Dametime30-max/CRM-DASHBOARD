import Link from "next/link";
import { loadWorkspace } from "./data";
import { AttentionPanel } from "@/components/matter/AttentionPanel";
import { StageProgressList } from "@/components/matter/StageProgressList";
import { ActivityList } from "@/components/matter/ActivityList";
import { DetailList } from "@/components/ui/DetailList";
import { DueLabel } from "@/components/ui/DueLabel";
import { matterAttention } from "@/lib/attention";
import { currentStage } from "@/lib/progress";
import { formatDate } from "@/lib/dates";
import { sectionForStage, sectionHref } from "@/lib/sections";

export default async function MatterOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { matter, client, checklist, progress, activity } = await loadWorkspace(id);

  const incomplete = checklist.filter((i) => !i.completed);
  const attention = matterAttention({ ...matter, incompleteChecklist: incomplete });
  const stage = currentStage(progress);
  const next = incomplete[0];
  const resume = next
    ? { label: next.label, stage: next.stageName, href: sectionHref(matter.id, sectionForStage(next.stageNumber), `item-${next.id}`) }
    : null;
  const closed = matter.status === "Closed";

  return (
    <div className="space-y-6">
      <AttentionPanel matterId={matter.id} items={attention} resume={closed ? null : resume} closed={closed} />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="card-header">
            <h2 className="card-title">Progress by stage</h2>
            <span className="text-xs text-slate-500">
              {progress.outstanding} outstanding of {progress.total}
            </span>
          </div>
          <StageProgressList matterId={matter.id} stages={progress.stages} current={stage?.stageNumber ?? null} />
        </section>

        <section className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Key details</h2>
            <Link href={`/matters/${matter.id}/edit`} className="text-xs font-medium text-brand-700 hover:underline">
              Edit
            </Link>
          </div>
          <DetailList
            items={[
              { label: "Next action", value: matter.nextAction },
              { label: "Due", value: matter.nextActionDue ? <DueLabel date={matter.nextActionDue} /> : null },
              { label: "Proposed execution", value: matter.proposedExecutionDate ? <DueLabel date={matter.proposedExecutionDate} done={["Executed", "Post-Execution", "Closed"].includes(matter.status)} /> : null },
              { label: "Description", value: matter.description },
              { label: "Phone", value: client.phone },
              { label: "Email", value: client.email },
              { label: "Date of birth", value: client.dateOfBirth ? formatDate(client.dateOfBirth) : null },
            ]}
          />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="card-header">
            <h2 className="card-title">Family / estate overview</h2>
            <Link href={`/matters/${matter.id}/estate`} className="text-xs font-medium text-brand-700 hover:underline">
              Open estate section
            </Link>
          </div>
          <DetailList
            items={[
              { label: "Spouse / partner", value: matter.spousePartner },
              { label: "Children", value: matter.children },
              { label: "Other beneficiaries", value: matter.otherBeneficiaries },
              { label: "Family notes", value: matter.familyNotes },
            ]}
          />
        </section>
        <section className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Recent activity</h2>
          </div>
          <ActivityList entries={activity} />
        </section>
      </div>
    </div>
  );
}
