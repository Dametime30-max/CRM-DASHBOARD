import type { ActivityEntry } from "@/server/db/schema";
import { formatDateTime } from "@/lib/dates";

export function ActivityList({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return <p className="px-5 py-4 text-sm text-slate-500">No activity recorded yet.</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {entries.map((e) => (
        <li key={e.id} className="px-5 py-2.5 text-sm">
          <div className="text-slate-800">
            {e.action}
            {e.detail && <span className="text-slate-500"> — {e.detail}</span>}
          </div>
          <div className="text-xs text-slate-400">
            {formatDateTime(e.createdAt)} · {e.actor}
          </div>
        </li>
      ))}
    </ul>
  );
}
