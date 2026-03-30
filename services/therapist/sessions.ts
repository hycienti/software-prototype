import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { TherapistSessionSummary, SessionsListParams, SessionSummaryPatchPayload, ListMeta } from '@/types/therapist'
import { unwrapTherapistApi } from '@/services/therapist/unwrapApi'

/** In-memory store for test-room credentials so we don't pass token in URL. */
let lastTestRoomCredentials: { meetingId: string; token: string } | null = null

export function setLastTestRoomCredentials(creds: { meetingId: string; token: string } | null) {
  lastTestRoomCredentials = creds
}

export function getLastTestRoomCredentials(meetingId: string): { meetingId: string; token: string } | null {
  if (lastTestRoomCredentials?.meetingId === meetingId) return lastTestRoomCredentials
  return null
}

export function clearLastTestRoomCredentials() {
  lastTestRoomCredentials = null
}

export async function getSessions(
  params?: SessionsListParams
): Promise<{ sessions: TherapistSessionSummary[]; meta: ListMeta }> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const queryParams: Record<string, string | number> = { page, limit }
  if (params?.status) queryParams.status = params.status

  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)])
  ).toString()

  const path = queryString
    ? `${API_ENDPOINTS.SESSIONS.BASE}?${queryString}`
    : API_ENDPOINTS.SESSIONS.BASE

  const res = await apiClient.get<
    | { sessions: TherapistSessionSummary[]; meta: ListMeta }
    | { success: true; data: { sessions: TherapistSessionSummary[]; meta: ListMeta } }
  >(path)
  const unwrapped = unwrapTherapistApi(res)
  return {
    sessions: unwrapped.sessions ?? [],
    meta: unwrapped.meta ?? { page, limit, total: 0 },
  }
}

export async function getSession(sessionId: string | number): Promise<TherapistSessionSummary> {
  const res = await apiClient.get<
    { session: TherapistSessionSummary } | { success: true; data: { session: TherapistSessionSummary } }
  >(API_ENDPOINTS.SESSIONS.BY_ID(sessionId))
  return unwrapTherapistApi(res).session
}

export async function createRoom(
  sessionId: string | number
): Promise<{ meetingId: string; token: string }> {
  const res = await apiClient.post<
    | { meetingId: string; token: string }
    | { success: true; data: { meetingId: string; token: string } }
  >(API_ENDPOINTS.SESSIONS.CREATE_ROOM(sessionId))
  return unwrapTherapistApi(res)
}

export async function createTestRoom(): Promise<{ meetingId: string; token: string }> {
  const res = await apiClient.post<
    | { meetingId: string; token: string }
    | { success: true; data: { meetingId: string; token: string } }
  >(API_ENDPOINTS.SESSIONS.TEST_ROOM)
  return unwrapTherapistApi(res)
}

export async function patchSessionSummary(
  sessionId: string | number,
  payload: SessionSummaryPatchPayload
): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.SESSIONS.SUMMARY(sessionId), payload)
}
