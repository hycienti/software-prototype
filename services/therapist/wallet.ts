import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type { WalletResponse, WalletListParams, WithdrawResponse } from '@/types/therapist'
import { unwrapTherapistApi } from '@/services/therapist/unwrapApi'

export async function getWallet(params?: WalletListParams): Promise<WalletResponse> {
  const queryParams: Record<string, string | number> = {
    transactionsPage: params?.transactionsPage ?? 1,
    transactionsLimit: params?.transactionsLimit ?? 20,
    withdrawalsPage: params?.withdrawalsPage ?? 1,
    withdrawalsLimit: params?.withdrawalsLimit ?? 10,
  }

  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)])
  ).toString()

  const path = `${API_ENDPOINTS.THERAPIST.WALLET.BASE}?${queryString}`
  const res = await apiClient.get<WalletResponse | { success: true; data: WalletResponse }>(path)
  return unwrapTherapistApi(res)
}

export async function withdraw(amountCents: number): Promise<WithdrawResponse> {
  const res = await apiClient.post<
    WithdrawResponse | { success: true; data: WithdrawResponse }
  >(API_ENDPOINTS.THERAPIST.WALLET.WITHDRAW, { amountCents })
  return unwrapTherapistApi(res)
}
