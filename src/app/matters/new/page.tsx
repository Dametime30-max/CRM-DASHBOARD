import type { Metadata } from "next";
import { createMatterAction } from "@/app/actions";
import { MatterForm } from "@/components/matter/MatterForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { suggestMatterNumber } from "@/server/services/matters";
import { todayISO } from "@/lib/dates";

export const metadata: Metadata = { title: "New matter" };

export default async function NewMatterPage() {
  const matterNumber = await suggestMatterNumber();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="New Will matter" subtitle="The firm checklist template is copied onto the matter when it is created." />
      <MatterForm
        action={createMatterAction}
        initialValues={{ matterNumber, dateOpened: todayISO(), status: "New Instructions", urgency: "Normal" }}
        submitLabel="Create matter"
        cancelHref="/"
      />
    </div>
  );
}
