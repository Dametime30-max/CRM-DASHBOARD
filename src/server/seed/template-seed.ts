import { count } from "drizzle-orm";
import type { DB } from "../db/client";
import { checklistTemplateItems, checklistTemplateStages } from "../db/schema";
import { DEFAULT_TEMPLATE } from "./default-template";

/**
 * Seed the firm checklist template, but only if there is no template yet.
 * Never overwrites edits made through the app.
 */
export function ensureTemplateSeeded(db: DB): boolean {
  const [{ n }] = db.select({ n: count() }).from(checklistTemplateStages).all();
  if (n > 0) return false;
  db.transaction((tx) => {
    DEFAULT_TEMPLATE.forEach((stage, stageIndex) => {
      const inserted = tx
        .insert(checklistTemplateStages)
        .values({ name: stage.name, description: stage.description, sortOrder: stageIndex + 1 })
        .returning({ id: checklistTemplateStages.id })
        .get();
      stage.items.forEach((item, itemIndex) => {
        tx.insert(checklistTemplateItems)
          .values({
            stageId: inserted.id,
            label: item.label,
            guidance: item.guidance ?? null,
            sortOrder: (itemIndex + 1) * 10,
          })
          .run();
      });
    });
  });
  return true;
}
