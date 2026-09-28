/**
 * Set up the local database.
 *
 *   pnpm db:setup   Create/upgrade the database, seed the checklist template
 *                   and load FICTIONAL sample matters (skips any that exist).
 *   pnpm db:reset   DELETE the local database file and start again.
 */
import fs from "node:fs";
import path from "node:path";
import { openDatabase } from "../src/server/db/client";
import { seedSampleMatters } from "../src/server/seed/sample-data";

async function main() {
  const reset = process.argv.includes("--reset");
  const dbPath = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/wills.db");

  if (reset) {
    for (const suffix of ["", "-wal", "-shm", "-journal"]) {
      fs.rmSync(dbPath + suffix, { force: true });
    }
    console.log(`Deleted ${dbPath}`);
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = openDatabase(dbPath); // runs migrations + seeds the checklist template
  console.log(`Database ready at ${dbPath}`);

  const created = await seedSampleMatters(db);
  console.log(created > 0 ? `Loaded ${created} fictional sample matters.` : "Sample matters already present — nothing added.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
