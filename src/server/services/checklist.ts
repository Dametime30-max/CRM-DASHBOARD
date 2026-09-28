/**
 * A matter's own checklist. Items can be completed, annotated, renamed,
 * added (custom) and removed without affecting the firm template.
 */
import { and, eq, max } from "drizzle-orm";
import { getDb, type DB } from "../db/client";
import { matterChecklistItems, type ChecklistItem } from "../db/schema";
import { DomainError, NotFoundError } from "../errors";
import { getCurrentUser } from "../current-user";
import { logActivity } from "./activity";
import { touchMatter } from "./matters";
import { nowTimestamp } from "@/lib/dates";

function getItem(db: DB, itemId: number): ChecklistItem {
  const item = db.select().from(matterChecklistItems).where(eq(matterChecklistItems.id, itemId)).get();
  if (!item) throw new NotFoundError("Checklist item");
  return item;
}

export async function setChecklistItemCompleted(itemId: number, completed: boolean, db: DB = getDb()): Promise<ChecklistItem> {
  const item = getItem(db, itemId);
  if (item.completed === completed) return item;
  const actor = getCurrentUser().name;
  const now = nowTimestamp();
  return db.transaction((tx) => {
    const updated = tx
      .update(matterChecklistItems)
      .set({
        completed,
        completedAt: completed ? now : null,
        completedBy: completed ? actor : null,
        updatedAt: now,
        updatedBy: actor,
      })
      .where(eq(matterChecklistItems.id, itemId))
      .returning()
      .get();
    touchMatter(tx, item.matterId, actor);
    logActivity(tx, {
      matterId: item.matterId,
      action: completed ? "Checklist item completed" : "Checklist item reopened",
      detail: item.label,
      actor,
    });
    return updated;
  });
}

export async function updateChecklistItem(
  itemId: number,
  patch: { label?: string; notes?: string | null },
  db: DB = getDb(),
): Promise<void> {
  const item = getItem(db, itemId);
  const actor = getCurrentUser().name;
  db.transaction((tx) => {
    tx.update(matterChecklistItems)
      .set({
        ...(patch.label !== undefined ? { label: patch.label } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        updatedAt: nowTimestamp(),
        updatedBy: actor,
      })
      .where(eq(matterChecklistItems.id, itemId))
      .run();
    touchMatter(tx, item.matterId, actor);
    if (patch.label !== undefined && patch.label !== item.label) {
      logActivity(tx, { matterId: item.matterId, action: "Checklist item renamed", detail: `${item.label} → ${patch.label}`, actor });
    }
  });
}

export async function addCustomChecklistItem(
  matterId: number,
  stageNumber: number,
  label: string,
  db: DB = getDb(),
): Promise<number> {
  const stageRow = db
    .select({ stageName: matterChecklistItems.stageName, m: max(matterChecklistItems.sortOrder) })
    .from(matterChecklistItems)
    .where(and(eq(matterChecklistItems.matterId, matterId), eq(matterChecklistItems.stageNumber, stageNumber)))
    .get();
  if (!stageRow?.stageName) throw new DomainError("That stage does not exist on this matter");
  const actor = getCurrentUser().name;
  return db.transaction((tx) => {
    const row = tx
      .insert(matterChecklistItems)
      .values({
        matterId,
        stageNumber,
        stageName: stageRow.stageName,
        label,
        sortOrder: (stageRow.m ?? 0) + 10,
        isCustom: true,
        updatedBy: actor,
      })
      .returning({ id: matterChecklistItems.id })
      .get();
    touchMatter(tx, matterId, actor);
    logActivity(tx, { matterId, action: "Checklist item added", detail: `${stageRow.stageName}: ${label}`, actor });
    return row.id;
  });
}

export async function deleteChecklistItem(itemId: number, db: DB = getDb()): Promise<void> {
  const item = getItem(db, itemId);
  const remaining = db
    .select({ id: matterChecklistItems.id })
    .from(matterChecklistItems)
    .where(and(eq(matterChecklistItems.matterId, item.matterId), eq(matterChecklistItems.stageNumber, item.stageNumber)))
    .all();
  // Keep at least one item so the stage (and its "add item" control) remains.
  if (remaining.length <= 1) throw new DomainError("A stage must keep at least one item. Rename this item instead.");
  const actor = getCurrentUser().name;
  db.transaction((tx) => {
    tx.delete(matterChecklistItems).where(eq(matterChecklistItems.id, itemId)).run();
    touchMatter(tx, item.matterId, actor);
    logActivity(tx, { matterId: item.matterId, action: "Checklist item removed", detail: item.label, actor });
  });
}
