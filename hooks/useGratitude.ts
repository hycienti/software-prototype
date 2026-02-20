import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gratitudeService } from '@/services/gratitude'
import { useUIStore } from '@/store'
import type {
  Gratitude,
  CreateGratitudeRequest,
  UpdateGratitudeRequest,
  GratitudeInsights,
  GratitudeQuote,
  GratitudeListResponse,
  GratitudeStreakResponse,
} from '@/services/gratitude'

/**
 * Query key factory for gratitude-related queries
 */
export const gratitudeKeys = {
  all: ['gratitude'] as const,
  lists: () => [...gratitudeKeys.all, 'list'] as const,
  list: (filters?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    [...gratitudeKeys.lists(), filters] as const,
  details: () => [...gratitudeKeys.all, 'detail'] as const,
  detail: (id: number) => [...gratitudeKeys.details(), id] as const,
  streak: () => [...gratitudeKeys.all, 'streak'] as const,
  insights: () => [...gratitudeKeys.all, 'insights'] as const,
  quote: () => [...gratitudeKeys.all, 'quote'] as const,
}

/**
 * Hook to fetch gratitude history
 */
export function useGratitudeHistory(params?: {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}) {
  const { showAlert } = useUIStore()

  return useQuery<GratitudeListResponse>({
    queryKey: gratitudeKeys.list(params),
    queryFn: () => gratitudeService.getHistory(params),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error: any) => {
      console.error('Failed to fetch gratitude history:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to load gratitude history. Please try again.',
      })
    },
  })
}

/**
 * Hook to fetch a specific gratitude entry
 */
export function useGratitudeEntry(id: number | null) {
  return useQuery({
    queryKey: gratitudeKeys.detail(id!),
    queryFn: () => gratitudeService.getById(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch gratitude streak
 */
export function useGratitudeStreak() {
  return useQuery({
    queryKey: gratitudeKeys.streak(),
    queryFn: () => gratitudeService.getStreak(),
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Hook to fetch gratitude insights
 */
export function useGratitudeInsights() {
  const { showAlert } = useUIStore()

  return useQuery<GratitudeInsights>({
    queryKey: gratitudeKeys.insights(),
    queryFn: () => gratitudeService.getInsights(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      console.error('Failed to fetch gratitude insights:', error)
      // Don't show alert - insights are not critical
    },
  })
}

/**
 * Hook to fetch random gratitude quote
 */
export function useGratitudeQuote() {
  return useQuery({
    queryKey: gratitudeKeys.quote(),
    queryFn: () => gratitudeService.getRandomQuote(),
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes - quotes don't change often
  })
}

/**
 * Hook to create a gratitude entry
 */
export function useCreateGratitude() {
  const queryClient = useQueryClient()
  const { showAlert } = useUIStore()

  return useMutation({
    mutationFn: (data: CreateGratitudeRequest) => gratitudeService.create(data),
    onSuccess: () => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.streak() })
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.insights() })
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Gratitude entry saved successfully!',
      })
    },
    onError: (error: any) => {
      const apiMessage =
        error?.data?.error?.message ??
        error?.response?.data?.error?.message ??
        error?.response?.data?.data?.error?.message
      const message = apiMessage || error?.message || 'Failed to save gratitude entry. Please try again.'
      console.error('Error saving gratitude entry:', message)
      showAlert({
        type: 'error',
        title: 'Error',
        message,
      })
    },
  })
}

/**
 * Hook to update a gratitude entry
 */
export function useUpdateGratitude() {
  const queryClient = useQueryClient()
  const { showAlert } = useUIStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGratitudeRequest }) =>
      gratitudeService.update(id, data),
    onSuccess: (response, variables) => {
      // Update the specific entry in cache
      queryClient.setQueryData(gratitudeKeys.detail(variables.id), response)
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.insights() })
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Gratitude entry updated successfully',
      })
    },
    onError: (error: any) => {
      console.error('Error updating gratitude entry:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to update gratitude entry. Please try again.',
      })
    },
  })
}

/**
 * Hook to delete a gratitude entry
 */
export function useDeleteGratitude() {
  const queryClient = useQueryClient()
  const { showAlert } = useUIStore()

  return useMutation({
    mutationFn: (id: number) => gratitudeService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: gratitudeKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.streak() })
      queryClient.invalidateQueries({ queryKey: gratitudeKeys.insights() })
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Gratitude entry deleted successfully',
      })
    },
    onError: (error: any) => {
      console.error('Error deleting gratitude entry:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to delete gratitude entry. Please try again.',
      })
    },
  })
}
