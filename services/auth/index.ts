import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  AuthResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CompleteSignupRequest,
  CompleteSignupResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '@/types/api'

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
    return apiClient.post<SendOtpResponse>(API_ENDPOINTS.AUTH.SEND_OTP, data)
  },

  /**
   * Verify OTP code
   * @param data - Email and OTP code
   * @returns User data and token if existing user, or signup requirement if new user
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return apiClient.post<VerifyOtpResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data)
  },

  /**
   * Complete signup for new users (provide fullname)
   * @param data - Email and fullname
   * @returns User data and bearer token
   */
  async completeSignup(data: CompleteSignupRequest): Promise<CompleteSignupResponse> {
    return apiClient.post<CompleteSignupResponse>(API_ENDPOINTS.AUTH.COMPLETE_SIGNUP, data)
  },

  /**
   * Refresh the current access token
   * Requires authentication - the current token will be invalidated
   * @returns New bearer token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH)
  },

  /**
   * Logout and invalidate the current access token
   * Requires authentication
   * @returns Success message
   */
  async logout(): Promise<LogoutResponse> {
    return apiClient.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT)
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
