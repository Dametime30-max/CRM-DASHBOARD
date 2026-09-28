import { desc, eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { activityLog } from "../db/schema";

/** Anything that can run a query: the db itself or a transaction. */
type Executor = Pick<DB, "insert">;

export function logActivity(
  exec: Executor,
  entry: { matterId: number | null; action: string; detail?: string | null; actor: string },
): void {
  exec
    .insert(activityLog)
    .values({ matterId: entry.matterId, action: entry.action, detail: entry.detail ?? null, actor: entry.actor })
    .run();
}

export function listMatterActivity(db: DB, matterId: number, limit = 15) {
  return db
    .select()
    .from(activityLog)
    .where(eq(activityLog.matterId, matterId))
    .orderBy(desc(activityLog.createdAt), desc(activityLog.id))
    .limit(limit)
    .all();
}
