import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { User } from '@/types/api'

/** Standard API success shape from backend */
interface ApiSuccess<T> {
  success: true
  data: T
}

/**
 * User API Service
 * Handles user profile operations
 */
export const userService = {
  /**
   * Get current user profile
   * @returns User profile data
   */
  async getProfile(): Promise<{ user: User }> {
    const res = await apiClient.get<ApiSuccess<{ user: User }>>(API_ENDPOINTS.USER.ME)
    if (typeof res === 'object' && (res as ApiSuccess<{ user: User }>).success && (res as ApiSuccess<{ user: User }>).data) {
      return (res as ApiSuccess<{ user: User }>).data
    }
    return res as { user: User }
  },

  /**
   * Update user profile
   * @param data - Profile update data (fullName, avatarUrl)
   * @returns Updated user profile
   */
  async updateProfile(data: { fullName?: string; avatarUrl?: string }): Promise<{ user: User }> {
    const res = await apiClient.patch<ApiSuccess<{ user: User }>>(API_ENDPOINTS.USER.UPDATE, data)
    if (typeof res === 'object' && (res as ApiSuccess<{ user: User }>).success && (res as ApiSuccess<{ user: User }>).data) {
      return (res as ApiSuccess<{ user: User }>).data
    }
    return res as { user: User }
  },

  /**
   * Delete user account
   * @returns Success message
   */
  async deleteAccount(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.USER.DELETE)
  },
}

// Re-export types for convenience
export type { User }
