/**
 * FICTIONAL sample matters for demonstrating the app. All names, addresses,
 * phone numbers and emails are made up (example.com / 0400 000 xxx).
 * Every sample matter is flagged `isSample` and shown with a "Sample" badge.
 *
 * Dates are relative to today so overdue/upcoming states always demonstrate.
 */
import { and, asc, eq, lte, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { matterChecklistItems, matters } from "../db/schema";
import { createMatter } from "../services/matters";
import { addDays, todayISO } from "@/lib/dates";
import type { MatterInput } from "@/lib/validation";

interface SampleMatter {
  input: Omit<MatterInput, "dateOpened" | "nextActionDue" | "proposedExecutionDate"> & {
    openedDaysAgo: number;
    nextActionDueIn: number | null;
    executionIn: number | null;
  };
  /** Stages fully complete, plus N items complete in the following stage. */
  completeStages: number;
  extraItems: number;
  updatedHoursAgo: number;
  itemNotes?: Record<string, string>;
}

const blank = {
  preferredName: null,
  dateOfBirth: null,
  address: null,
  phone: null,
  email: null,
  description: null,
  existingWillDate: null,
  previousSolicitor: null,
  spousePartner: null,
  children: null,
  otherBeneficiaries: null,
  familyNotes: null,
  nextAction: null,
  willType: null,
};

const SAMPLES: SampleMatter[] = [
  {
    input: {
      ...blank,
      fullName: "Margaret Ellen Hartley",
      preferredName: "Maggie",
      dateOfBirth: "1958-04-12",
      address: "14 Example Street, Kew VIC 3101",
      phone: "0400 000 101",
      email: "m.hartley@example.com",
      matterNumber: "W-2026-0001",
      description: "New Will — recently widowed",
      responsibleLawyer: "J. Taylor",
      status: "New Instructions",
      urgency: "Normal",
      nextAction: "Initial instructions meeting",
      willType: "New Will",
      spousePartner: "Late husband (deceased 2025)",
      children: "Two adult children: Daniel (34), Sophie (31)",
      openedDaysAgo: 2,
      nextActionDueIn: 2,
      executionIn: null,
    },
    completeStages: 0,
    extraItems: 3,
    updatedHoursAgo: 3,
  },
  {
    input: {
      ...blank,
      fullName: "Thomas James O'Connell",
      preferredName: "Tom",
      dateOfBirth: "1971-09-30",
      address: "7 Sample Avenue, Geelong VIC 3220",
      phone: "0400 000 102",
      email: "tom.oconnell@example.com",
      matterNumber: "W-2026-0002",
      description: "Review existing Will — new property and SMSF",
      responsibleLawyer: "J. Taylor",
      status: "Information Gathering",
      urgency: "High",
      nextAction: "Obtain copy of BDBN from super fund",
      willType: "Review Existing Will",
      existingWillDate: "2015-06-18",
      previousSolicitor: "Former firm (fictional) — Placeholder Lawyers",
      spousePartner: "Rachel O'Connell",
      children: "Liam (16), Ava (13)",
      familyNotes: "Minor children — guardianship and testamentary trust to be discussed.",
      openedDaysAgo: 21,
      nextActionDueIn: -3,
      executionIn: null,
    },
    completeStages: 1,
    extraItems: 5,
    updatedHoursAgo: 26,
    itemNotes: {
      "Principal residence": "Held as joint tenants with Rachel — likely passes by survivorship. Confirm title.",
      "Superannuation": "SMSF — client is a trustee director. Obtain trust deed and any BDBN.",
    },
  },
  {
    input: {
      ...blank,
      fullName: "Priya Raman",
      dateOfBirth: "1980-01-22",
      address: "3/22 Placeholder Road, Box Hill VIC 3128",
      phone: "0400 000 103",
      email: "priya.raman@example.com",
      matterNumber: "W-2026-0003",
      description: "New Will with testamentary trust",
      responsibleLawyer: "S. Patel",
      status: "Drafting",
      urgency: "High",
      nextAction: "Complete first draft for supervisor review",
      willType: "New Will",
      spousePartner: "Arjun Raman",
      children: "Meera (8), Kiran (5)",
      openedDaysAgo: 30,
      nextActionDueIn: 4,
      executionIn: 24,
    },
    completeStages: 3,
    extraItems: 6,
    updatedHoursAgo: 5,
    itemNotes: {
      "Confirm proposed distribution": "Everything to Arjun; if he predeceases, to children via testamentary trust.",
    },
  },
  {
    input: {
      ...blank,
      fullName: "Geoffrey Alan Whitmore",
      preferredName: "Geoff",
      dateOfBirth: "1949-11-03",
      address: "88 Demo Crescent, Ballarat VIC 3350",
      phone: "0400 000 104",
      email: "g.whitmore@example.com",
      matterNumber: "W-2026-0004",
      description: "Updated Will — equalisation between children",
      responsibleLawyer: "J. Taylor",
      status: "Awaiting Client Review",
      urgency: "Normal",
      nextAction: "Follow up client comments on draft",
      willType: "Review Existing Will",
      existingWillDate: "2009-02-14",
      children: "Emma (48), Mark (45)",
      familyNotes:
        "Client wants house to pass to daughter but wants son to receive equalisation payment. Consider family provision implications with supervisor.",
      openedDaysAgo: 45,
      nextActionDueIn: -6,
      executionIn: null,
    },
    completeStages: 4,
    extraItems: 1,
    updatedHoursAgo: 24 * 8,
  },
  {
    input: {
      ...blank,
      fullName: "Chen Wei Lim",
      dateOfBirth: "1966-07-08",
      address: "5 Illustration Lane, Doncaster VIC 3108",
      phone: "0400 000 105",
      email: "cw.lim@example.com",
      matterNumber: "W-2026-0005",
      description: "Will — company shares and family trust",
      responsibleLawyer: "S. Patel",
      status: "Amendments Required",
      urgency: "Normal",
      nextAction: "Update draft re trust appointor clause",
      willType: "New Will",
      spousePartner: "Mei Lim",
      children: "Three adult children",
      openedDaysAgo: 60,
      nextActionDueIn: 6,
      executionIn: 20,
    },
    completeStages: 4,
    extraItems: 3,
    updatedHoursAgo: 48,
    itemNotes: {
      "Trust interests": "Client is appointor of Lim Family Trust (fictional). Succession of appointor role to be addressed in deed, not Will.",
    },
  },
  {
    input: {
      ...blank,
      fullName: "Dorothy May Fitzgerald",
      dateOfBirth: "1938-05-19",
      address: "Room 12, Sample Aged Care, Camberwell VIC 3124",
      phone: "0400 000 106",
      matterNumber: "W-2026-0006",
      description: "New Will — client in aged care",
      responsibleLawyer: "L. Morgan",
      status: "Ready for Execution",
      urgency: "Urgent",
      nextAction: "Confirm execution attendance at aged care facility",
      willType: "New Will",
      children: "Patricia (62)",
      otherBeneficiaries: "Local animal shelter (charity gift)",
      familyNotes: "Consider capacity — supervising lawyer to attend execution. Treating GP letter requested.",
      openedDaysAgo: 18,
      nextActionDueIn: 1,
      executionIn: 5,
    },
    completeStages: 5,
    extraItems: 2,
    updatedHoursAgo: 2,
  },
  {
    input: {
      ...blank,
      fullName: "Samuel Adeyemi",
      preferredName: "Sam",
      dateOfBirth: "1985-12-01",
      address: "41 Fictional Street, Footscray VIC 3011",
      phone: "0400 000 107",
      email: "sam.adeyemi@example.com",
      matterNumber: "W-2026-0007",
      description: "Simple Will",
      responsibleLawyer: "J. Taylor",
      status: "Execution Pending",
      urgency: "Normal",
      nextAction: "Signing appointment",
      willType: "New Will",
      spousePartner: "Grace Adeyemi",
      openedDaysAgo: 25,
      nextActionDueIn: 1,
      executionIn: 1,
    },
    completeStages: 5,
    extraItems: 4,
    updatedHoursAgo: 30,
  },
  {
    input: {
      ...blank,
      fullName: "Helen Louise Brandt",
      dateOfBirth: "1962-03-27",
      address: "9 Mock Parade, Bendigo VIC 3550",
      phone: "0400 000 108",
      email: "h.brandt@example.com",
      matterNumber: "W-2026-0008",
      description: "Will executed — follow-up outstanding",
      responsibleLawyer: "L. Morgan",
      status: "Executed",
      urgency: "Low",
      nextAction: "Send executed copy and storage letter",
      willType: "Review Existing Will",
      existingWillDate: "2012-08-01",
      openedDaysAgo: 70,
      nextActionDueIn: 9,
      executionIn: -4,
    },
    completeStages: 6,
    extraItems: 2,
    updatedHoursAgo: 24 * 4,
  },
  {
    input: {
      ...blank,
      fullName: "Arthur Kowalski",
      dateOfBirth: "1955-10-10",
      address: "16 Test Road, Frankston VIC 3199",
      phone: "0400 000 109",
      matterNumber: "W-2026-0009",
      description: "Post-execution — BDBN follow-up",
      responsibleLawyer: "S. Patel",
      status: "Post-Execution",
      urgency: "Normal",
      nextAction: "Confirm BDBN lodged with fund",
      willType: "New Will",
      openedDaysAgo: 95,
      nextActionDueIn: 12,
      executionIn: -20,
    },
    completeStages: 6,
    extraItems: 6,
    updatedHoursAgo: 24 * 6,
  },
  {
    input: {
      ...blank,
      fullName: "Beatrice Nguyen",
      dateOfBirth: "1970-06-06",
      address: "2 Dummy Court, Richmond VIC 3121",
      phone: "0400 000 110",
      email: "b.nguyen@example.com",
      matterNumber: "W-2026-0010",
      description: "Completed Will matter",
      responsibleLawyer: "J. Taylor",
      status: "Closed",
      urgency: "Low",
      willType: "New Will",
      openedDaysAgo: 140,
      nextActionDueIn: null,
      executionIn: -60,
    },
    completeStages: 7,
    extraItems: 0,
    updatedHoursAgo: 24 * 30,
  },
];

export async function seedSampleMatters(db: DB): Promise<number> {
  const today = todayISO();
  let created = 0;
  for (const s of SAMPLES) {
    const { openedDaysAgo, nextActionDueIn, executionIn, ...rest } = s.input;
    const exists = db.select({ id: matters.id }).from(matters).where(eq(matters.matterNumber, rest.matterNumber)).get();
    if (exists) continue;

    const id = await createMatter(
      {
        ...rest,
        dateOpened: addDays(today, -openedDaysAgo),
        nextActionDue: nextActionDueIn === null ? null : addDays(today, nextActionDueIn),
        proposedExecutionDate: executionIn === null ? null : addDays(today, executionIn),
      },
      { isSample: true },
      db,
    );

    const completedAt = new Date(Date.now() - s.updatedHoursAgo * 3_600_000).toISOString();
    // Complete whole stages...
    if (s.completeStages > 0) {
      db.update(matterChecklistItems)
        .set({ completed: true, completedAt, completedBy: rest.responsibleLawyer })
        .where(and(eq(matterChecklistItems.matterId, id), lte(matterChecklistItems.stageNumber, s.completeStages)))
        .run();
    }
    // ...then the first N items of the next stage.
    if (s.extraItems > 0) {
      const next = db
        .select({ id: matterChecklistItems.id })
        .from(matterChecklistItems)
        .where(and(eq(matterChecklistItems.matterId, id), eq(matterChecklistItems.stageNumber, s.completeStages + 1)))
        .orderBy(asc(matterChecklistItems.sortOrder))
        .limit(s.extraItems)
        .all();
      for (const n of next) {
        db.update(matterChecklistItems)
          .set({ completed: true, completedAt, completedBy: rest.responsibleLawyer })
          .where(eq(matterChecklistItems.id, n.id))
          .run();
      }
    }
    for (const [label, notes] of Object.entries(s.itemNotes ?? {})) {
      db.update(matterChecklistItems)
        .set({ notes })
        .where(and(eq(matterChecklistItems.matterId, id), eq(matterChecklistItems.label, label)))
        .run();
    }
    db.update(matters).set({ updatedAt: completedAt }).where(eq(matters.id, id)).run();
    db.run(sql`update activity_log set created_at = ${completedAt} where matter_id = ${id}`);
    created += 1;
  }
  return created;
}
