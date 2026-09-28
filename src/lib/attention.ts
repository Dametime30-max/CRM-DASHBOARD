/**
 * Rules for "what needs attention". Pure functions so they are easy to test
 * and easy to extend (Phase 2 adds tasks and key dates as further sources).
 */
import { daysBetween, todayISO } from "./dates";
import { isActiveStatus } from "./domain";

export const DUE_SOON_DAYS = 7;
export const ATTENTION_DUE_DAYS = 3;
export const EXECUTION_SOON_DAYS = 14;

const EXECUTED_STATUSES = new Set(["Executed", "Post-Execution", "Closed"]);

export interface MatterFlagsInput {
  status: string;
  urgency: string;
  nextActionDue: string | null;
  proposedExecutionDate: string | null;
}

export interface MatterFlags {
  overdue: boolean;
  dueSoon: boolean;
  executionSoon: boolean;
  needsAttention: boolean;
  reasons: string[];
}

export function matterFlags(m: MatterFlagsInput, today: string = todayISO()): MatterFlags {
  const reasons: string[] = [];
  if (!isActiveStatus(m.status)) {
    return { overdue: false, dueSoon: false, executionSoon: false, needsAttention: false, reasons };
  }

  const dueIn = m.nextActionDue ? daysBetween(today, m.nextActionDue) : null;
  const overdue = dueIn !== null && dueIn < 0;
  const dueSoon = dueIn !== null && dueIn >= 0 && dueIn <= DUE_SOON_DAYS;

  const execIn = m.proposedExecutionDate ? daysBetween(today, m.proposedExecutionDate) : null;
  const executionSoon =
    execIn !== null && execIn <= EXECUTION_SOON_DAYS && !EXECUTED_STATUSES.has(m.status);

  if (overdue) reasons.push("Next action overdue");
  else if (dueIn !== null && dueIn <= ATTENTION_DUE_DAYS) reasons.push("Next action due soon");
  if (m.urgency === "Urgent") reasons.push("Marked urgent");
  if (executionSoon) {
    reasons.push(execIn! < 0 ? "Proposed execution date has passed" : "Execution approaching");
  }

  return { overdue, dueSoon, executionSoon, needsAttention: reasons.length > 0, reasons };
}

export type AttentionSeverity = "critical" | "warning" | "info";

export interface AttentionItem {
  kind: "overdue" | "due-soon" | "date" | "checklist";
  severity: AttentionSeverity;
  title: string;
  detail?: string;
  date?: string | null;
  /** Workspace section to jump to, e.g. "checklist". */
  section?: string;
  anchor?: string;
}

export interface MatterAttentionInput extends MatterFlagsInput {
  nextAction: string | null;
  incompleteChecklist: { id: number; label: string; stageNumber: number; stageName: string }[];
}

/** Build the ordered "What needs my attention?" list for a single matter. */
export function matterAttention(
  m: MatterAttentionInput,
  today: string = todayISO(),
  checklistLimit = 5,
): AttentionItem[] {
  const items: AttentionItem[] = [];
  if (!isActiveStatus(m.status)) return items;

  if (m.nextActionDue) {
    const dueIn = daysBetween(today, m.nextActionDue);
    if (dueIn < 0) {
      items.push({
        kind: "overdue",
        severity: "critical",
        title: m.nextAction || "Next action",
        detail: "Next action is overdue",
        date: m.nextActionDue,
        section: "instructions",
      });
    } else if (dueIn <= DUE_SOON_DAYS) {
      items.push({
        kind: "due-soon",
        severity: dueIn <= ATTENTION_DUE_DAYS ? "warning" : "info",
        title: m.nextAction || "Next action",
        detail: "Next action due soon",
        date: m.nextActionDue,
        section: "instructions",
      });
    }
  }

  if (m.proposedExecutionDate && !EXECUTED_STATUSES.has(m.status)) {
    const execIn = daysBetween(today, m.proposedExecutionDate);
    if (execIn < 0) {
      items.push({
        kind: "date",
        severity: "critical",
        title: "Proposed execution date has passed",
        detail: "Update the execution date or matter status",
        date: m.proposedExecutionDate,
        section: "execution",
      });
    } else if (execIn <= EXECUTION_SOON_DAYS) {
      items.push({
        kind: "date",
        severity: execIn <= ATTENTION_DUE_DAYS ? "warning" : "info",
        title: "Proposed execution",
        detail: "Signing appointment approaching",
        date: m.proposedExecutionDate,
        section: "execution",
      });
    }
  }

  for (const c of m.incompleteChecklist.slice(0, checklistLimit)) {
    items.push({
      kind: "checklist",
      severity: "info",
      title: c.label,
      detail: `Stage ${c.stageNumber} — ${c.stageName}`,
      section: "checklist",
      anchor: `item-${c.id}`,
    });
  }

  return items;
}
