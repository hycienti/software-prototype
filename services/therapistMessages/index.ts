import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  TherapistThreadListResponse,
  TherapistThreadDetailResponse,
  SendTherapistMessageRequest,
  SendTherapistMessageResponse,
} from '@/types/api'

type ApiData<T> = { success: true; data: T }

function unwrap<T>(response: ApiData<T>): T {
  return response.data
}

/**
 * Therapist–user messaging: list threads, get/create thread by therapist, get messages, send message.
 */
export const therapistMessagesService = {
  /**
   * List threads for the current user (with therapist + last message).
   */
  async listThreads(): Promise<TherapistThreadListResponse> {
    const res = await apiClient.get<ApiData<TherapistThreadListResponse>>(API_ENDPOINTS.THERAPIST_THREADS.BASE)
    return unwrap(res)
  },

  /**
   * Get or create thread with a therapist; returns thread + messages (paginated).
   */
  async getOrCreateThreadByTherapist(
    therapistId: number,
    params?: { page?: number; limit?: number }
  ): Promise<TherapistThreadDetailResponse> {
    const query = new URLSearchParams()
    query.append('therapistId', String(therapistId))
    if (params?.page != null) query.append('page', String(params.page))
    if (params?.limit != null) query.append('limit', String(params.limit))
    const url = `${API_ENDPOINTS.THERAPIST_THREADS.BASE}?${query.toString()}`
    const res = await apiClient.get<ApiData<TherapistThreadDetailResponse>>(url)
    return unwrap(res)
  },

  /**
   * Get thread by id with messages (paginated).
   */
  async getThread(threadId: number, params?: { page?: number; limit?: number }): Promise<TherapistThreadDetailResponse> {
    const query = new URLSearchParams()
    if (params?.page != null) query.append('page', String(params.page))
    if (params?.limit != null) query.append('limit', String(params.limit))
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const res = await apiClient.get<ApiData<TherapistThreadDetailResponse>>(
      `${API_ENDPOINTS.THERAPIST_THREADS.BY_ID(threadId)}${suffix}`
    )
    return unwrap(res)
  },

  /**
   * Upload a file for chat (voice or attachment). Returns the public URL.
   * Use with sendMessage(threadId, { voiceUrl: url }) or { attachmentUrls: [url] }.
   */
  async upload(
    threadId: number,
    file: { uri: string; name?: string; type?: string }
  ): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('threadId', String(threadId))
    formData.append('file', {
      uri: file.uri,
      name: file.name ?? 'file',
      type: file.type ?? 'application/octet-stream',
    } as any)
    const res = await apiClient.post<ApiData<{ url: string }>>(
      API_ENDPOINTS.THERAPIST_THREADS.UPLOAD,
      formData
    )
    return unwrap(res)
  },

  /**
   * Send a message in a thread (text, and/or voiceUrl, and/or attachmentUrls).
   */
  async sendMessage(threadId: number, payload: SendTherapistMessageRequest): Promise<SendTherapistMessageResponse> {
    const res = await apiClient.post<ApiData<SendTherapistMessageResponse>>(
      API_ENDPOINTS.THERAPIST_THREADS.MESSAGES(threadId),
      payload
    )
    return unwrap(res)
  },
}
