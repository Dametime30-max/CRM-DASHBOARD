import Link from "next/link";
import type { AttentionItem } from "@/lib/attention";
import { sectionHref } from "@/lib/sections";
import { cn } from "@/lib/cn";
import { DueLabel } from "../ui/DueLabel";
import { IconAlert, IconArrowRight, IconCalendar, IconCheck, IconClock, IconList } from "../ui/icons";

const GROUPS: { kinds: AttentionItem["kind"][]; title: string; icon: typeof IconAlert }[] = [
  { kinds: ["overdue"], title: "Overdue", icon: IconAlert },
  { kinds: ["due-soon"], title: "Due soon", icon: IconClock },
  { kinds: ["date"], title: "Important dates", icon: IconCalendar },
  { kinds: ["checklist"], title: "Next checklist items", icon: IconList },
];

const SEVERITY: Record<AttentionItem["severity"], string> = {
  critical: "border-l-red-500 bg-red-50/60",
  warning: "border-l-amber-400 bg-amber-50/50",
  info: "border-l-slate-200",
};

export function AttentionPanel({
  matterId,
  items,
  resume,
  closed,
}: {
  matterId: number;
  items: AttentionItem[];
  resume: { label: string; stage: string; href: string } | null;
  closed: boolean;
}) {
  const urgent = items.filter((i) => i.severity !== "info").length;
  return (
    <section className="card border-brand-200 overflow-hidden">
      <div className="bg-brand-50/70 flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 px-5 py-3.5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">What needs my attention?</h2>
          <p className="text-xs text-slate-600">
            {closed
              ? "This matter is closed."
              : urgent > 0
                ? `${urgent} time-sensitive item${urgent === 1 ? "" : "s"}`
                : "Nothing overdue or time-critical."}
          </p>
        </div>
        {resume && (
          <Link href={resume.href} className="btn-primary">
            Continue: {resume.label.length > 40 ? `${resume.label.slice(0, 40)}…` : resume.label}
            <IconArrowRight width={14} height={14} />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-2 px-5 py-6 text-sm text-slate-600">
          <IconCheck className="text-emerald-600" /> {closed ? "No outstanding work." : "All checklist items are complete and nothing is due."}
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-4 p-5 md:grid-cols-2">
          {GROUPS.map((g) => {
            const list = items.filter((i) => g.kinds.includes(i.kind));
            if (list.length === 0) return null;
            const Icon = g.icon;
            return (
              <div key={g.title} className={cn(g.kinds.includes("checklist") && "md:col-span-2")}>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  <Icon width={13} height={13} /> {g.title}
                </h3>
                <ul className={cn("space-y-1.5", g.kinds.includes("checklist") && "grid gap-1.5 space-y-0 md:grid-cols-2")}>
                  {list.map((i, idx) => (
                    <li key={idx}>
                      <Link
                        href={sectionHref(matterId, i.section ?? "overview", i.anchor)}
                        className={cn("group flex items-center justify-between gap-3 rounded-r border-l-2 px-3 py-2 hover:bg-slate-50", SEVERITY[i.severity])}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{i.title}</div>
                          {i.detail && <div className="truncate text-xs text-slate-500">{i.detail}</div>}
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-sm">
                          {i.date && <DueLabel date={i.date} />}
                          <IconArrowRight width={14} height={14} className="text-slate-300 group-hover:text-brand-600" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      <div className="border-t border-slate-100 px-5 py-2 text-[11px] text-slate-400">Tasks and custom key dates will also appear here from Phase 2.</div>
    </section>
  );
}
