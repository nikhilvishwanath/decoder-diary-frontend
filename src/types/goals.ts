// Goal types that match the backend Goal model
export interface Goal {
  id: string
  title: string
  description?: string
  goal_type: string
  target_date?: string
  target_duration?: number
  progress_hours: number
  progress_days: number
  owner_id: string
  created_at: string
  updated_at: string
}

export interface GoalCreate {
  title: string
  description?: string
  goal_type: string
  target_date?: string
  target_duration?: number
  progress_hours?: number
  progress_days?: number
}

export interface GoalUpdate {
  title?: string
  description?: string
  goal_type?: string
  target_date?: string
  target_duration?: number
  progress_hours?: number
  progress_days?: number
}

export interface GoalsResponse {
  data: Goal[]
  count: number
}

// Utility function to calculate progress percentage
export const calculateProgress = (goal: Goal): number => {
  if (!goal.target_duration) return 0
  return Math.min((goal.progress_days / goal.target_duration) * 100, 100)
}

// Goal type options for the UI
export const GOAL_TYPES = [
  { value: "short-term", label: "Short Term", emoji: "🎯", color: "blue" },
  { value: "long-term", label: "Long Term", emoji: "🌟", color: "purple" },
  { value: "habit", label: "Habit", emoji: "🔄", color: "green" },
  { value: "health", label: "Health", emoji: "💪", color: "red" },
  { value: "career", label: "Career", emoji: "💼", color: "orange" },
  { value: "learning", label: "Learning", emoji: "📚", color: "cyan" },
  { value: "financial", label: "Financial", emoji: "💰", color: "yellow" },
  { value: "personal", label: "Personal", emoji: "🌱", color: "teal" },
  { value: "creative", label: "Creative", emoji: "🎨", color: "pink" },
  { value: "social", label: "Social", emoji: "👥", color: "indigo" },
  { value: "travel", label: "Travel", emoji: "✈️", color: "sky" },
  { value: "other", label: "Other", emoji: "📌", color: "gray" },
] as const

export type GoalType = typeof GOAL_TYPES[number]["value"]

export const getGoalTypeInfo = (goalType: string) => {
  return GOAL_TYPES.find(type => type.value === goalType) || GOAL_TYPES.find(type => type.value === "other")!
}
