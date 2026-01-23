import { useQuery } from '@tanstack/react-query'
import { achievementsService } from '@/services/achievements'

/**
 * Query key factory for achievements-related queries
 */
export const achievementsKeys = {
  all: ['achievements'] as const,
  lists: () => [...achievementsKeys.all, 'list'] as const,
  list: (completed?: boolean) => [...achievementsKeys.lists(), completed] as const,
  details: () => [...achievementsKeys.all, 'detail'] as const,
  detail: (id: number) => [...achievementsKeys.details(), id] as const,
}

/**
 * Hook to fetch user achievements
 */
export function useAchievements(completed?: boolean) {
  return useQuery({
    queryKey: achievementsKeys.list(completed),
    queryFn: () => achievementsService.getAll(completed),
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes - achievements don't change often
  })
}

/**
 * Hook to fetch a specific achievement
 */
export function useAchievement(id: number | null) {
  return useQuery({
    queryKey: achievementsKeys.detail(id!),
    queryFn: () => achievementsService.getById(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
