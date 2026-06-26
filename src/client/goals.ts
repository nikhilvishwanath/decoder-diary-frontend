import { ItemsService, type ItemCreate, type ItemUpdate } from "./index"

/**
 * Goals service that wraps the Items API
 * Goals are stored as items with special description format: [GOAL_TYPE:type]description
 */
export class GoalsService {
  /**
   * Get all goals for the current user
   */
  static async getGoals(params?: { skip?: number; limit?: number }) {
    return ItemsService.readItems(params)
  }

  /**
   * Get a specific goal by ID
   */
  static async getGoal(id: string) {
    return ItemsService.readItem({ id })
  }

  /**
   * Create a new goal
   */
  static async createGoal(data: ItemCreate) {
    return ItemsService.createItem({ requestBody: data })
  }

  /**
   * Update an existing goal
   */
  static async updateGoal(params: { id: string; requestBody: ItemUpdate }) {
    return ItemsService.updateItem(params)
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(id: string) {
    return ItemsService.deleteItem({ id })
  }
}

export default GoalsService
