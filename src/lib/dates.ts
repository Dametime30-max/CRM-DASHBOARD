/**
 * Date helpers. Calendar dates are stored as "YYYY-MM-DD" strings and
 * timestamps as ISO-8601 strings. "Today" is evaluated in Melbourne time so
 * overdue flags match the working day in Victoria regardless of server TZ.
 */

export const FIRM_TIME_ZONE = "Australia/Melbourne";

/** Today's date (YYYY-MM-DD) in the firm's time zone. */
export function todayISO(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FIRM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Add whole days to a YYYY-MM-DD date. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). Negative if `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** "27 Sep 2026" */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** "27 Sep 2026, 3:15 pm" in Melbourne time. */
export function formatDateTime(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return "—";
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: FIRM_TIME_ZONE,
  }).format(d);
}

/** Human-friendly relative description, e.g. "Today", "In 3 days", "2 days overdue". */
export function describeDue(isoDate: string | null | undefined, today: string = todayISO()): string {
  if (!isoDate) return "";
  const diff = daysBetween(today, isoDate);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "1 day overdue";
  if (diff < 0) return `${-diff} days overdue`;
  return `In ${diff} days`;
}

export function nowTimestamp(): string {
  return new Date().toISOString();
}
