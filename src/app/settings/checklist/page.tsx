import type { Metadata } from "next";
import { getTemplate } from "@/server/services/template";
import { PageHeader } from "@/components/ui/PageHeader";
import { TemplateStageEditor } from "@/components/template/TemplateStageEditor";
import { IconInfo } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Checklist template" };

export default async function ChecklistTemplatePage() {
  const stages = await getTemplate({ includeInactive: true });
  const activeCount = stages.reduce((n, s) => n + s.items.filter((i) => i.active).length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Will checklist template" subtitle={`${stages.length} stages · ${activeCount} items`} />

      <div className="mb-6 flex gap-3 rounded-lg border border-brand-100 bg-brand-50/60 px-5 py-4 text-sm text-slate-700">
        <IconInfo className="mt-0.5 shrink-0 text-brand-600" />
        <div className="space-y-1">
          <p>
            This is the firm checklist copied onto every <strong>new</strong> Will matter. Changes here do not alter existing
            matters, which can have their own items added, renamed or removed in the matter workspace.
          </p>
          <p className="text-slate-500">
            Items are workflow prompts only. Align them with the firm&apos;s current precedents and procedures, and confirm with your
            supervising lawyer before relying on them.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {stages.map((s) => (
          <TemplateStageEditor
            key={s.id}
            stage={{
              id: s.id,
              number: s.sortOrder,
              name: s.name,
              description: s.description,
              items: s.items.map((i) => ({ id: i.id, label: i.label, guidance: i.guidance, active: i.active })),
            }}
          />
        ))}
      </div>
    </div>
  );
}
