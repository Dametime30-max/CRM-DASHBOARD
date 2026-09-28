/**
 * Input validation (Zod). All writes are validated on the server before they
 * reach the database, regardless of any checks in the browser.
 */
import { z } from "zod";
import { isValidISODate } from "./dates";
import { MATTER_STATUSES, URGENCY_LEVELS, WILL_TYPES } from "./domain";

/** Trim; treat empty strings as "not provided" (null). */
const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .transform((v) => (v ? v : null));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isValidISODate(v), "Enter a valid date");

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || z.email().safeParse(v).success, "Enter a valid email address");

export const matterInputSchema = z.object({
  // Client details
  fullName: z.string().trim().min(1, "Client full name is required").max(200),
  preferredName: optionalText(100),
  dateOfBirth: optionalDate,
  address: optionalText(500),
  phone: optionalText(50),
  email: optionalEmail,

  // Matter details
  matterNumber: z
    .string()
    .trim()
    .min(1, "Matter number is required")
    .max(50)
    .regex(/^[A-Za-z0-9][A-Za-z0-9\-/.]*$/, "Use letters, numbers, - / or . only"),
  description: optionalText(500),
  responsibleLawyer: optionalText(100),
  dateOpened: optionalDate,
  status: z.enum(MATTER_STATUSES, { error: "Choose a status" }),
  urgency: z.enum(URGENCY_LEVELS, { error: "Choose an urgency" }),
  nextAction: optionalText(300),
  nextActionDue: optionalDate,

  // Will details
  willType: z
    .union([z.enum(WILL_TYPES), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  existingWillDate: optionalDate,
  previousSolicitor: optionalText(200),
  proposedExecutionDate: optionalDate,

  // Family / estate overview
  spousePartner: optionalText(300),
  children: optionalText(2000),
  otherBeneficiaries: optionalText(2000),
  familyNotes: optionalText(5000),
});

export type MatterInput = z.output<typeof matterInputSchema>;
export type MatterFormValues = Partial<Record<keyof MatterInput, string>>;
export type FieldErrors = Partial<Record<string, string>>;

export const MATTER_FIELDS = Object.keys(matterInputSchema.shape) as (keyof MatterInput)[];

export const checklistItemTextSchema = z.object({
  label: z.string().trim().min(1, "Item text is required").max(300),
  guidance: optionalText(1000),
});

export const checklistNotesSchema = optionalText(5000);

export const statusSchema = z.enum(MATTER_STATUSES);

/** Flatten Zod issues into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Pull known string fields out of a FormData object. */
export function formDataToObject(formData: FormData, fields: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = formData.get(f);
    if (typeof v === "string") out[f] = v;
  }
  return out;
}
