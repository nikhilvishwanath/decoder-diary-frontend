// Define goal types with their colors and emojis (duplicated from AddGoal to avoid circular import)
const GOAL_TYPES = [
  { value: "short-term", label: "Short Term", color: "green", emoji: "⚡" },
  { value: "long-term", label: "Long Term", color: "blue", emoji: "🎯" },
  { value: "habit", label: "Habit", color: "purple", emoji: "🔄" },
  { value: "daily", label: "Daily", color: "orange", emoji: "📅" },
  { value: "weekly", label: "Weekly", color: "teal", emoji: "📊" },
  { value: "monthly", label: "Monthly", color: "cyan", emoji: "🗓️" },
  { value: "yearly", label: "Yearly", color: "pink", emoji: "📈" },
  { value: "personal", label: "Personal", color: "red", emoji: "🌟" },
  { value: "career", label: "Career", color: "yellow", emoji: "💼" },
  { value: "health", label: "Health", color: "green", emoji: "💪" },
  { value: "financial", label: "Financial", color: "gray", emoji: "💰" },
  { value: "learning", label: "Learning", color: "indigo", emoji: "📚" },
] as const

export interface ParsedGoal {
  goalType: string
  description: string
  goalTypeConfig: {
    label: string
    color: string
    emoji: string
  }
}

export function parseGoalData(description: string | null | undefined): ParsedGoal {
  if (!description) {
    return {
      goalType: "short-term",
      description: "",
      goalTypeConfig: { label: "Short Term", color: "green", emoji: "⚡" }
    }
  }

  // Check if description contains goal type metadata
  const goalTypeMatch = description.match(/^\[GOAL_TYPE:([^\]]+)\](.*)$/)
  
  if (goalTypeMatch) {
    const goalType = goalTypeMatch[1]
    const actualDescription = goalTypeMatch[2]
    const goalTypeConfig = GOAL_TYPES.find(type => type.value === goalType) || GOAL_TYPES[0]
    
    return {
      goalType,
      description: actualDescription,
      goalTypeConfig: {
        label: goalTypeConfig.label,
        color: goalTypeConfig.color,
        emoji: goalTypeConfig.emoji
      }
    }
  }

  // If no goal type metadata, treat as short-term with original description
  return {
    goalType: "short-term",
    description,
    goalTypeConfig: { label: "Short Term", color: "green", emoji: "⚡" }
  }
}
