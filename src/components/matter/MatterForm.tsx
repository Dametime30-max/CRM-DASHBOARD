"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MATTER_STATUSES, URGENCY_LEVELS, WILL_TYPES } from "@/lib/domain";
import type { MatterFormState } from "@/app/actions";
import type { MatterFormValues } from "@/lib/validation";
import { SelectField, TextAreaField, TextField } from "../ui/Field";

type Action = (prev: MatterFormState, formData: FormData) => Promise<MatterFormState>;

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="grid gap-6 p-6 lg:grid-cols-[14rem_1fr]">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      </div>
    </section>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export function MatterForm({
  action,
  initialValues,
  submitLabel,
  cancelHref,
}: {
  action: Action;
  initialValues: MatterFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, { errors: {}, values: initialValues });
  const v = state.values;
  const e = state.errors;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <Section title="Client details" description="Only the client's full name is required. Use fictional data in this prototype.">
        <TextField label="Client full name" name="fullName" required defaultValue={v.fullName} error={e.fullName} className="sm:col-span-2" />
        <TextField label="Preferred name" name="preferredName" defaultValue={v.preferredName} error={e.preferredName} />
        <TextField label="Date of birth" name="dateOfBirth" type="date" defaultValue={v.dateOfBirth} error={e.dateOfBirth} />
        <TextField label="Address" name="address" defaultValue={v.address} error={e.address} className="sm:col-span-2" />
        <TextField label="Phone" name="phone" type="tel" defaultValue={v.phone} error={e.phone} />
        <TextField label="Email" name="email" type="email" defaultValue={v.email} error={e.email} />
      </Section>

      <Section title="Matter details">
        <TextField label="Matter number" name="matterNumber" required defaultValue={v.matterNumber} error={e.matterNumber} hint="Must be unique" />
        <TextField label="Responsible lawyer" name="responsibleLawyer" defaultValue={v.responsibleLawyer} error={e.responsibleLawyer} />
        <TextField label="Matter description" name="description" defaultValue={v.description} error={e.description} className="sm:col-span-2" />
        <TextField label="Date opened" name="dateOpened" type="date" defaultValue={v.dateOpened} error={e.dateOpened} hint="Defaults to today" />
        <SelectField label="Matter status" name="status" options={MATTER_STATUSES} defaultValue={v.status} error={e.status} />
        <SelectField label="Urgency" name="urgency" options={URGENCY_LEVELS} defaultValue={v.urgency} error={e.urgency} />
        <div className="hidden sm:block" />
        <TextField label="Next action" name="nextAction" defaultValue={v.nextAction} error={e.nextAction} placeholder="e.g. Initial instructions meeting" />
        <TextField label="Next action due" name="nextActionDue" type="date" defaultValue={v.nextActionDue} error={e.nextActionDue} />
      </Section>

      <Section title="Will details">
        <SelectField label="Instructions" name="willType" options={WILL_TYPES} includeBlank="Not yet known" defaultValue={v.willType} error={e.willType} />
        <TextField label="Existing Will date" name="existingWillDate" type="date" defaultValue={v.existingWillDate} error={e.existingWillDate} />
        <TextField label="Previous solicitor / firm" name="previousSolicitor" defaultValue={v.previousSolicitor} error={e.previousSolicitor} />
        <TextField label="Proposed execution date" name="proposedExecutionDate" type="date" defaultValue={v.proposedExecutionDate} error={e.proposedExecutionDate} />
      </Section>

      <Section title="Family / estate overview" description="A quick summary. Detailed estate information is recorded in the matter's Estate section.">
        <TextField label="Spouse / partner" name="spousePartner" defaultValue={v.spousePartner} error={e.spousePartner} className="sm:col-span-2" />
        <TextAreaField label="Children" name="children" defaultValue={v.children} error={e.children} rows={2} />
        <TextAreaField label="Other relevant beneficiaries" name="otherBeneficiaries" defaultValue={v.otherBeneficiaries} error={e.otherBeneficiaries} rows={2} />
        <TextAreaField label="Notes about family structure" name="familyNotes" defaultValue={v.familyNotes} error={e.familyNotes} rows={4} className="sm:col-span-2" />
      </Section>

      <div className="flex items-center justify-end gap-2 pb-4">
        <Link href={cancelHref} className="btn-secondary">
          Cancel
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
