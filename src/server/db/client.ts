import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { ensureTemplateSeeded } from "../seed/template-seed";

export type DB = BetterSQLite3Database<typeof schema>;

// Paths are resolved at runtime; tell the bundler not to trace them.
const MIGRATIONS_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "drizzle");

function resolveDbPath(): string {
  const configured = process.env.DATABASE_PATH ?? "./data/wills.db";
  if (configured === ":memory:") return configured;
  const abs = path.resolve(/*turbopackIgnore: true*/ process.cwd(), configured);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  return abs;
}

/** Open a connection and bring the schema up to date. */
export function openDatabase(filePath: string = resolveDbPath()): DB {
  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  // The checklist template is required reference data, so seed it on first run.
  ensureTemplateSeeded(db);
  return db;
}

// Reuse one connection per process (and across Next.js dev hot-reloads).
const globalForDb = globalThis as unknown as { __willsDb?: DB };

export function getDb(): DB {
  if (!globalForDb.__willsDb) {
    globalForDb.__willsDb = openDatabase();
  }
  return globalForDb.__willsDb;
}
