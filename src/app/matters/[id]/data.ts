import { cache } from "react";
import { notFound } from "next/navigation";
import { getMatterWorkspace } from "@/server/services/matters";

/** Load a matter once per request (shared by the layout and the page). */
export const loadWorkspace = cache(async (idParam: string) => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const ws = await getMatterWorkspace(id);
  if (!ws) notFound();
  return ws;
});
