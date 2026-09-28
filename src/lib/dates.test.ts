import { describe, expect, it } from "vitest";
import { addDays, daysBetween, describeDue, formatDate, isValidISODate, todayISO } from "./dates";

describe("dates", () => {
  it("evaluates 'today' in Melbourne time", () => {
    // 2026-09-27 15:00 UTC is 2026-09-28 01:00 in Melbourne (AEST, UTC+10).
    expect(todayISO(new Date("2026-09-27T15:00:00Z"))).toBe("2026-09-28");
  });

  it("adds days and counts days across month boundaries", () => {
    expect(addDays("2026-09-29", 3)).toBe("2026-10-02");
    expect(daysBetween("2026-09-29", "2026-10-02")).toBe(3);
    expect(daysBetween("2026-10-02", "2026-09-29")).toBe(-3);
  });

  it("validates calendar dates strictly", () => {
    expect(isValidISODate("2026-02-28")).toBe(true);
    expect(isValidISODate("2026-02-30")).toBe(false);
    expect(isValidISODate("28/02/2026")).toBe(false);
  });

  it("describes due dates relative to today", () => {
    expect(describeDue("2026-09-28", "2026-09-28")).toBe("Today");
    expect(describeDue("2026-09-29", "2026-09-28")).toBe("Tomorrow");
    expect(describeDue("2026-10-01", "2026-09-28")).toBe("In 3 days");
    expect(describeDue("2026-09-27", "2026-09-28")).toBe("1 day overdue");
    expect(describeDue("2026-09-20", "2026-09-28")).toBe("8 days overdue");
  });

  it("formats dates in Australian style", () => {
    // ICU versions differ on "Sep" vs "Sept"; day-month-year order is what matters.
    expect(formatDate("2026-09-28")).toMatch(/^28 Sept? 2026$/);
    expect(formatDate(null)).toBe("—");
  });
});
