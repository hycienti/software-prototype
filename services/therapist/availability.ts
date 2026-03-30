import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { AvailabilityResponse, AvailabilityUpdatePayload } from '@/types/therapist'
import { unwrapTherapistApi } from '@/services/therapist/unwrapApi'

export async function getAvailability(): Promise<AvailabilityResponse> {
  const res = await apiClient.get<
    AvailabilityResponse | { success: true; data: AvailabilityResponse }
  >(API_ENDPOINTS.THERAPIST.AVAILABILITY)
  return unwrapTherapistApi(res)
}

export async function updateAvailability(
  payload: AvailabilityUpdatePayload
): Promise<AvailabilityResponse | null> {
  const res = await apiClient.put<
    AvailabilityResponse | { success: true; data: AvailabilityResponse }
  >(API_ENDPOINTS.THERAPIST.AVAILABILITY, payload)
  const unwrapped = unwrapTherapistApi(res)
  return unwrapped ?? null
}
