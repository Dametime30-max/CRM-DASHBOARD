/** The checklist item fields the UI needs (serialisable to the browser). */
export interface ChecklistItemView {
  id: number;
  stageNumber: number;
  stageName: string;
  label: string;
  guidance: string | null;
  isCustom: boolean;
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
  notes: string | null;
}

export interface ChecklistStageView {
  stageNumber: number;
  stageName: string;
  items: ChecklistItemView[];
}

export function groupByStage(items: ChecklistItemView[]): ChecklistStageView[] {
  const map = new Map<number, ChecklistStageView>();
  for (const i of items) {
    let s = map.get(i.stageNumber);
    if (!s) {
      s = { stageNumber: i.stageNumber, stageName: i.stageName, items: [] };
      map.set(i.stageNumber, s);
    }
    s.items.push(i);
  }
  return [...map.values()].sort((a, b) => a.stageNumber - b.stageNumber);
}

export function toItemView(i: ChecklistItemView): ChecklistItemView {
  return {
    id: i.id,
    stageNumber: i.stageNumber,
    stageName: i.stageName,
    label: i.label,
    guidance: i.guidance,
    isCustom: i.isCustom,
    completed: i.completed,
    completedAt: i.completedAt,
    completedBy: i.completedBy,
    notes: i.notes,
  };
}
