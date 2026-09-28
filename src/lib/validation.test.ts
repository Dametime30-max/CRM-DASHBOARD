import { describe, expect, it } from "vitest";
import { fieldErrors, matterInputSchema } from "./validation";

const minimal = { fullName: "Test Client", matterNumber: "W-2026-0100", status: "New Instructions", urgency: "Normal" };

describe("matterInputSchema", () => {
  it("accepts the minimum required fields and turns blanks into null", () => {
    const r = matterInputSchema.safeParse({ ...minimal, email: "", dateOfBirth: "  ", willType: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBeNull();
      expect(r.data.dateOfBirth).toBeNull();
      expect(r.data.willType).toBeNull();
      expect(r.data.phone).toBeNull();
    }
  });

  it("requires a client name and matter number", () => {
    const r = matterInputSchema.safeParse({ ...minimal, fullName: " ", matterNumber: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = fieldErrors(r.error);
      expect(e.fullName).toMatch(/required/i);
      expect(e.matterNumber).toMatch(/required/i);
    }
  });

  it("rejects invalid email, dates, status and will type", () => {
    const r = matterInputSchema.safeParse({
      ...minimal,
      email: "not-an-email",
      nextActionDue: "2026-02-31",
      status: "Made up",
      willType: "Codicil",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(Object.keys(fieldErrors(r.error)).sort()).toEqual(["email", "nextActionDue", "status", "willType"]);
    }
  });

  it("rejects unsafe characters in matter numbers", () => {
    expect(matterInputSchema.safeParse({ ...minimal, matterNumber: "W 2026 <script>" }).success).toBe(false);
  });
});
