import { describe, expect, it } from "vitest";
import { matterAttention, matterFlags } from "./attention";

const TODAY = "2026-09-28";
const base = { status: "Drafting", urgency: "Normal", nextActionDue: null, proposedExecutionDate: null };

describe("matterFlags", () => {
  it("flags an overdue next action", () => {
    const f = matterFlags({ ...base, nextActionDue: "2026-09-25" }, TODAY);
    expect(f.overdue).toBe(true);
    expect(f.needsAttention).toBe(true);
    expect(f.reasons).toContain("Next action overdue");
  });

  it("treats a next action due today as not overdue but needing attention", () => {
    const f = matterFlags({ ...base, nextActionDue: TODAY }, TODAY);
    expect(f.overdue).toBe(false);
    expect(f.dueSoon).toBe(true);
    expect(f.needsAttention).toBe(true);
  });

  it("does not flag a matter with a distant next action", () => {
    expect(matterFlags({ ...base, nextActionDue: "2026-12-01" }, TODAY).needsAttention).toBe(false);
  });

  it("flags urgent matters and approaching executions", () => {
    expect(matterFlags({ ...base, urgency: "Urgent" }, TODAY).reasons).toContain("Marked urgent");
    expect(matterFlags({ ...base, proposedExecutionDate: "2026-10-03" }, TODAY).executionSoon).toBe(true);
  });

  it("ignores the proposed execution date once executed", () => {
    expect(matterFlags({ ...base, status: "Executed", proposedExecutionDate: "2026-09-20" }, TODAY).needsAttention).toBe(false);
  });

  it("never flags closed matters", () => {
    const f = matterFlags({ ...base, status: "Closed", urgency: "Urgent", nextActionDue: "2026-01-01" }, TODAY);
    expect(f.needsAttention).toBe(false);
    expect(f.overdue).toBe(false);
  });
});

describe("matterAttention", () => {
  const checklist = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Item ${i + 1}`, stageNumber: 1, stageName: "Initial Instructions" }));

  it("lists overdue first, then dates, then the next checklist items (limited)", () => {
    const items = matterAttention(
      { ...base, nextAction: "Chase client", nextActionDue: "2026-09-26", proposedExecutionDate: "2026-10-01", incompleteChecklist: checklist },
      TODAY,
    );
    expect(items.map((i) => i.kind)).toEqual(["overdue", "date", "checklist", "checklist", "checklist", "checklist", "checklist"]);
    expect(items[0]).toMatchObject({ title: "Chase client", severity: "critical" });
    expect(items[2]).toMatchObject({ anchor: "item-1", section: "checklist" });
  });

  it("returns nothing for a closed matter", () => {
    expect(matterAttention({ ...base, status: "Closed", nextAction: null, incompleteChecklist: checklist }, TODAY)).toEqual([]);
  });
});
