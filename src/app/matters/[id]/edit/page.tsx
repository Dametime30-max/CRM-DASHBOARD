import type { Metadata } from "next";
import { loadWorkspace } from "../data";
import { updateMatterAction } from "@/app/actions";
import { MatterForm } from "@/components/matter/MatterForm";
import type { MatterFormValues } from "@/lib/validation";

export const metadata: Metadata = { title: "Edit matter" };

export default async function EditMatterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { matter, client } = await loadWorkspace(id);

  const initialValues: MatterFormValues = Object.fromEntries(
    Object.entries({
      fullName: client.fullName,
      preferredName: client.preferredName,
      dateOfBirth: client.dateOfBirth,
      address: client.address,
      phone: client.phone,
      email: client.email,
      matterNumber: matter.matterNumber,
      description: matter.description,
      responsibleLawyer: matter.responsibleLawyer,
      dateOpened: matter.dateOpened,
      status: matter.status,
      urgency: matter.urgency,
      nextAction: matter.nextAction,
      nextActionDue: matter.nextActionDue,
      willType: matter.willType,
      existingWillDate: matter.existingWillDate,
      previousSolicitor: matter.previousSolicitor,
      proposedExecutionDate: matter.proposedExecutionDate,
      spousePartner: matter.spousePartner,
      children: matter.children,
      otherBeneficiaries: matter.otherBeneficiaries,
      familyNotes: matter.familyNotes,
    }).map(([k, v]) => [k, v ?? ""]),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Edit matter details</h2>
      <MatterForm
        action={updateMatterAction.bind(null, matter.id)}
        initialValues={initialValues}
        submitLabel="Save changes"
        cancelHref={`/matters/${matter.id}`}
      />
    </div>
  );
}
