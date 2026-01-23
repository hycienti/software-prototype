import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { User } from '@/types/api'

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
    return apiClient.get<{ user: User }>(API_ENDPOINTS.USER.ME)
  },

  /**
   * Update user profile
   * @param data - Profile update data (fullName, avatarUrl)
   * @returns Updated user profile
   */
  async updateProfile(data: { fullName?: string; avatarUrl?: string }): Promise<{ user: User }> {
    return apiClient.patch<{ user: User }>(API_ENDPOINTS.USER.UPDATE, data)
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
