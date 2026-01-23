import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Achievement,
  AchievementListResponse,
  AchievementResponse,
} from '@/types/api'

/**
 * Achievements API Service
 * Handles all achievement-related API operations
 */
export const achievementsService = {
  /**
   * Get all user achievements
   */
  async getAll(completed?: boolean): Promise<AchievementListResponse> {
    const queryParams = new URLSearchParams()
    if (completed !== undefined) {
      queryParams.append('completed', completed.toString())
    }

    const url = `${API_ENDPOINTS.ACHIEVEMENTS.BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<AchievementListResponse>(url)
  },

  /**
   * Get a specific achievement
   */
  async getById(id: number): Promise<AchievementResponse> {
    return apiClient.get<AchievementResponse>(API_ENDPOINTS.ACHIEVEMENTS.BY_ID(id))
  },
}

// Re-export types for convenience
export type { Achievement, AchievementListResponse, AchievementResponse }
