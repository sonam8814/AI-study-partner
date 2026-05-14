'use client'

interface PlantGrowthProps {
  stage: number
  size?: number
}

const STAGE_ICONS = ['🌱', '🌿', '🪴', '🌳', '🌳', '🌳', '🌴', '🌴']

export default function PlantGrowth({ stage, size = 32 }: PlantGrowthProps) {
  const icon = STAGE_ICONS[Math.min(stage, STAGE_ICONS.length - 1)]
  return (
    <span style={{ fontSize: size }} aria-label={`Plant stage ${stage}`}>
      {icon}
    </span>
  )
}
