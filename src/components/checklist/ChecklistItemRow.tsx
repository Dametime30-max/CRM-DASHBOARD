"use client";

import { useOptimistic, useState, useTransition } from "react";
import { deleteChecklistItemAction, saveChecklistItemAction, toggleChecklistItemAction } from "@/app/actions";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { IconCheck, IconNote, IconPencil, IconTrash } from "../ui/icons";
import type { ChecklistItemView } from "./types";

export function ChecklistItemRow({ item, matterId }: { item: ChecklistItemView; matterId: number }) {
  const [completed, setOptimisticCompleted] = useOptimistic(item.completed);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"view" | "notes" | "rename">("view");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [label, setLabel] = useState(item.label);
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !completed;
    setError(null);
    startTransition(async () => {
      setOptimisticCompleted(next);
      const res = await toggleChecklistItemAction(matterId, item.id, next);
      if (!res.ok) setError(res.error);
    });
  }

  function save(patch: { label?: string; notes?: string }) {
    setError(null);
    startTransition(async () => {
      const res = await saveChecklistItemAction(matterId, item.id, patch);
      if (res.ok) setMode("view");
      else setError(res.error);
    });
  }

  function remove() {
    if (!window.confirm(`Remove “${item.label}” from this matter's checklist?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteChecklistItemAction(matterId, item.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <li id={`item-${item.id}`} className={cn("group px-5 py-3 target:bg-amber-50", completed && "bg-slate-50/50")}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={completed}
          aria-label={`${completed ? "Mark incomplete" : "Mark complete"}: ${item.label}`}
          onClick={toggle}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
            completed ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white hover:border-brand-500",
          )}
        >
          {completed && <IconCheck width={14} height={14} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          {mode === "rename" ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                save({ label });
              }}
            >
              <input className="input py-1" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus aria-label="Item text" maxLength={300} />
              <button className="btn-primary btn-sm" disabled={pending}>
                Save
              </button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => { setLabel(item.label); setMode("view"); }}>
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <button type="button" onClick={toggle} className={cn("text-left text-sm", completed ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900")}>
                {item.label}
              </button>
              {item.isCustom && <span className="text-[10px] font-semibold tracking-wide text-brand-600 uppercase">Custom</span>}
            </div>
          )}

          {item.guidance && mode !== "rename" && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.guidance}</p>}

          {completed && item.completedAt && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              Completed {formatDateTime(item.completedAt)}
              {item.completedBy ? ` by ${item.completedBy}` : ""}
            </p>
          )}

          {mode === "notes" ? (
            <form
              className="mt-2 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                save({ notes });
              }}
            >
              <textarea
                className="input text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record details for this item (e.g. how the property is held, who holds the original Will)…"
                autoFocus
                aria-label="Item notes"
                maxLength={5000}
              />
              <div className="flex gap-2">
                <button className="btn-primary btn-sm" disabled={pending}>
                  Save note
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => { setNotes(item.notes ?? ""); setMode("view"); }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            item.notes && (
              <button
                type="button"
                onClick={() => setMode("notes")}
                className="mt-1.5 block w-full rounded border-l-2 border-brand-200 bg-brand-50/60 px-3 py-1.5 text-left text-xs whitespace-pre-wrap text-slate-700 hover:bg-brand-50"
              >
                {item.notes}
              </button>
            )
          )}

          {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </div>

        {mode === "view" && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button type="button" className="btn-ghost btn-sm" onClick={() => setMode("notes")} title={item.notes ? "Edit note" : "Add note"}>
              <IconNote width={14} height={14} />
              <span className="sr-only">{item.notes ? "Edit note" : "Add note"}</span>
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setMode("rename")} title="Rename item">
              <IconPencil width={14} height={14} />
              <span className="sr-only">Rename item</span>
            </button>
            <button type="button" className="btn-ghost btn-sm hover:text-red-700" onClick={remove} title="Remove item from this matter">
              <IconTrash width={14} height={14} />
              <span className="sr-only">Remove item</span>
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
