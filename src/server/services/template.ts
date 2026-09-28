/**
 * Firm checklist template management. Changes here affect NEW matters only;
 * existing matters keep the checklist they were created with.
 */
import { and, asc, eq, max } from "drizzle-orm";
import { getDb, type DB } from "../db/client";
import { checklistTemplateItems, checklistTemplateStages, type TemplateItem, type TemplateStage } from "../db/schema";
import { NotFoundError } from "../errors";
import { logActivity } from "./activity";
import { getCurrentUser } from "../current-user";
import { nowTimestamp } from "@/lib/dates";

export interface TemplateStageWithItems extends TemplateStage {
  items: TemplateItem[];
}

export async function getTemplate(opts: { includeInactive?: boolean } = {}, db: DB = getDb()): Promise<TemplateStageWithItems[]> {
  const stages = db.select().from(checklistTemplateStages).orderBy(asc(checklistTemplateStages.sortOrder)).all();
  const items = db
    .select()
    .from(checklistTemplateItems)
    .where(opts.includeInactive ? undefined : eq(checklistTemplateItems.active, true))
    .orderBy(asc(checklistTemplateItems.sortOrder), asc(checklistTemplateItems.id))
    .all();
  return stages.map((s) => ({ ...s, items: items.filter((i) => i.stageId === s.id) }));
}

export async function addTemplateItem(
  stageId: number,
  input: { label: string; guidance: string | null },
  db: DB = getDb(),
): Promise<void> {
  const stage = db.select().from(checklistTemplateStages).where(eq(checklistTemplateStages.id, stageId)).get();
  if (!stage) throw new NotFoundError("Stage");
  const [{ m }] = db
    .select({ m: max(checklistTemplateItems.sortOrder) })
    .from(checklistTemplateItems)
    .where(eq(checklistTemplateItems.stageId, stageId))
    .all();
  db.transaction((tx) => {
    tx.insert(checklistTemplateItems)
      .values({ stageId, label: input.label, guidance: input.guidance, sortOrder: (m ?? 0) + 10 })
      .run();
    logActivity(tx, { matterId: null, action: "Template item added", detail: `${stage.name}: ${input.label}`, actor: getCurrentUser().name });
  });
}

export async function updateTemplateItem(
  itemId: number,
  input: { label: string; guidance: string | null },
  db: DB = getDb(),
): Promise<void> {
  const res = db
    .update(checklistTemplateItems)
    .set({ label: input.label, guidance: input.guidance, updatedAt: nowTimestamp() })
    .where(eq(checklistTemplateItems.id, itemId))
    .run();
  if (res.changes === 0) throw new NotFoundError("Template item");
}

/** Hide an item from new matters (kept for history) or restore it. */
export async function setTemplateItemActive(itemId: number, active: boolean, db: DB = getDb()): Promise<void> {
  const item = db.select().from(checklistTemplateItems).where(eq(checklistTemplateItems.id, itemId)).get();
  if (!item) throw new NotFoundError("Template item");
  db.transaction((tx) => {
    tx.update(checklistTemplateItems).set({ active, updatedAt: nowTimestamp() }).where(eq(checklistTemplateItems.id, itemId)).run();
    logActivity(tx, {
      matterId: null,
      action: active ? "Template item restored" : "Template item removed",
      detail: item.label,
      actor: getCurrentUser().name,
    });
  });
}

/** Swap an item with its neighbour above (-1) or below (+1) within its stage. */
export async function moveTemplateItem(itemId: number, direction: -1 | 1, db: DB = getDb()): Promise<void> {
  const item = db.select().from(checklistTemplateItems).where(eq(checklistTemplateItems.id, itemId)).get();
  if (!item) throw new NotFoundError("Template item");
  const siblings = db
    .select()
    .from(checklistTemplateItems)
    .where(and(eq(checklistTemplateItems.stageId, item.stageId), eq(checklistTemplateItems.active, true)))
    .orderBy(asc(checklistTemplateItems.sortOrder), asc(checklistTemplateItems.id))
    .all();
  const idx = siblings.findIndex((s) => s.id === itemId);
  const other = siblings[idx + direction];
  if (idx < 0 || !other) return;
  // Renumber the stage so sort orders are unique, then swap the two.
  const reordered = [...siblings];
  [reordered[idx], reordered[idx + direction]] = [reordered[idx + direction], reordered[idx]];
  db.transaction((tx) => {
    reordered.forEach((s, i) => {
      tx.update(checklistTemplateItems).set({ sortOrder: (i + 1) * 10 }).where(eq(checklistTemplateItems.id, s.id)).run();
    });
  });
}
