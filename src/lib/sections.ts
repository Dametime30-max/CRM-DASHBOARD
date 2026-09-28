/**
 * Matter workspace sections. Several sections are focused views over the
 * checklist: `stages` lists which checklist stage numbers each one shows.
 */
export const WORKSPACE_SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "instructions", label: "Instructions", stages: [1] },
  { key: "estate", label: "Estate", stages: [2, 3] },
  { key: "checklist", label: "Will checklist" },
  { key: "drafting", label: "Drafting", stages: [4, 5] },
  { key: "execution", label: "Execution", stages: [6, 7] },
  { key: "tasks", label: "Tasks" },
  { key: "dates", label: "Dates" },
  { key: "notes", label: "Notes" },
  { key: "documents", label: "Documents" },
] as const satisfies readonly { key: string; label: string; stages?: readonly number[] }[];

export type SectionKey = (typeof WORKSPACE_SECTIONS)[number]["key"];

export function sectionHref(matterId: number, key: string, anchor?: string): string {
  const base = key === "overview" ? `/matters/${matterId}` : `/matters/${matterId}/${key}`;
  return anchor ? `${base}#${anchor}` : base;
}

/** Which workspace section shows a given checklist stage. */
export function sectionForStage(stageNumber: number): string {
  for (const s of WORKSPACE_SECTIONS) {
    if ("stages" in s && (s.stages as readonly number[]).includes(stageNumber)) return s.key;
  }
  return "checklist";
}
