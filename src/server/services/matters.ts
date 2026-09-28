/**
 * Matter service: the only place that reads/writes clients and matters.
 *
 * Functions are async even though SQLite is synchronous, so callers will not
 * need to change if the database moves to PostgreSQL later.
 */
import { and, asc, eq, like, sql } from "drizzle-orm";
import { getDb, type DB } from "../db/client";
import {
  checklistTemplateItems,
  checklistTemplateStages,
  clients,
  matterChecklistItems,
  matters,
  type ChecklistItem,
  type Client,
  type Matter,
} from "../db/schema";
import { DomainError, NotFoundError } from "../errors";
import { getCurrentUser } from "../current-user";
import { listMatterActivity, logActivity } from "./activity";
import { computeProgress, percentOf, type Progress } from "@/lib/progress";
import { matterFlags, type MatterFlags } from "@/lib/attention";
import { nowTimestamp, todayISO } from "@/lib/dates";
import type { MatterInput } from "@/lib/validation";
import type { MatterStatus, Urgency } from "@/lib/domain";

export interface MatterSummary {
  id: number;
  matterNumber: string;
  matterType: string;
  clientName: string;
  preferredName: string | null;
  responsibleLawyer: string | null;
  status: MatterStatus;
  urgency: Urgency;
  description: string | null;
  percent: number;
  completedItems: number;
  totalItems: number;
  nextAction: string | null;
  nextActionDue: string | null;
  nextChecklistItem: string | null;
  proposedExecutionDate: string | null;
  importantDate: { label: string; date: string } | null;
  updatedAt: string;
  isSample: boolean;
  flags: MatterFlags;
}

/** Choose the single most relevant date to show on the dashboard. */
export function pickImportantDate(
  m: { nextActionDue: string | null; proposedExecutionDate: string | null; status: string },
  today: string = todayISO(),
): { label: string; date: string } | null {
  const candidates: { label: string; date: string }[] = [];
  if (m.nextActionDue) candidates.push({ label: "Next action", date: m.nextActionDue });
  if (m.proposedExecutionDate && !["Executed", "Post-Execution", "Closed"].includes(m.status)) {
    candidates.push({ label: "Execution", date: m.proposedExecutionDate });
  }
  if (candidates.length === 0) return null;
  // Overdue dates first (earliest), otherwise the soonest upcoming date.
  candidates.sort((a, b) => a.date.localeCompare(b.date));
  const overdue = candidates.find((c) => c.date < today);
  return overdue ?? candidates[0];
}

export async function listMatterSummaries(db: DB = getDb()): Promise<MatterSummary[]> {
  const rows = db
    .select({ matter: matters, client: clients })
    .from(matters)
    .innerJoin(clients, eq(matters.clientId, clients.id))
    .all();

  const counts = db
    .select({
      matterId: matterChecklistItems.matterId,
      total: sql<number>`count(*)`,
      done: sql<number>`sum(case when ${matterChecklistItems.completed} then 1 else 0 end)`,
    })
    .from(matterChecklistItems)
    .groupBy(matterChecklistItems.matterId)
    .all();
  const countMap = new Map(counts.map((c) => [c.matterId, c]));

  // First incomplete checklist item per matter (by stage, then order).
  const incomplete = db
    .select({
      matterId: matterChecklistItems.matterId,
      label: matterChecklistItems.label,
    })
    .from(matterChecklistItems)
    .where(eq(matterChecklistItems.completed, false))
    .orderBy(asc(matterChecklistItems.matterId), asc(matterChecklistItems.stageNumber), asc(matterChecklistItems.sortOrder), asc(matterChecklistItems.id))
    .all();
  const nextItem = new Map<number, string>();
  for (const i of incomplete) if (!nextItem.has(i.matterId)) nextItem.set(i.matterId, i.label);

  const today = todayISO();
  return rows.map(({ matter: m, client: c }) => {
    const cnt = countMap.get(m.id);
    const total = cnt?.total ?? 0;
    const done = Number(cnt?.done ?? 0);
    return {
      id: m.id,
      matterNumber: m.matterNumber,
      matterType: m.matterType,
      clientName: c.fullName,
      preferredName: c.preferredName,
      responsibleLawyer: m.responsibleLawyer,
      status: m.status as MatterStatus,
      urgency: m.urgency as Urgency,
      description: m.description,
      percent: percentOf(done, total),
      completedItems: done,
      totalItems: total,
      nextAction: m.nextAction,
      nextActionDue: m.nextActionDue,
      nextChecklistItem: nextItem.get(m.id) ?? null,
      proposedExecutionDate: m.proposedExecutionDate,
      importantDate: pickImportantDate(m, today),
      updatedAt: m.updatedAt,
      isSample: m.isSample,
      flags: matterFlags(m, today),
    };
  });
}

export interface MatterWorkspace {
  matter: Matter;
  client: Client;
  checklist: ChecklistItem[];
  progress: Progress;
  activity: Awaited<ReturnType<typeof listMatterActivity>>;
}

export async function getMatterWorkspace(id: number, db: DB = getDb()): Promise<MatterWorkspace | null> {
  const row = db
    .select({ matter: matters, client: clients })
    .from(matters)
    .innerJoin(clients, eq(matters.clientId, clients.id))
    .where(eq(matters.id, id))
    .get();
  if (!row) return null;
  const checklist = db
    .select()
    .from(matterChecklistItems)
    .where(eq(matterChecklistItems.matterId, id))
    .orderBy(asc(matterChecklistItems.stageNumber), asc(matterChecklistItems.sortOrder), asc(matterChecklistItems.id))
    .all();
  return {
    matter: row.matter,
    client: row.client,
    checklist,
    progress: computeProgress(checklist),
    activity: listMatterActivity(db, id),
  };
}

export async function matterNumberExists(matterNumber: string, excludeId?: number, db: DB = getDb()): Promise<boolean> {
  const hit = db
    .select({ id: matters.id })
    .from(matters)
    .where(sql`lower(${matters.matterNumber}) = lower(${matterNumber})`)
    .get();
  return !!hit && hit.id !== excludeId;
}

/** Suggest the next matter number in the form W-YYYY-NNNN. */
export async function suggestMatterNumber(db: DB = getDb()): Promise<string> {
  const year = todayISO().slice(0, 4);
  const prefix = `W-${year}-`;
  const rows = db.select({ n: matters.matterNumber }).from(matters).where(like(matters.matterNumber, `${prefix}%`)).all();
  const maxSeq = rows.reduce((acc, r) => {
    const seq = Number.parseInt(r.n.slice(prefix.length), 10);
    return Number.isFinite(seq) && seq > acc ? seq : acc;
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

function clientValues(input: MatterInput) {
  return {
    fullName: input.fullName,
    preferredName: input.preferredName,
    dateOfBirth: input.dateOfBirth,
    address: input.address,
    phone: input.phone,
    email: input.email,
  };
}

function matterValues(input: MatterInput) {
  return {
    matterNumber: input.matterNumber,
    description: input.description,
    responsibleLawyer: input.responsibleLawyer,
    dateOpened: input.dateOpened,
    status: input.status,
    urgency: input.urgency,
    nextAction: input.nextAction,
    nextActionDue: input.nextActionDue,
    willType: input.willType,
    existingWillDate: input.existingWillDate,
    previousSolicitor: input.previousSolicitor,
    proposedExecutionDate: input.proposedExecutionDate,
    spousePartner: input.spousePartner,
    children: input.children,
    otherBeneficiaries: input.otherBeneficiaries,
    familyNotes: input.familyNotes,
  };
}

/**
 * Create a client + matter and copy the active checklist template onto it.
 * Returns the new matter id.
 */
export async function createMatter(
  input: MatterInput,
  opts: { isSample?: boolean } = {},
  db: DB = getDb(),
): Promise<number> {
  if (await matterNumberExists(input.matterNumber, undefined, db)) {
    throw new DomainError("A matter with this number already exists", "matterNumber");
  }
  const actor = getCurrentUser().name;

  const template = db
    .select({ item: checklistTemplateItems, stage: checklistTemplateStages })
    .from(checklistTemplateItems)
    .innerJoin(checklistTemplateStages, eq(checklistTemplateItems.stageId, checklistTemplateStages.id))
    .where(eq(checklistTemplateItems.active, true))
    .orderBy(asc(checklistTemplateStages.sortOrder), asc(checklistTemplateItems.sortOrder), asc(checklistTemplateItems.id))
    .all();

  return db.transaction((tx) => {
    const client = tx.insert(clients).values(clientValues(input)).returning({ id: clients.id }).get();
    const matter = tx
      .insert(matters)
      .values({
        ...matterValues(input),
        dateOpened: input.dateOpened ?? todayISO(),
        clientId: client.id,
        matterType: "Will",
        isSample: opts.isSample ?? false,
        updatedBy: actor,
      })
      .returning({ id: matters.id })
      .get();

    if (template.length > 0) {
      tx.insert(matterChecklistItems)
        .values(
          template.map(({ item, stage }) => ({
            matterId: matter.id,
            templateItemId: item.id,
            stageNumber: stage.sortOrder,
            stageName: stage.name,
            label: item.label,
            guidance: item.guidance,
            sortOrder: item.sortOrder,
          })),
        )
        .run();
    }

    logActivity(tx, { matterId: matter.id, action: "Matter created", detail: input.matterNumber, actor });
    return matter.id;
  });
}

export async function updateMatter(id: number, input: MatterInput, db: DB = getDb()): Promise<void> {
  const existing = db.select().from(matters).where(eq(matters.id, id)).get();
  if (!existing) throw new NotFoundError("Matter");
  if (await matterNumberExists(input.matterNumber, id, db)) {
    throw new DomainError("A matter with this number already exists", "matterNumber");
  }
  const actor = getCurrentUser().name;
  const now = nowTimestamp();
  db.transaction((tx) => {
    tx.update(clients).set({ ...clientValues(input), updatedAt: now }).where(eq(clients.id, existing.clientId)).run();
    tx.update(matters)
      .set({ ...matterValues(input), updatedAt: now, updatedBy: actor })
      .where(eq(matters.id, id))
      .run();
    logActivity(tx, { matterId: id, action: "Matter details updated", actor });
    if (existing.status !== input.status) {
      logActivity(tx, { matterId: id, action: "Status changed", detail: `${existing.status} → ${input.status}`, actor });
    }
  });
}

export async function updateMatterStatus(id: number, status: MatterStatus, db: DB = getDb()): Promise<void> {
  const existing = db.select().from(matters).where(eq(matters.id, id)).get();
  if (!existing) throw new NotFoundError("Matter");
  if (existing.status === status) return;
  const actor = getCurrentUser().name;
  db.transaction((tx) => {
    tx.update(matters).set({ status, updatedAt: nowTimestamp(), updatedBy: actor }).where(eq(matters.id, id)).run();
    logActivity(tx, { matterId: id, action: "Status changed", detail: `${existing.status} → ${status}`, actor });
  });
}

/** Mark a matter as recently worked on (used by child records such as checklist items). */
export function touchMatter(exec: Pick<DB, "update">, matterId: number, actor: string): void {
  exec.update(matters).set({ updatedAt: nowTimestamp(), updatedBy: actor }).where(and(eq(matters.id, matterId))).run();
}
