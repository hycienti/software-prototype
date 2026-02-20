import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Session,
  SessionListResponse,
  SessionResponse,
  BookSessionRequest,
  SessionFeedbackRequest,
  SessionFeedbackResponse,
} from '@/types/api'

type ApiData<T> = { success: true; data: T }

function unwrap<T>(response: ApiData<T>): T {
  return response.data
}

/**
 * Sessions API Service
 * List, get, book, and submit feedback for sessions
 */
export const sessionsService = {
  /**
   * List sessions for the current user (or therapist). Optional status filter.
   */
  async list(params?: { page?: number; limit?: number; status?: string }): Promise<SessionListResponse> {
    const query = new URLSearchParams()
    if (params?.page != null) query.append('page', String(params.page))
    if (params?.limit != null) query.append('limit', String(params.limit))
    if (params?.status) query.append('status', params.status)
    const url = `${API_ENDPOINTS.SESSIONS.BASE}${query.toString() ? `?${query.toString()}` : ''}`
    const res = await apiClient.get<ApiData<SessionListResponse>>(url)
    return unwrap(res)
  },

  /**
   * Get a single session by id (includes userTakeaways when caller is the session's user).
   */
  async getById(id: number): Promise<SessionResponse> {
    const res = await apiClient.get<ApiData<SessionResponse>>(API_ENDPOINTS.SESSIONS.BY_ID(id))
    return unwrap(res)
  },

  /**
   * Book a new session.
   */
  async book(data: BookSessionRequest): Promise<SessionResponse> {
    const res = await apiClient.post<ApiData<SessionResponse>>(API_ENDPOINTS.SESSIONS.BASE, data)
    return unwrap(res)
  },

  /**
   * Get join token for a scheduled session's video room (user). Room must already be created by therapist.
   */
  async getJoinRoom(sessionId: number): Promise<{ meetingId: string; token: string }> {
    const res = await apiClient.get<ApiData<{ meetingId: string; token: string }>>(
      API_ENDPOINTS.SESSIONS.JOIN_ROOM(sessionId)
    )
    return unwrap(res)
  },

  /**
   * Submit feedback for a completed session.
   */
  async submitFeedback(sessionId: number, data: SessionFeedbackRequest): Promise<SessionFeedbackResponse> {
    const res = await apiClient.post<ApiData<SessionFeedbackResponse>>(
      API_ENDPOINTS.SESSIONS.FEEDBACK(sessionId),
      data
    )
    return unwrap(res)
  },
}

export type {
  Session,
  SessionListResponse,
  SessionResponse,
  BookSessionRequest,
  SessionFeedbackRequest,
  SessionFeedbackResponse,
}
