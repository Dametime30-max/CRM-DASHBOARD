"use server";

/**
 * Server actions — the only entry points the browser can call to change data.
 * Each action validates its input, calls the service layer and revalidates the
 * affected pages. When authentication is added, permission checks go here
 * (or in the services) before any write.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  checklistItemTextSchema,
  checklistNotesSchema,
  fieldErrors,
  formDataToObject,
  MATTER_FIELDS,
  matterInputSchema,
  statusSchema,
  type FieldErrors,
  type MatterFormValues,
} from "@/lib/validation";
import { DomainError } from "@/server/errors";
import { createMatter, updateMatter, updateMatterStatus } from "@/server/services/matters";
import {
  addCustomChecklistItem,
  deleteChecklistItem,
  setChecklistItemCompleted,
  updateChecklistItem,
} from "@/server/services/checklist";
import { addTemplateItem, moveTemplateItem, setTemplateItemActive, updateTemplateItem } from "@/server/services/template";

export type ActionResult = { ok: true } | { ok: false; error: string };

export interface MatterFormState {
  errors: FieldErrors;
  values: MatterFormValues;
  message?: string;
}

const idSchema = z.coerce.number().int().positive();

function failure(err: unknown): ActionResult {
  if (err instanceof DomainError) return { ok: false, error: err.message };
  console.error(err);
  return { ok: false, error: "Something went wrong. Please try again." };
}

function revalidateMatter(matterId: number) {
  revalidatePath(`/matters/${matterId}`, "layout");
  revalidatePath("/");
}

// ---------------------------------------------------------------- Matters

export async function createMatterAction(_prev: MatterFormState, formData: FormData): Promise<MatterFormState> {
  const values = formDataToObject(formData, MATTER_FIELDS) as MatterFormValues;
  const parsed = matterInputSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values, message: "Please correct the highlighted fields." };
  }
  let id: number;
  try {
    id = await createMatter(parsed.data);
  } catch (err) {
    if (err instanceof DomainError) {
      return { errors: err.field ? { [err.field]: err.message } : {}, values, message: err.message };
    }
    console.error(err);
    return { errors: {}, values, message: "The matter could not be saved. Please try again." };
  }
  revalidatePath("/");
  redirect(`/matters/${id}`);
}

export async function updateMatterAction(
  matterId: number,
  _prev: MatterFormState,
  formData: FormData,
): Promise<MatterFormState> {
  const id = idSchema.parse(matterId);
  const values = formDataToObject(formData, MATTER_FIELDS) as MatterFormValues;
  const parsed = matterInputSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values, message: "Please correct the highlighted fields." };
  }
  try {
    await updateMatter(id, parsed.data);
  } catch (err) {
    if (err instanceof DomainError) {
      return { errors: err.field ? { [err.field]: err.message } : {}, values, message: err.message };
    }
    console.error(err);
    return { errors: {}, values, message: "The matter could not be saved. Please try again." };
  }
  revalidateMatter(id);
  redirect(`/matters/${id}`);
}

export async function setMatterStatusAction(matterId: number, status: string): Promise<ActionResult> {
  try {
    const id = idSchema.parse(matterId);
    await updateMatterStatus(id, statusSchema.parse(status));
    revalidateMatter(id);
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

// -------------------------------------------------------------- Checklist

export async function toggleChecklistItemAction(matterId: number, itemId: number, completed: boolean): Promise<ActionResult> {
  try {
    await setChecklistItemCompleted(idSchema.parse(itemId), z.boolean().parse(completed));
    revalidateMatter(idSchema.parse(matterId));
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function saveChecklistItemAction(
  matterId: number,
  itemId: number,
  patch: { label?: string; notes?: string },
): Promise<ActionResult> {
  try {
    const clean: { label?: string; notes?: string | null } = {};
    if (patch.label !== undefined) {
      const r = checklistItemTextSchema.shape.label.safeParse(patch.label);
      if (!r.success) return { ok: false, error: r.error.issues[0].message };
      clean.label = r.data;
    }
    if (patch.notes !== undefined) {
      const r = checklistNotesSchema.safeParse(patch.notes);
      if (!r.success) return { ok: false, error: r.error.issues[0].message };
      clean.notes = r.data;
    }
    await updateChecklistItem(idSchema.parse(itemId), clean);
    revalidateMatter(idSchema.parse(matterId));
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function addChecklistItemAction(matterId: number, stageNumber: number, label: string): Promise<ActionResult> {
  try {
    const r = checklistItemTextSchema.shape.label.safeParse(label);
    if (!r.success) return { ok: false, error: r.error.issues[0].message };
    const id = idSchema.parse(matterId);
    await addCustomChecklistItem(id, idSchema.parse(stageNumber), r.data);
    revalidateMatter(id);
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function deleteChecklistItemAction(matterId: number, itemId: number): Promise<ActionResult> {
  try {
    await deleteChecklistItem(idSchema.parse(itemId));
    revalidateMatter(idSchema.parse(matterId));
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

// --------------------------------------------------------------- Template

export async function addTemplateItemAction(stageId: number, label: string, guidance: string): Promise<ActionResult> {
  try {
    const r = checklistItemTextSchema.safeParse({ label, guidance });
    if (!r.success) return { ok: false, error: r.error.issues[0].message };
    await addTemplateItem(idSchema.parse(stageId), r.data);
    revalidatePath("/settings/checklist");
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function updateTemplateItemAction(itemId: number, label: string, guidance: string): Promise<ActionResult> {
  try {
    const r = checklistItemTextSchema.safeParse({ label, guidance });
    if (!r.success) return { ok: false, error: r.error.issues[0].message };
    await updateTemplateItem(idSchema.parse(itemId), r.data);
    revalidatePath("/settings/checklist");
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function setTemplateItemActiveAction(itemId: number, active: boolean): Promise<ActionResult> {
  try {
    await setTemplateItemActive(idSchema.parse(itemId), z.boolean().parse(active));
    revalidatePath("/settings/checklist");
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function moveTemplateItemAction(itemId: number, direction: -1 | 1): Promise<ActionResult> {
  try {
    await moveTemplateItem(idSchema.parse(itemId), direction === -1 ? -1 : 1);
    revalidatePath("/settings/checklist");
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}
