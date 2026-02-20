import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user'
import { useUIStore } from '@/store'
import type { User } from '@/types/api'

/**
 * Query key factory for user-related queries
 */
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  const { showAlert } = useUIStore()

  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userService.getProfile()
      if (response?.user == null) {
        throw new Error('User profile response missing user')
      }
      return response.user
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      console.error('Failed to fetch user profile:', error)
      // Don't show alert for profile fetch errors - use cached data
    },
  })
}

/**
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  const { showAlert } = useUIStore()

  return useMutation({
    mutationFn: async (data: { fullName?: string; avatarUrl?: string }) => {
      return userService.updateProfile(data)
    },
    onSuccess: (response) => {
      // Update the cache with the new user data
      queryClient.setQueryData<User>(userKeys.profile(), response.user)
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Profile updated successfully',
      })
    },
    onError: (error: any) => {
      console.error('Failed to update profile:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to update profile. Please try again.',
      })
    },
  })
}
