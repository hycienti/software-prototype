import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Gratitude,
  CreateGratitudeRequest,
  UpdateGratitudeRequest,
  GratitudeResponse,
  GratitudeListResponse,
  GratitudeStreakResponse,
  GratitudeInsights,
  GratitudeQuote,
} from '@/types/api'

/**
 * Gratitude API Service
 * Handles all gratitude-related API operations
 */
export const gratitudeService = {
  /**
   * Create a new gratitude entry
   */
  async create(data: CreateGratitudeRequest): Promise<GratitudeResponse> {
    return apiClient.post<GratitudeResponse>(API_ENDPOINTS.GRATITUDE.BASE, data)
  },

  /**
   * Upload a photo for gratitude entry. Returns URL to use as photoUrl when creating a gratitude.
   */
  async uploadPhoto(file: {
    uri: string
    name?: string
    type?: string
  }): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', {
      uri: file.uri,
      name: file.name ?? 'photo.jpg',
      type: file.type ?? 'image/jpeg',
    } as unknown as Blob)
    const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
      API_ENDPOINTS.GRATITUDE.UPLOAD_PHOTO,
      formData
    )
    const url = (res as { data?: { url?: string } })?.data?.url
    if (!url) {
      throw new Error('Upload did not return URL')
    }
    return { url }
  },

  /**
   * Get user's gratitude entries with pagination
   */
  async getHistory(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<GratitudeListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)

    const url = `${API_ENDPOINTS.GRATITUDE.BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<GratitudeListResponse>(url)
  },

  /**
   * Get a specific gratitude entry
   */
  async getById(id: number): Promise<GratitudeResponse> {
    return apiClient.get<GratitudeResponse>(API_ENDPOINTS.GRATITUDE.BY_ID(id))
  },

  /**
   * Update a gratitude entry
   */
  async update(id: number, data: UpdateGratitudeRequest): Promise<GratitudeResponse> {
    return apiClient.patch<GratitudeResponse>(API_ENDPOINTS.GRATITUDE.BY_ID(id), data)
  },

  /**
   * Delete a gratitude entry
   */
  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.GRATITUDE.BY_ID(id))
  },

  /**
   * Get current gratitude streak
   */
  async getStreak(): Promise<GratitudeStreakResponse> {
    return apiClient.get<GratitudeStreakResponse>(API_ENDPOINTS.GRATITUDE.STREAK)
  },

  /**
   * Get growth insights
   */
  async getInsights(): Promise<GratitudeInsights> {
    return apiClient.get<GratitudeInsights>(API_ENDPOINTS.GRATITUDE.INSIGHTS)
  },

  /**
   * Get a random gratitude quote
   */
  async getRandomQuote(): Promise<GratitudeQuote> {
    return apiClient.get<GratitudeQuote>(API_ENDPOINTS.GRATITUDE.RANDOM_QUOTE)
  },
}

// Re-export types for convenience
export type {
  Gratitude,
  CreateGratitudeRequest,
  UpdateGratitudeRequest,
  GratitudeResponse,
  GratitudeListResponse,
  GratitudeStreakResponse,
  GratitudeInsights,
  GratitudeQuote,
}
