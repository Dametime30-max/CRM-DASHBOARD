import { getDb, type DB } from "../db/client";
import { listMatterSummaries, type MatterSummary } from "./matters";
import { isActiveStatus, MATTER_STATUSES, STATUS_GROUPS, type MatterStatus, type SortKey, type StatusGroupKey } from "@/lib/domain";


export interface DashboardQuery {
  q?: string;
  /** A single status, a status group key, "active" (default) or "all". */
  view?: string;
  /** "overdue" | "attention" */
  flag?: string;
  sort?: SortKey;
}

export interface DashboardStats {
  active: number;
  groups: Record<StatusGroupKey, number>;
  overdue: number;
  attention: number;
}

export function computeStats(list: readonly MatterSummary[]): DashboardStats {
  const groups = Object.fromEntries(Object.keys(STATUS_GROUPS).map((k) => [k, 0])) as Record<StatusGroupKey, number>;
  for (const m of list) {
    for (const [key, g] of Object.entries(STATUS_GROUPS) as [StatusGroupKey, (typeof STATUS_GROUPS)[StatusGroupKey]][]) {
      if ((g.statuses as readonly string[]).includes(m.status)) groups[key] += 1;
    }
  }
  return {
    active: list.filter((m) => isActiveStatus(m.status)).length,
    groups,
    overdue: list.filter((m) => m.flags.overdue).length,
    attention: list.filter((m) => m.flags.needsAttention).length,
  };
}

const URGENCY_RANK: Record<string, number> = { Urgent: 0, High: 1, Normal: 2, Low: 3 };

export function filterAndSortMatters(list: readonly MatterSummary[], query: DashboardQuery): MatterSummary[] {
  const q = query.q?.trim().toLowerCase() ?? "";
  const view = query.view ?? "active";

  let out = list.filter((m) => {
    if (view === "active" && !isActiveStatus(m.status)) return false;
    if (view in STATUS_GROUPS && !(STATUS_GROUPS[view as StatusGroupKey].statuses as readonly string[]).includes(m.status)) return false;
    if ((MATTER_STATUSES as readonly string[]).includes(view) && m.status !== (view as MatterStatus)) return false;
    if (query.flag === "overdue" && !m.flags.overdue) return false;
    if (query.flag === "attention" && !m.flags.needsAttention) return false;
    if (q) {
      const haystack = [m.clientName, m.preferredName, m.matterNumber, m.responsibleLawyer, m.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sort = query.sort ?? "updated";
  const byDate = (d: string | null | undefined) => d ?? "9999-12-31";
  out = [...out].sort((a, b) => {
    switch (sort) {
      case "client":
        return a.clientName.localeCompare(b.clientName);
      case "matter":
        return a.matterNumber.localeCompare(b.matterNumber);
      case "progress":
        return a.percent - b.percent;
      case "due":
        return byDate(a.importantDate?.date).localeCompare(byDate(b.importantDate?.date));
      case "urgency":
        return (URGENCY_RANK[a.urgency] ?? 9) - (URGENCY_RANK[b.urgency] ?? 9) || byDate(a.importantDate?.date).localeCompare(byDate(b.importantDate?.date));
      case "updated":
      default:
        return b.updatedAt.localeCompare(a.updatedAt);
    }
  });
  return out;
}

export async function getDashboard(query: DashboardQuery, db: DB = getDb()) {
  const all = await listMatterSummaries(db);
  return {
    stats: computeStats(all),
    matters: filterAndSortMatters(all, query),
    totalCount: all.length,
    all,
  };
}
