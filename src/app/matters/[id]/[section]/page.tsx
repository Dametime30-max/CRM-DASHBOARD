import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "../data";
import { ChecklistStage } from "@/components/checklist/ChecklistStage";
import { ChecklistView } from "@/components/checklist/ChecklistView";
import { groupByStage, toItemView } from "@/components/checklist/types";
import { DetailList } from "@/components/ui/DetailList";
import { DueLabel } from "@/components/ui/DueLabel";
import { IconInfo } from "@/components/ui/icons";
import { formatDate } from "@/lib/dates";
import { WORKSPACE_SECTIONS } from "@/lib/sections";
import type { MatterWorkspace } from "@/server/services/matters";

type Params = Promise<{ id: string; section: string }>;

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EditLink({ id }: { id: number }) {
  return (
    <Link href={`/matters/${id}/edit`} className="text-xs font-medium text-brand-700 hover:underline">
      Edit
    </Link>
  );
}

function ComingSoon({ phase, children }: { phase: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-600">
      <IconInfo className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <span className="font-medium text-slate-800">Planned for Phase {phase}. </span>
        {children}
      </div>
    </div>
  );
}

function Stages({ ws, stageNumbers, addLabels = {} }: { ws: MatterWorkspace; stageNumbers: number[]; addLabels?: Record<number, string> }) {
  const stages = groupByStage(ws.checklist.map(toItemView)).filter((s) => stageNumbers.includes(s.stageNumber));
  return (
    <>
      {stages.map((s) => (
        <ChecklistStage key={s.stageNumber} stage={s} matterId={ws.matter.id} addLabel={addLabels[s.stageNumber]} />
      ))}
    </>
  );
}

export default async function MatterSectionPage({ params }: { params: Params }) {
  const { id, section } = await params;
  if (!WORKSPACE_SECTIONS.some((s) => s.key === section && s.key !== "overview")) notFound();
  const ws = await loadWorkspace(id);
  const { matter, client } = ws;
  const executed = ["Executed", "Post-Execution", "Closed"].includes(matter.status);

  switch (section) {
    case "instructions":
      return (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Client" action={<EditLink id={matter.id} />}>
              <DetailList
                items={[
                  { label: "Full name", value: client.fullName },
                  { label: "Preferred name", value: client.preferredName },
                  { label: "Date of birth", value: client.dateOfBirth ? formatDate(client.dateOfBirth) : null },
                  { label: "Address", value: client.address },
                  { label: "Phone", value: client.phone },
                  { label: "Email", value: client.email },
                ]}
              />
            </Card>
            <Card title="Matter & Will details" action={<EditLink id={matter.id} />}>
              <DetailList
                items={[
                  { label: "Description", value: matter.description },
                  { label: "Responsible lawyer", value: matter.responsibleLawyer },
                  { label: "Date opened", value: formatDate(matter.dateOpened) },
                  { label: "Urgency", value: matter.urgency },
                  { label: "Next action", value: matter.nextAction },
                  { label: "Next action due", value: matter.nextActionDue ? <DueLabel date={matter.nextActionDue} /> : null },
                  { label: "Instructions", value: matter.willType },
                  { label: "Existing Will date", value: matter.existingWillDate ? formatDate(matter.existingWillDate) : null },
                  { label: "Previous solicitor", value: matter.previousSolicitor },
                ]}
              />
            </Card>
          </div>
          <Stages ws={ws} stageNumbers={[1]} />
        </div>
      );

    case "estate":
      return (
        <div className="space-y-6">
          <Card title="Family / estate overview" action={<EditLink id={matter.id} />}>
            <DetailList
              items={[
                { label: "Spouse / partner", value: matter.spousePartner },
                { label: "Children", value: matter.children },
                { label: "Other beneficiaries", value: matter.otherBeneficiaries },
                { label: "Family notes", value: matter.familyNotes },
              ]}
            />
          </Card>
          <p className="text-sm text-slate-500">
            Use the note button on each asset to record details (ownership, values, fund names). Add further assets with “Add asset”.
          </p>
          <Stages ws={ws} stageNumbers={[2, 3]} addLabels={{ 2: "Add asset", 3: "Add planning item" }} />
        </div>
      );

    case "checklist":
      return <ChecklistView stages={groupByStage(ws.checklist.map(toItemView))} matterId={matter.id} addLabels={{ 2: "Add asset" }} />;

    case "drafting":
      return (
        <div className="space-y-6">
          <Stages ws={ws} stageNumbers={[4, 5]} />
        </div>
      );

    case "execution":
      return (
        <div className="space-y-6">
          <Card title="Execution" action={<EditLink id={matter.id} />}>
            <DetailList
              items={[
                { label: "Proposed execution", value: matter.proposedExecutionDate ? <DueLabel date={matter.proposedExecutionDate} done={executed} /> : null },
                { label: "Status", value: matter.status },
              ]}
            />
          </Card>
          <Stages ws={ws} stageNumbers={[6, 7]} />
        </div>
      );

    case "tasks":
      return (
        <div className="space-y-6">
          <ComingSoon phase={2}>
            Matter-specific tasks with category, assignee, priority, due date and status (including “Waiting on client” and
            “Waiting on third party”). Until then, use the matter’s next action and custom checklist items.
          </ComingSoon>
          <Card title="Current next action" action={<EditLink id={matter.id} />}>
            <DetailList
              items={[
                { label: "Next action", value: matter.nextAction },
                { label: "Due", value: matter.nextActionDue ? <DueLabel date={matter.nextActionDue} /> : null },
              ]}
            />
          </Card>
        </div>
      );

    case "dates": {
      const dates = [
        { label: "Date opened", value: matter.dateOpened, done: true },
        { label: "Existing Will date", value: matter.existingWillDate, done: true },
        { label: "Next action due", value: matter.nextActionDue, done: false },
        { label: "Proposed execution", value: matter.proposedExecutionDate, done: executed },
      ].filter((d) => d.value);
      return (
        <div className="space-y-6">
          <ComingSoon phase={2}>
            A matter timeline with instruction, draft sent, client response, execution, follow-up, review and custom dates, plus
            upcoming/overdue highlighting. Dates already recorded on the matter are shown below.
          </ComingSoon>
          <Card title="Recorded dates" action={<EditLink id={matter.id} />}>
            {dates.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">No dates recorded.</p>
            ) : (
              <DetailList items={dates.map((d) => ({ label: d.label, value: <DueLabel date={d.value} done={d.done} /> }))} />
            )}
          </Card>
        </div>
      );
    }

    case "notes": {
      const itemNotes = ws.checklist.filter((i) => i.notes);
      return (
        <div className="space-y-6">
          <ComingSoon phase={2}>
            Timestamped free-text file notes that can be edited and deleted. In the meantime, notes recorded against checklist items
            are collected below.
          </ComingSoon>
          <Card title="Family notes" action={<EditLink id={matter.id} />}>
            <p className="px-5 py-4 text-sm whitespace-pre-wrap text-slate-800">{matter.familyNotes || <span className="text-slate-400">None recorded.</span>}</p>
          </Card>
          <Card title={`Checklist item notes (${itemNotes.length})`}>
            {itemNotes.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">No checklist notes yet. Use the note button on any checklist item.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {itemNotes.map((i) => (
                  <li key={i.id} className="px-5 py-3">
                    <div className="text-xs text-slate-500">
                      Stage {i.stageNumber} — {i.stageName} · <span className="font-medium text-slate-700">{i.label}</span>
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">{i.notes}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      );
    }

    case "documents":
      return (
        <ComingSoon phase={3}>
          A register of documents for this matter (existing Will, draft and final Wills, correspondence, ID, estate planning
          documents). The first version will record document details only. It will not store files, which stay in the firm&apos;s
          document management system.
        </ComingSoon>
      );

    default:
      notFound();
  }
}
