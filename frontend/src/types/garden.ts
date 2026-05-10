export interface GardenStats {
  user_id: string
  current_streak: number
  longest_streak: number
  total_study_days: number
  total_minutes_studied: number
  last_study_date: string | null
  current_plant_stage: number
  plants_grown_total: number
  garden_layout: Array<{ grown_at: string; streak: number }>
  updated_at: string
}

export interface WeakSpot {
  id: string
  user_id: string
  material_id: string | null
  topic: string
  description: string | null
  miss_count: number
  last_missed_at: string
  resolved: boolean
  resolved_at: string | null
  created_at: string
}
