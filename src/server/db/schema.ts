/**
 * Database schema (Drizzle ORM, SQLite).
 *
 * Design notes:
 * - Clients and matters are separate tables so one client can later have
 *   several matters (e.g. a Will now, a Power of Attorney later).
 * - The checklist *template* lives in the database, not in code. When a matter
 *   is created the active template items are copied onto the matter, so later
 *   template edits never silently change an existing matter's checklist.
 * - Every row that changes records who changed it (`updatedBy`) and an
 *   activity log row is written for meaningful events. This is the seed of a
 *   proper audit trail once authentication exists.
 * - Dates are stored as "YYYY-MM-DD" text; timestamps as ISO-8601 text. Both
 *   port cleanly to PostgreSQL later.
 */
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
};

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  preferredName: text("preferred_name"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  ...timestamps,
});

export const matters = sqliteTable(
  "matters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    matterNumber: text("matter_number").notNull(),
    matterType: text("matter_type").notNull().default("Will"),
    description: text("description"),
    responsibleLawyer: text("responsible_lawyer"),
    dateOpened: text("date_opened"),
    status: text("status").notNull().default("New Instructions"),
    urgency: text("urgency").notNull().default("Normal"),
    nextAction: text("next_action"),
    nextActionDue: text("next_action_due"),

    // Will details
    willType: text("will_type"),
    existingWillDate: text("existing_will_date"),
    previousSolicitor: text("previous_solicitor"),
    proposedExecutionDate: text("proposed_execution_date"),

    // Family / estate overview
    spousePartner: text("spouse_partner"),
    children: text("children"),
    otherBeneficiaries: text("other_beneficiaries"),
    familyNotes: text("family_notes"),

    isSample: integer("is_sample", { mode: "boolean" }).notNull().default(false),
    updatedBy: text("updated_by"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("matters_matter_number_uq").on(t.matterNumber),
    index("matters_status_idx").on(t.status),
    index("matters_client_idx").on(t.clientId),
  ],
);

/** Firm-level checklist template: stages. */
export const checklistTemplateStages = sqliteTable("checklist_template_stages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps,
});

/** Firm-level checklist template: items within a stage. */
export const checklistTemplateItems = sqliteTable(
  "checklist_template_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    stageId: integer("stage_id")
      .notNull()
      .references(() => checklistTemplateStages.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    guidance: text("guidance"),
    sortOrder: integer("sort_order").notNull(),
    // Inactive items stay for history but are not copied onto new matters.
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (t) => [index("template_items_stage_idx").on(t.stageId)],
);

/**
 * A matter's own checklist. Stage name/order are copied (denormalised) so a
 * matter's checklist is self-contained and unaffected by template changes.
 */
export const matterChecklistItems = sqliteTable(
  "matter_checklist_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    matterId: integer("matter_id")
      .notNull()
      .references(() => matters.id, { onDelete: "cascade" }),
    templateItemId: integer("template_item_id"),
    stageNumber: integer("stage_number").notNull(),
    stageName: text("stage_name").notNull(),
    label: text("label").notNull(),
    guidance: text("guidance"),
    sortOrder: integer("sort_order").notNull(),
    isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    completedAt: text("completed_at"),
    completedBy: text("completed_by"),
    notes: text("notes"),
    updatedBy: text("updated_by"),
    ...timestamps,
  },
  (t) => [index("matter_checklist_matter_idx").on(t.matterId, t.stageNumber, t.sortOrder)],
);

/** Append-only log of meaningful events. Foundation for a future audit log. */
export const activityLog = sqliteTable(
  "activity_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    matterId: integer("matter_id").references(() => matters.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    detail: text("detail"),
    actor: text("actor").notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("activity_matter_idx").on(t.matterId, t.createdAt)],
);

export type Client = typeof clients.$inferSelect;
export type Matter = typeof matters.$inferSelect;
export type NewMatter = typeof matters.$inferInsert;
export type TemplateStage = typeof checklistTemplateStages.$inferSelect;
export type TemplateItem = typeof checklistTemplateItems.$inferSelect;
export type ChecklistItem = typeof matterChecklistItems.$inferSelect;
export type ActivityEntry = typeof activityLog.$inferSelect;
