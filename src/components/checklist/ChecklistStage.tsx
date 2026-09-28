"use client";

import { useState, useTransition } from "react";
import { addChecklistItemAction } from "@/app/actions";
import { percentOf } from "@/lib/progress";
import { cn } from "@/lib/cn";
import { ProgressBar } from "../ui/ProgressBar";
import { IconChevronDown, IconPlus } from "../ui/icons";
import { ChecklistItemRow } from "./ChecklistItemRow";
import type { ChecklistStageView } from "./types";

export function ChecklistStage({
  stage,
  matterId,
  outstandingOnly = false,
  defaultOpen = true,
  addLabel = "Add item",
}: {
  stage: ChecklistStageView;
  matterId: number;
  outstandingOnly?: boolean;
  defaultOpen?: boolean;
  addLabel?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const done = stage.items.filter((i) => i.completed).length;
  const total = stage.items.length;
  const pct = percentOf(done, total);
  const visible = outstandingOnly ? stage.items.filter((i) => !i.completed) : stage.items;

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addChecklistItemAction(matterId, stage.stageNumber, label);
      if (res.ok) {
        setLabel("");
        setAdding(false);
      } else setError(res.error);
    });
  }

  return (
    <section id={`stage-${stage.stageNumber}`} className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50"
      >
        <IconChevronDown className={cn("shrink-0 text-slate-400 transition-transform", !open && "-rotate-90")} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Stage {stage.stageNumber}</div>
          <h3 className="text-sm font-semibold text-slate-900">{stage.stageName}</h3>
        </div>
        <div className="flex w-48 shrink-0 items-center gap-3">
          <ProgressBar percent={pct} size="sm" className="flex-1" />
          <span className={cn("w-14 text-right text-xs tabular-nums", pct === 100 ? "font-medium text-emerald-700" : "text-slate-600")}>
            {done}/{total}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {visible.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {visible.map((item) => (
                <ChecklistItemRow key={item.id} item={item} matterId={matterId} />
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-slate-500">{outstandingOnly ? "All items in this stage are complete." : "No items."}</p>
          )}

          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2.5">
            {adding ? (
              <form onSubmit={add} className="flex flex-wrap items-center gap-2">
                <input
                  className="input max-w-lg flex-1 py-1.5"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Describe the item…"
                  autoFocus
                  maxLength={300}
                  aria-label={`New item for ${stage.stageName}`}
                />
                <button className="btn-primary btn-sm" disabled={pending || !label.trim()}>
                  Add
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => { setAdding(false); setLabel(""); setError(null); }}>
                  Cancel
                </button>
                {error && <span className="text-xs text-red-700">{error}</span>}
              </form>
            ) : (
              <button type="button" className="btn-ghost btn-sm -ml-2 text-brand-700" onClick={() => setAdding(true)}>
                <IconPlus width={14} height={14} /> {addLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
