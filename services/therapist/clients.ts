import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { ClientItem, ClientsListParams, ListMeta } from '@/types/therapist'
import { unwrapTherapistApi } from '@/services/therapist/unwrapApi'

export async function getClients(
  params?: ClientsListParams
): Promise<{ clients: ClientItem[]; meta: ListMeta }> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const queryParams: Record<string, string | number> = { page, limit }
  if (params?.search) queryParams.search = params.search

  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)])
  ).toString()

  const path = queryString
    ? `${API_ENDPOINTS.THERAPIST.CLIENTS}?${queryString}`
    : API_ENDPOINTS.THERAPIST.CLIENTS

  const res = await apiClient.get<
    { clients: ClientItem[]; meta: ListMeta } | { success: true; data: { clients: ClientItem[]; meta: ListMeta } }
  >(path)
  const unwrapped = unwrapTherapistApi(res)
  return {
    clients: unwrapped.clients ?? [],
    meta: unwrapped.meta ?? { page, limit, total: 0 },
  }
}
