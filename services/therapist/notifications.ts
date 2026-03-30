import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { NotificationItem, NotificationsListParams, ListMeta } from '@/types/therapist'
import { unwrapTherapistApi } from '@/services/therapist/unwrapApi'

export async function getNotifications(
  params?: NotificationsListParams
): Promise<{ notifications: NotificationItem[]; meta: ListMeta }> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const queryParams: Record<string, string | number> = { page, limit }
  if (params?.isRead !== undefined) queryParams.isRead = params.isRead ? 'true' : 'false'

  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)])
  ).toString()

  const path = `${API_ENDPOINTS.THERAPIST.NOTIFICATIONS.LIST}?${queryString}`
  const res = await apiClient.get<
    | { notifications: NotificationItem[]; meta: ListMeta }
    | { success: true; data: { notifications: NotificationItem[]; meta: ListMeta } }
  >(path)
  const unwrapped = unwrapTherapistApi(res)
  return {
    notifications: unwrapped.notifications ?? [],
    meta: unwrapped.meta ?? { page, limit, total: 0 },
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.THERAPIST.NOTIFICATIONS.MARK_ALL_READ)
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.THERAPIST.NOTIFICATIONS.BY_ID(id))
}

export async function removeNotification(id: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.THERAPIST.NOTIFICATIONS.BY_ID(id))
}
