import { describe, expect, it } from "vitest";
import { computeProgress, currentStage, percentOf } from "./progress";

const item = (stageNumber: number, completed: boolean) => ({ stageNumber, stageName: `Stage ${stageNumber}`, completed });

describe("percentOf", () => {
  it("matches the spec example: 34 / 50 = 68%", () => {
    expect(percentOf(34, 50)).toBe(68);
  });
  it("returns 0 for an empty checklist rather than dividing by zero", () => {
    expect(percentOf(0, 0)).toBe(0);
  });
  it("rounds to the nearest whole percent", () => {
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(2, 3)).toBe(67);
  });
});

describe("computeProgress", () => {
  it("calculates overall and per-stage progress", () => {
    const p = computeProgress([item(1, true), item(1, true), item(2, true), item(2, false), item(3, false)]);
    expect(p).toMatchObject({ total: 5, completed: 3, outstanding: 2, percent: 60 });
    expect(p.stages.map((s) => [s.stageNumber, s.completed, s.total, s.percent])).toEqual([
      [1, 2, 2, 100],
      [2, 1, 2, 50],
      [3, 0, 1, 0],
    ]);
  });

  it("orders stages by number regardless of input order", () => {
    const p = computeProgress([item(3, false), item(1, true)]);
    expect(p.stages.map((s) => s.stageNumber)).toEqual([1, 3]);
  });

  it("identifies the current stage as the first incomplete one", () => {
    expect(currentStage(computeProgress([item(1, true), item(2, false), item(3, false)]))?.stageNumber).toBe(2);
    expect(currentStage(computeProgress([item(1, true)]))).toBeNull();
  });
});
