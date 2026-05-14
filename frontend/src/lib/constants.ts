export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'The Library'

export const MODES = ['peer', 'tutor', 'examiner', 'feynman'] as const
export type Mode = (typeof MODES)[number]

export const MODE_LABELS: Record<Mode, string> = {
  peer: 'Peer',
  tutor: 'Tutor',
  examiner: 'Examiner',
  feynman: 'Feynman',
}

export const MODE_DESCRIPTIONS: Record<Mode, string> = {
  peer: 'Study buddy — casual, encouraging',
  tutor: 'Patient academic instructor',
  examiner: 'Strict examiner with corrections',
  feynman: 'Explain concepts in simple terms',
}

export const BOOKSHELF_STAGE_LABELS = [
  'Seed',
  'Sprout',
  'Sapling',
  'Bloom',
  'Tree',
] as const

export const PLANT_STAGE_FILES = [
  '/bookshelf-stages/stage-0-seed.svg',
  '/bookshelf-stages/stage-1-sprout.svg',
  '/bookshelf-stages/stage-2-sapling.svg',
  '/bookshelf-stages/stage-3-bloom.svg',
  '/bookshelf-stages/stage-4-tree.svg',
] as const
