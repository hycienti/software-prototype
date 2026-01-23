import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Mood,
  CreateMoodRequest,
  UpdateMoodRequest,
  MoodResponse,
  MoodListResponse,
  MoodStreakResponse,
  MoodInsights,
} from '@/types/api'

/**
 * Mood API Service
 * Handles all mood-related API operations
 */
export const moodService = {
  /**
   * Create a new mood entry
   */
  async create(data: CreateMoodRequest): Promise<MoodResponse> {
    return apiClient.post<MoodResponse>(API_ENDPOINTS.MOOD.BASE, data)
  },

  /**
   * Get user's mood entries with pagination
   */
  async getHistory(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    mood?: string
  }): Promise<MoodListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.mood) queryParams.append('mood', params.mood)

    const url = `${API_ENDPOINTS.MOOD.BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<MoodListResponse>(url)
  },

  /**
   * Get a specific mood entry
   */
  async getById(id: number): Promise<MoodResponse> {
    return apiClient.get<MoodResponse>(API_ENDPOINTS.MOOD.BY_ID(id))
  },

  /**
   * Update a mood entry
   */
  async update(id: number, data: UpdateMoodRequest): Promise<MoodResponse> {
    return apiClient.patch<MoodResponse>(API_ENDPOINTS.MOOD.BY_ID(id), data)
  },

  /**
   * Delete a mood entry
   */
  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.MOOD.BY_ID(id))
  },

  /**
   * Get current mood tracking streak
   */
  async getStreak(): Promise<MoodStreakResponse> {
    return apiClient.get<MoodStreakResponse>(API_ENDPOINTS.MOOD.STREAK)
  },

  /**
   * Get mood insights
   */
  async getInsights(): Promise<MoodInsights> {
    return apiClient.get<MoodInsights>(API_ENDPOINTS.MOOD.INSIGHTS)
  },
}

// Re-export types for convenience
export type {
  Mood,
  CreateMoodRequest,
  UpdateMoodRequest,
  MoodResponse,
  MoodListResponse,
  MoodStreakResponse,
  MoodInsights,
}
