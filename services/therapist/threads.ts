import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  ThreadListResponse,
  ThreadDetailResponse,
  SendThreadMessageRequest,
  SendThreadMessageResponse,
} from '@/types/therapist'
import { unwrapTherapistApi } from '@/services/therapist/unwrapApi'

type ApiData<T> = { success: true; data: T }

function unwrap<T>(response: ApiData<T> | T): T {
  return unwrapTherapistApi(response)
}

export async function listThreads(): Promise<ThreadListResponse> {
  const res = await apiClient.get<ApiData<ThreadListResponse>>(
    API_ENDPOINTS.THERAPIST.THREADS.LIST
  )
  const data = unwrap(res as ApiData<ThreadListResponse>)
  return { threads: data.threads ?? [] }
}

export async function getOrCreateThreadByUser(
  userId: number,
  params?: { page?: number; limit?: number }
): Promise<ThreadDetailResponse> {
  const queryParams: Record<string, string | number> = { userId }
  if (params?.page) queryParams.page = params.page
  if (params?.limit) queryParams.limit = params.limit

  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)])
  ).toString()

  const path = `${API_ENDPOINTS.THERAPIST.THREADS.LIST}?${queryString}`
  const res = await apiClient.get<ApiData<ThreadDetailResponse>>(path)
  return unwrap(res as ApiData<ThreadDetailResponse>)
}

export async function getOrCreateThreadBySession(
  sessionId: number,
  params?: { page?: number; limit?: number }
): Promise<ThreadDetailResponse> {
  const queryParams: Record<string, string | number> = { sessionId }
  if (params?.page) queryParams.page = params.page
  if (params?.limit) queryParams.limit = params.limit

  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)])
  ).toString()

  const path = `${API_ENDPOINTS.THERAPIST.THREADS.LIST}?${queryString}`
  const res = await apiClient.get<ApiData<ThreadDetailResponse>>(path)
  return unwrap(res as ApiData<ThreadDetailResponse>)
}

export async function getThread(
  threadId: number,
  params?: { page?: number; limit?: number }
): Promise<ThreadDetailResponse> {
  const queryParams: Record<string, string | number> = {}
  if (params?.page) queryParams.page = params.page
  if (params?.limit) queryParams.limit = params.limit

  const queryString = Object.keys(queryParams).length
    ? '?' + new URLSearchParams(
        Object.entries(queryParams).map(([k, v]) => [k, String(v)])
      ).toString()
    : ''

  const path = `${API_ENDPOINTS.THERAPIST.THREADS.DETAIL(threadId)}${queryString}`
  const res = await apiClient.get<ApiData<ThreadDetailResponse>>(path)
  return unwrap(res as ApiData<ThreadDetailResponse>)
}

export async function uploadFile(
  threadId: number,
  file: { uri: string; name?: string; type?: string }
): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('threadId', String(threadId))
  formData.append('file', {
    uri: file.uri,
    name: file.name ?? 'file',
    type: file.type ?? 'application/octet-stream',
  } as unknown as Blob)
  const res = await apiClient.post<ApiData<{ url: string }>>(
    API_ENDPOINTS.THERAPIST.THREADS.UPLOAD,
    formData
  )
  return unwrap(res as ApiData<{ url: string }>)
}

export async function sendMessage(
  threadId: number,
  payload: SendThreadMessageRequest
): Promise<SendThreadMessageResponse> {
  const path = API_ENDPOINTS.THERAPIST.THREADS.MESSAGES(threadId)
  const res = await apiClient.post<ApiData<SendThreadMessageResponse>>(path, payload)
  return unwrap(res as ApiData<SendThreadMessageResponse>)
}
