import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { DashboardStats } from '@/types/therapist'
import { unwrapTherapistApi } from '@/services/therapist/unwrapApi'

export async function getDashboard(): Promise<DashboardStats> {
  const res = await apiClient.get<DashboardStats | { success: true; data: DashboardStats }>(
    API_ENDPOINTS.THERAPIST.DASHBOARD
  )
  return unwrapTherapistApi(res)
}
