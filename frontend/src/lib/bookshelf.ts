import { PLANT_STAGE_FILES, BOOKSHELF_STAGE_LABELS } from './constants'

export function getPlantSvgPath(stage: number): string {
  const s = Math.max(0, Math.min(4, stage))
  return PLANT_STAGE_FILES[s]
}

export function getPlantStageLabel(stage: number): string {
  const s = Math.max(0, Math.min(4, stage))
  return BOOKSHELF_STAGE_LABELS[s]
}

export function getDaysUntilNextStage(currentStreak: number): number {
  const nextMilestone = (Math.floor(currentStreak / 3) + 1) * 3
  return nextMilestone - currentStreak
}
