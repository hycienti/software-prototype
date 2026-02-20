import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CompleteSignupRequest,
  CompleteSignupResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '@/types/api'

/** Backend returns { success: true, data: T }. Unwrap to T. */
function unwrap<T>(response: { success?: boolean; data?: T } | T): T {
  if (response && typeof response === 'object' && 'success' in response && response.data !== undefined) {
    return response.data as T
  }
  return response as T
}

/**
 * Authentication API Service
 * Handles email/OTP authentication flows
 */
export const authService = {
  /**
   * Send OTP code to email address
   * @param data - Email address
   * @returns Success message and expiration time
   */
  async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    const res = await apiClient.post<SendOtpResponse | { success: true; data: SendOtpResponse }>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      data
    )
    return unwrap(res)
  },

  /**
   * Verify OTP code
   * @param data - Email and OTP code
   * @returns User data and token if existing user, or signup requirement if new user
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const res = await apiClient.post<VerifyOtpResponse | { success: true; data: VerifyOtpResponse }>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    )
    return unwrap(res)
  },

  /**
   * Complete signup for new users (provide fullname)
   * @param data - Email and fullname
   * @returns User data and bearer token
   */
  async completeSignup(data: CompleteSignupRequest): Promise<CompleteSignupResponse> {
    const res = await apiClient.post<
      CompleteSignupResponse | { success: true; data: CompleteSignupResponse }
    >(API_ENDPOINTS.AUTH.COMPLETE_SIGNUP, data)
    return unwrap(res)
  },

  /**
   * Refresh the current access token
   * Requires authentication - the current token will be invalidated
   * @returns New bearer token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const res = await apiClient.post<
      RefreshTokenResponse | { success: true; data: RefreshTokenResponse }
    >(API_ENDPOINTS.AUTH.REFRESH)
    return unwrap(res)
  },

  /**
   * Logout and invalidate the current access token
   * Requires authentication
   * @returns Success message
   */
  async logout(): Promise<LogoutResponse> {
    const res = await apiClient.post<LogoutResponse | { success: true; data: LogoutResponse }>(
      API_ENDPOINTS.AUTH.LOGOUT
    )
    return unwrap(res)
  },
}

// Re-export types for convenience
export type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CompleteSignupRequest,
  CompleteSignupResponse,
  RefreshTokenResponse,
  LogoutResponse,
}
