/**
 * Integration tests: real services against a throwaway in-memory SQLite
 * database (DATABASE_PATH=":memory:" is set in vitest.config.ts).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "../db/client";
import { DomainError } from "../errors";
import { createMatter, getMatterWorkspace, listMatterSummaries, suggestMatterNumber, updateMatter, updateMatterStatus } from "./matters";
import { addCustomChecklistItem, deleteChecklistItem, setChecklistItemCompleted, updateChecklistItem } from "./checklist";
import { addTemplateItem, getTemplate, moveTemplateItem, setTemplateItemActive } from "./template";
import { filterAndSortMatters, getDashboard } from "./dashboard";
import { seedSampleMatters } from "../seed/sample-data";
import { DEFAULT_TEMPLATE } from "../seed/default-template";
import { matterInputSchema, type MatterInput } from "@/lib/validation";

const TEMPLATE_ITEM_COUNT = DEFAULT_TEMPLATE.reduce((n, s) => n + s.items.length, 0);

function input(overrides: Partial<Record<keyof MatterInput, string>> = {}): MatterInput {
  return matterInputSchema.parse({
    fullName: "Test Client",
    matterNumber: "T-0001",
    status: "New Instructions",
    urgency: "Normal",
    ...overrides,
  });
}

beforeAll(() => {
  getDb(); // migrate + seed template
});

describe("checklist template", () => {
  it("is seeded from the default template on first run", async () => {
    const t = await getTemplate();
    expect(t).toHaveLength(7);
    expect(t.map((s) => s.name)).toEqual(DEFAULT_TEMPLATE.map((s) => s.name));
    expect(t.reduce((n, s) => n + s.items.length, 0)).toBe(TEMPLATE_ITEM_COUNT);
  });
});

describe("matters", () => {
  it("creates a matter and copies the whole template onto it", async () => {
    const id = await createMatter(input({ matterNumber: "T-CREATE" }));
    const ws = await getMatterWorkspace(id);
    expect(ws).not.toBeNull();
    expect(ws!.client.fullName).toBe("Test Client");
    expect(ws!.matter.dateOpened).toMatch(/^\d{4}-\d{2}-\d{2}$/); // defaults to today
    expect(ws!.checklist).toHaveLength(TEMPLATE_ITEM_COUNT);
    expect(ws!.progress).toMatchObject({ completed: 0, percent: 0, total: TEMPLATE_ITEM_COUNT });
    expect(ws!.activity[0].action).toBe("Matter created");
  });

  it("rejects a duplicate matter number (case-insensitive)", async () => {
    await createMatter(input({ matterNumber: "T-DUP" }));
    await expect(createMatter(input({ matterNumber: "t-dup" }))).rejects.toBeInstanceOf(DomainError);
  });

  it("updates details and logs status changes", async () => {
    const id = await createMatter(input({ matterNumber: "T-UPD" }));
    await updateMatter(id, input({ matterNumber: "T-UPD", fullName: "Renamed Client", status: "Drafting" }));
    await updateMatterStatus(id, "Awaiting Client Review");
    const ws = await getMatterWorkspace(id);
    expect(ws!.client.fullName).toBe("Renamed Client");
    expect(ws!.matter.status).toBe("Awaiting Client Review");
    expect(ws!.activity.filter((a) => a.action === "Status changed").map((a) => a.detail)).toEqual(
      expect.arrayContaining(["New Instructions → Drafting", "Drafting → Awaiting Client Review"]),
    );
  });

  it("returns null for a matter that does not exist", async () => {
    expect(await getMatterWorkspace(999_999)).toBeNull();
  });
});

describe("matter checklist", () => {
  it("completing items updates progress, and reopening reverses it", async () => {
    const id = await createMatter(input({ matterNumber: "T-PROG" }));
    const ws = await getMatterWorkspace(id);
    const [a, b] = ws!.checklist;

    const done = await setChecklistItemCompleted(a.id, true);
    expect(done.completed).toBe(true);
    expect(done.completedAt).not.toBeNull();
    expect(done.completedBy).toBe("Local user");
    await setChecklistItemCompleted(b.id, true);

    let p = (await getMatterWorkspace(id))!.progress;
    expect(p.completed).toBe(2);
    expect(p.stages[0].completed).toBe(2);

    const reopened = await setChecklistItemCompleted(a.id, false);
    expect(reopened.completedAt).toBeNull();
    p = (await getMatterWorkspace(id))!.progress;
    expect(p.completed).toBe(1);

    const summary = (await listMatterSummaries()).find((m) => m.id === id)!;
    expect(summary.completedItems).toBe(1);
    expect(summary.nextChecklistItem).toBe(a.label);
  });

  it("supports custom items, notes, renaming and removal", async () => {
    const id = await createMatter(input({ matterNumber: "T-CUSTOM" }));
    const newId = await addCustomChecklistItem(id, 2, "Overseas property in NZ");
    await updateChecklistItem(newId, { notes: "Check local succession rules", label: "Overseas property (NZ)" });
    let ws = (await getMatterWorkspace(id))!;
    const custom = ws.checklist.find((i) => i.id === newId)!;
    expect(custom).toMatchObject({ isCustom: true, stageNumber: 2, stageName: "Asset / Estate Review", label: "Overseas property (NZ)", notes: "Check local succession rules" });
    // Custom items sort to the end of their stage.
    expect(ws.checklist.filter((i) => i.stageNumber === 2).at(-1)!.id).toBe(newId);
    expect(ws.progress.total).toBe(TEMPLATE_ITEM_COUNT + 1);

    await deleteChecklistItem(newId);
    ws = (await getMatterWorkspace(id))!;
    expect(ws.progress.total).toBe(TEMPLATE_ITEM_COUNT);
  });

  it("will not add an item to a stage the matter does not have", async () => {
    const id = await createMatter(input({ matterNumber: "T-NOSTAGE" }));
    await expect(addCustomChecklistItem(id, 42, "x")).rejects.toBeInstanceOf(DomainError);
  });
});

describe("template edits", () => {
  it("apply to new matters only", async () => {
    const before = await createMatter(input({ matterNumber: "T-BEFORE" }));
    const stage1 = (await getTemplate())[0];
    await addTemplateItem(stage1.id, { label: "Firm-specific check", guidance: null });
    await setTemplateItemActive(stage1.items[0].id, false); // remove "Open/create matter"

    const after = await createMatter(input({ matterNumber: "T-AFTER" }));
    const oldWs = (await getMatterWorkspace(before))!;
    const newWs = (await getMatterWorkspace(after))!;

    expect(oldWs.checklist.some((i) => i.label === "Firm-specific check")).toBe(false);
    expect(oldWs.checklist[0].label).toBe("Open/create matter");
    expect(newWs.checklist.some((i) => i.label === "Firm-specific check")).toBe(true);
    expect(newWs.checklist.some((i) => i.label === "Open/create matter")).toBe(false);

    // restore for other tests
    await setTemplateItemActive(stage1.items[0].id, true);
  });

  it("reorders items within a stage", async () => {
    const [stage] = await getTemplate();
    const [first, second] = stage.items;
    await moveTemplateItem(second.id, -1);
    const [reordered] = await getTemplate();
    expect(reordered.items.slice(0, 2).map((i) => i.id)).toEqual([second.id, first.id]);
  });
});

describe("sample data and dashboard", () => {
  it("seeds sample matters idempotently and supports search/filter/sort", async () => {
    const created = await seedSampleMatters(getDb());
    expect(created).toBe(10);
    expect(await seedSampleMatters(getDb())).toBe(0);

    const { stats, all } = await getDashboard({});
    expect(stats.groups.closed).toBeGreaterThanOrEqual(1);
    expect(stats.overdue).toBeGreaterThanOrEqual(2); // two samples have overdue next actions
    const samples = all.filter((m) => m.isSample);
    expect(samples.find((m) => m.status === "Closed")!.percent).toBe(100);

    expect(filterAndSortMatters(all, { q: "hartley" }).map((m) => m.matterNumber)).toEqual(["W-2026-0001"]);
    expect(filterAndSortMatters(all, { q: "W-2026-0003" })).toHaveLength(1);
    expect(filterAndSortMatters(all, { q: "s. patel", view: "all" }).every((m) => m.responsibleLawyer === "S. Patel")).toBe(true);
    expect(filterAndSortMatters(all, { view: "Closed" }).every((m) => m.status === "Closed")).toBe(true);
    expect(filterAndSortMatters(all, {}).some((m) => m.status === "Closed")).toBe(false); // default hides closed
    expect(filterAndSortMatters(all, { view: "awaitingExecution" }).map((m) => m.status).sort()).toEqual(["Execution Pending", "Ready for Execution"]);
    expect(filterAndSortMatters(all, { flag: "overdue" }).every((m) => m.flags.overdue)).toBe(true);

    const byProgress = filterAndSortMatters(all, { sort: "progress", view: "all" }).map((m) => m.percent);
    expect(byProgress).toEqual([...byProgress].sort((a, b) => a - b));
  });

  it("suggests the next free matter number", async () => {
    const next = await suggestMatterNumber();
    expect(next).toMatch(/^W-\d{4}-\d{4}$/);
    expect(Number(next.slice(-4))).toBeGreaterThanOrEqual(11);
  });
});
