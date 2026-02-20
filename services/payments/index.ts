import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentListResponse,
} from '@/types/api'

type ApiData<T> = { success: true; data: T }

function unwrap<T>(response: ApiData<T>): T {
  return response.data
}

/**
 * User payments: mock payment + book session, list payments
 */
export const paymentsService = {
  /**
   * Create a mock payment and book the session. Returns payment + session.
   */
  async create(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const res = await apiClient.post<ApiData<CreatePaymentResponse>>(
      API_ENDPOINTS.PAYMENTS.BASE,
      data
    )
    return unwrap(res)
  },

  /**
   * List current user's payments (paginated).
   */
  async list(params?: { page?: number; limit?: number }): Promise<PaymentListResponse> {
    const query = new URLSearchParams()
    if (params?.page != null) query.append('page', String(params.page))
    if (params?.limit != null) query.append('limit', String(params.limit))
    const url = `${API_ENDPOINTS.PAYMENTS.BASE}${query.toString() ? `?${query.toString()}` : ''}`
    const res = await apiClient.get<ApiData<PaymentListResponse>>(url)
    return unwrap(res)
  },
}

export type { CreatePaymentRequest, CreatePaymentResponse, PaymentListResponse }
