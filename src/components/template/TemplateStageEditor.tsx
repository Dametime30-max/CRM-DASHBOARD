"use client";

import { useState, useTransition } from "react";
import {
  addTemplateItemAction,
  moveTemplateItemAction,
  setTemplateItemActiveAction,
  updateTemplateItemAction,
  type ActionResult,
} from "@/app/actions";
import { cn } from "@/lib/cn";
import { IconArrowDown, IconArrowUp, IconPencil, IconPlus, IconTrash } from "../ui/icons";

export interface TemplateItemView {
  id: number;
  label: string;
  guidance: string | null;
  active: boolean;
}

function ItemForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: { label: string; guidance: string };
  submitLabel: string;
  onSubmit: (label: string, guidance: string) => Promise<ActionResult>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial.label);
  const [guidance, setGuidance] = useState(initial.guidance);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const r = await onSubmit(label, guidance);
          if (r.ok) onCancel();
          else setError(r.error);
        });
      }}
    >
      <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Checklist item" autoFocus maxLength={300} aria-label="Item text" />
      <textarea
        className="input text-sm"
        rows={2}
        value={guidance}
        onChange={(e) => setGuidance(e.target.value)}
        placeholder="Optional guidance / prompt shown under the item"
        maxLength={1000}
        aria-label="Guidance"
      />
      <div className="flex items-center gap-2">
        <button className="btn-primary btn-sm" disabled={pending || !label.trim()}>
          {submitLabel}
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
    </form>
  );
}

export function TemplateStageEditor({
  stage,
}: {
  stage: { id: number; number: number; name: string; description: string | null; items: TemplateItemView[] };
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const active = stage.items.filter((i) => i.active);
  const removed = stage.items.filter((i) => !i.active);

  function run(fn: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Stage {stage.number}</div>
          <h2 className="card-title">{stage.name}</h2>
          {stage.description && <p className="mt-0.5 text-xs text-slate-500">{stage.description}</p>}
        </div>
        <span className="text-xs text-slate-500">{active.length} items</span>
      </div>

      <ol className={cn("divide-y divide-slate-100", pending && "opacity-70")}>
        {active.map((item, idx) => (
          <li key={item.id} className="group px-5 py-2.5">
            {editing === item.id ? (
              <ItemForm
                initial={{ label: item.label, guidance: item.guidance ?? "" }}
                submitLabel="Save"
                onSubmit={(l, g) => updateTemplateItemAction(item.id, l, g)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-6 shrink-0 text-right text-xs text-slate-400 tabular-nums">{idx + 1}.</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-900">{item.label}</div>
                  {item.guidance && <div className="text-xs text-slate-500">{item.guidance}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-0.5 opacity-50 group-hover:opacity-100 focus-within:opacity-100">
                  <button type="button" className="btn-ghost btn-sm" disabled={idx === 0} onClick={() => run(() => moveTemplateItemAction(item.id, -1))} title="Move up">
                    <IconArrowUp width={14} height={14} />
                    <span className="sr-only">Move up</span>
                  </button>
                  <button type="button" className="btn-ghost btn-sm" disabled={idx === active.length - 1} onClick={() => run(() => moveTemplateItemAction(item.id, 1))} title="Move down">
                    <IconArrowDown width={14} height={14} />
                    <span className="sr-only">Move down</span>
                  </button>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setEditing(item.id)} title="Edit">
                    <IconPencil width={14} height={14} />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-sm hover:text-red-700"
                    onClick={() => {
                      if (window.confirm(`Remove “${item.label}” from the template? Existing matters are not affected.`)) {
                        run(() => setTemplateItemActiveAction(item.id, false));
                      }
                    }}
                    title="Remove from template"
                  >
                    <IconTrash width={14} height={14} />
                    <span className="sr-only">Remove</span>
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="space-y-2 border-t border-slate-100 bg-slate-50/50 px-5 py-2.5">
        {editing === "new" ? (
          <ItemForm
            initial={{ label: "", guidance: "" }}
            submitLabel="Add to template"
            onSubmit={(l, g) => addTemplateItemAction(stage.id, l, g)}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div className="flex items-center justify-between">
            <button type="button" className="btn-ghost btn-sm -ml-2 text-brand-700" onClick={() => setEditing("new")}>
              <IconPlus width={14} height={14} /> Add item
            </button>
            {removed.length > 0 && (
              <button type="button" className="text-xs text-slate-500 hover:underline" onClick={() => setShowRemoved((s) => !s)}>
                {showRemoved ? "Hide" : "Show"} {removed.length} removed
              </button>
            )}
          </div>
        )}
        {showRemoved && (
          <ul className="space-y-1">
            {removed.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-400">
                <span className="line-through">{item.label}</span>
                <button type="button" className="btn-ghost btn-sm" onClick={() => run(() => setTemplateItemActiveAction(item.id, true))}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    </section>
  );
}
