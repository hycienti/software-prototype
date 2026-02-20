import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  TherapistForUser,
  TherapistListResponse,
  TherapistResponse,
  BookableSlotsResponse,
} from '@/types/api'

type ApiData<T> = { success: true; data: T }

function unwrap<T>(response: ApiData<T>): T {
  return response.data
}

/**
 * User-facing Therapists API Service
 * List and get therapist profile (safe fields only)
 */
export const therapistsService = {
  /**
   * List therapists with optional search and pagination.
   */
  async list(params?: { page?: number; limit?: number; search?: string }): Promise<TherapistListResponse> {
    const query = new URLSearchParams()
    if (params?.page != null) query.append('page', String(params.page))
    if (params?.limit != null) query.append('limit', String(params.limit))
    if (params?.search) query.append('search', params.search)
    const url = `${API_ENDPOINTS.THERAPISTS.BASE}${query.toString() ? `?${query.toString()}` : ''}`
    const res = await apiClient.get<ApiData<TherapistListResponse>>(url)
    return unwrap(res)
  },

  /**
   * Get a single therapist by id (user-facing safe fields).
   */
  async getById(id: number): Promise<TherapistResponse> {
    const res = await apiClient.get<ApiData<TherapistResponse>>(API_ENDPOINTS.THERAPISTS.BY_ID(id))
    return unwrap(res)
  },

  /**
   * Get bookable (date, time) slots for a therapist. Excludes already-booked slots.
   * from/to in YYYY-MM-DD (default: next 14 days).
   */
  async getBookableSlots(
    therapistId: number,
    params?: { from?: string; to?: string }
  ): Promise<BookableSlotsResponse> {
    const query = new URLSearchParams()
    if (params?.from) query.append('from', params.from)
    if (params?.to) query.append('to', params.to)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const res = await apiClient.get<ApiData<BookableSlotsResponse>>(
      `${API_ENDPOINTS.THERAPISTS.BOOKABLE_SLOTS(therapistId)}${suffix}`
    )
    return unwrap(res)
  },
}

export type { TherapistForUser, TherapistListResponse, TherapistResponse, BookableSlotsResponse }
