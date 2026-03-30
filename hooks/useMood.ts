import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moodService } from '@/services/mood'
import { useUIStore } from '@/store'
import type {
  Mood,
  CreateMoodRequest,
  UpdateMoodRequest,
  MoodInsights,
  MoodStreakResponse,
} from '@/services/mood'

/**
 * Query key factory for mood-related queries
 */
export const moodKeys = {
  all: ['mood'] as const,
  lists: () => [...moodKeys.all, 'list'] as const,
  list: (filters?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    mood?: string
  }) => [...moodKeys.lists(), filters] as const,
  details: () => [...moodKeys.all, 'detail'] as const,
  detail: (id: number) => [...moodKeys.details(), id] as const,
  streak: () => [...moodKeys.all, 'streak'] as const,
  insights: () => [...moodKeys.all, 'insights'] as const,
}

/**
 * Hook to fetch mood history
 */
export function useMoodHistory(params?: {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  mood?: string
}) {
  const { showAlert } = useUIStore()

  return useQuery({
    queryKey: moodKeys.list(params),
    queryFn: () => moodService.getHistory(params),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a specific mood entry
 */
export function useMoodEntry(id: number | null) {
  return useQuery({
    queryKey: moodKeys.detail(id!),
    queryFn: () => moodService.getById(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch mood streak
 */
export function useMoodStreak() {
  return useQuery<MoodStreakResponse>({
    queryKey: moodKeys.streak(),
    queryFn: () => moodService.getStreak(),
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Hook to fetch mood insights
 */
export function useMoodInsights() {
  const { showAlert } = useUIStore()

  return useQuery<MoodInsights>({
    queryKey: moodKeys.insights(),
    queryFn: () => moodService.getInsights(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create a mood entry
 */
export function useCreateMood() {
  const queryClient = useQueryClient()
  const { showAlert } = useUIStore()

  return useMutation({
    mutationFn: (data: CreateMoodRequest) => moodService.create(data),
    onSuccess: () => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: moodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: moodKeys.streak() })
      queryClient.invalidateQueries({ queryKey: moodKeys.insights() })
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Mood entry saved successfully!',
      })
    },
    onError: (error: any) => {
      console.error('Error saving mood entry:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to save mood entry. Please try again.',
      })
    },
  })
}

/**
 * Hook to update a mood entry
 */
export function useUpdateMood() {
  const queryClient = useQueryClient()
  const { showAlert } = useUIStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMoodRequest }) =>
      moodService.update(id, data),
    onSuccess: (response, variables) => {
      // Update the specific entry in cache
      queryClient.setQueryData(moodKeys.detail(variables.id), response)
      queryClient.invalidateQueries({ queryKey: moodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: moodKeys.insights() })
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Mood entry updated successfully',
      })
    },
    onError: (error: any) => {
      console.error('Error updating mood entry:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to update mood entry. Please try again.',
      })
    },
  })
}

/**
 * Hook to delete a mood entry
 */
export function useDeleteMood() {
  const queryClient = useQueryClient()
  const { showAlert } = useUIStore()

  return useMutation({
    mutationFn: (id: number) => moodService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: moodKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: moodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: moodKeys.streak() })
      queryClient.invalidateQueries({ queryKey: moodKeys.insights() })
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Mood entry deleted successfully',
      })
    },
    onError: (error: any) => {
      console.error('Error deleting mood entry:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to delete mood entry. Please try again.',
      })
    },
  })
}
