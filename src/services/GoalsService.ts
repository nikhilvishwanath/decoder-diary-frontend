import { Goal, GoalCreate, GoalUpdate, GoalsResponse } from "../types/goals"

// Goals service that uses the dedicated goals API
export class GoalsService {
  // Helper to get auth headers
  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    }
  }

  // Helper to handle API errors
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }
    return response.json()
  }

  // Get all goals for the current user
  static async getGoals(page: number = 1, limit: number = 100): Promise<GoalsResponse> {
    const skip = (page - 1) * limit
    const response = await fetch(`/api/v1/goals/?skip=${skip}&limit=${limit}`, {
      headers: this.getHeaders(),
    })
    
    return this.handleResponse<GoalsResponse>(response)
  }

  // Get a specific goal by ID
  static async getGoal(id: string): Promise<Goal> {
    const response = await fetch(`/api/v1/goals/${id}`, {
      headers: this.getHeaders(),
    })
    
    return this.handleResponse<Goal>(response)
  }

  // Create a new goal
  static async createGoal(goalData: GoalCreate): Promise<Goal> {
    const response = await fetch('/api/v1/goals/', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(goalData),
    })
    
    return this.handleResponse<Goal>(response)
  }

  // Update an existing goal
  static async updateGoal(id: string, goalData: GoalUpdate): Promise<Goal> {
    const response = await fetch(`/api/v1/goals/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(goalData),
    })
    
    return this.handleResponse<Goal>(response)
  }

  // Delete a goal
  static async deleteGoal(id: string): Promise<void> {
    const response = await fetch(`/api/v1/goals/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }
  }

  // Update goal progress
  static async updateGoalProgress(id: string, hoursToAdd: number = 0, daysToAdd: number = 0): Promise<Goal> {
    const response = await fetch(`/api/v1/goals/${id}/progress`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ hours_to_add: hoursToAdd, days_to_add: daysToAdd }),
    })
    
    return this.handleResponse<Goal>(response)
  }
}
