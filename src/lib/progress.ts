/**
 * Progress is calculated from checklist items only:
 *   completed items / total items, rounded to the nearest whole percent.
 */

export interface ProgressInputItem {
  stageNumber: number;
  stageName: string;
  completed: boolean;
}

export interface StageProgress {
  stageNumber: number;
  stageName: string;
  total: number;
  completed: number;
  percent: number;
}

export interface Progress {
  total: number;
  completed: number;
  outstanding: number;
  percent: number;
  stages: StageProgress[];
}

export function percentOf(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function computeProgress(items: readonly ProgressInputItem[]): Progress {
  const byStage = new Map<number, StageProgress>();
  let completed = 0;
  for (const item of items) {
    let stage = byStage.get(item.stageNumber);
    if (!stage) {
      stage = { stageNumber: item.stageNumber, stageName: item.stageName, total: 0, completed: 0, percent: 0 };
      byStage.set(item.stageNumber, stage);
    }
    stage.total += 1;
    if (item.completed) {
      stage.completed += 1;
      completed += 1;
    }
  }
  const stages = [...byStage.values()]
    .sort((a, b) => a.stageNumber - b.stageNumber)
    .map((s) => ({ ...s, percent: percentOf(s.completed, s.total) }));
  return {
    total: items.length,
    completed,
    outstanding: items.length - completed,
    percent: percentOf(completed, items.length),
    stages,
  };
}

/**
 * The stage the matter is "up to": the first stage with incomplete items,
 * or null when everything is complete.
 */
export function currentStage(progress: Progress): StageProgress | null {
  return progress.stages.find((s) => s.completed < s.total) ?? null;
}
