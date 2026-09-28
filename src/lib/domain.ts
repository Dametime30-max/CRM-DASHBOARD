/**
 * Core domain vocabulary shared by UI, server and tests.
 * Keep these lists here so there is exactly one source of truth.
 */

export const MATTER_STATUSES = [
  "New Instructions",
  "Information Gathering",
  "Drafting",
  "Awaiting Client Review",
  "Amendments Required",
  "Ready for Execution",
  "Execution Pending",
  "Executed",
  "Post-Execution",
  "Closed",
] as const;
export type MatterStatus = (typeof MATTER_STATUSES)[number];

export const URGENCY_LEVELS = ["Low", "Normal", "High", "Urgent"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const WILL_TYPES = ["New Will", "Review Existing Will"] as const;
export type WillType = (typeof WILL_TYPES)[number];

/** Matter types. Only Wills for now; the model allows others later. */
export const MATTER_TYPES = ["Will"] as const;
export type MatterType = (typeof MATTER_TYPES)[number];

/**
 * Dashboard summary groups. Each group maps onto one or more statuses so the
 * headline cards stay meaningful even though the status list is granular.
 */
export const STATUS_GROUPS = {
  new: { label: "New instructions", statuses: ["New Instructions"] },
  drafting: { label: "Drafting", statuses: ["Drafting", "Amendments Required"] },
  awaitingClient: {
    label: "Awaiting client",
    statuses: ["Information Gathering", "Awaiting Client Review"],
  },
  awaitingExecution: {
    label: "Awaiting execution",
    statuses: ["Ready for Execution", "Execution Pending"],
  },
  executed: { label: "Executed", statuses: ["Executed", "Post-Execution"] },
  closed: { label: "Closed", statuses: ["Closed"] },
} as const satisfies Record<string, { label: string; statuses: readonly MatterStatus[] }>;
export type StatusGroupKey = keyof typeof STATUS_GROUPS;

export function isActiveStatus(status: string): boolean {
  return status !== "Closed";
}

/** Visual tone for status badges (mapped to colours in the Badge component). */
export type Tone = "slate" | "blue" | "amber" | "violet" | "green" | "red" | "teal";

export const STATUS_TONE: Record<MatterStatus, Tone> = {
  "New Instructions": "blue",
  "Information Gathering": "blue",
  Drafting: "violet",
  "Awaiting Client Review": "amber",
  "Amendments Required": "amber",
  "Ready for Execution": "teal",
  "Execution Pending": "teal",
  Executed: "green",
  "Post-Execution": "green",
  Closed: "slate",
};

export const URGENCY_TONE: Record<Urgency, Tone> = {
  Low: "slate",
  Normal: "slate",
  High: "amber",
  Urgent: "red",
};

/** Dashboard sort options. */
export const SORT_OPTIONS = {
  updated: "Last updated",
  due: "Next date",
  urgency: "Urgency",
  client: "Client name",
  matter: "Matter number",
  progress: "Progress (lowest first)",
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;
