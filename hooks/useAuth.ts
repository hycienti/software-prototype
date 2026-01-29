import { useState, useCallback } from 'react'
import { authService } from '@/services/auth'
import { useAuthStore , useUIStore } from '@/store'
import type { ApiError } from '@/types/api'

interface UseAuthOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Authentication hook for email/OTP flow
 * Handles signup, sign-in, and token management
 */
export function useAuth(options: UseAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const { setAuth, clearAuth, setLoading } = useAuthStore()
  const { showAlert } = useUIStore()

  /**
   * Send OTP to email address
   */
  const sendOtp = useCallback(
    async (email: string): Promise<{ expiresIn: number }> => {
      setIsLoading(true)
      setLoading(true)

      try {
        const response = await authService.sendOtp({ email })
        setIsLoading(false)
        setLoading(false)
        return { expiresIn: response.expiresIn }
      } catch (error: any) {
        setIsLoading(false)
        setLoading(false)

        let errorMessage = 'Failed to send OTP code'

        if (error.response) {
          const apiError = error as ApiError
          errorMessage = apiError.message || 'Failed to send OTP code'
        } else if (error.message) {
          errorMessage = error.message
        }

        console.error('Send OTP error:', error)
        throw new Error(errorMessage)
      }
    },
    [setLoading]
  )

  /**
   * Verify OTP code
   */
  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<{ requiresSignup: boolean }> => {
      setIsLoading(true)
      setLoading(true)

      try {
        const response = await authService.verifyOtp({ email, code })

        if (response.requiresSignup) {
          // New user - needs to provide fullname
          setIsLoading(false)
          setLoading(false)
          return { requiresSignup: true }
        } else {
          // Existing user - authenticated
          if (response.user && response.token) {
            await setAuth(response.user, response.token)
            setIsLoading(false)
            setLoading(false)
            options.onSuccess?.()
            return { requiresSignup: false }
          } else {
            throw new Error('Invalid response from server')
          }
        }
      } catch (error: any) {
        setIsLoading(false)
        setLoading(false)

        let errorMessage = 'Invalid OTP code'

        if (error.response) {
          const apiError = error as ApiError
          errorMessage = apiError.message || 'Invalid OTP code'
        } else if (error.message) {
          errorMessage = error.message
        }

        console.error('Verify OTP error:', error)
        throw new Error(errorMessage)
      }
    },
    [setAuth, setLoading, options]
  )

  /**
   * Complete signup for new users
   */
  const completeSignup = useCallback(
    async (email: string, fullName: string): Promise<void> => {
      setIsLoading(true)
      setLoading(true)

      try {
        const response = await authService.completeSignup({ email, fullName })

        await setAuth(response.user, response.token)

        setIsLoading(false)
        setLoading(false)
        options.onSuccess?.()
      } catch (error: any) {
        setIsLoading(false)
        setLoading(false)

        let errorMessage = 'Failed to complete signup'

        if (error.response) {
          const apiError = error as ApiError
          errorMessage = apiError.message || 'Failed to complete signup'
        } else if (error.message) {
          errorMessage = error.message
        }

        console.error('Complete signup error:', error)

        showAlert({
          title: 'Signup Failed',
          message: errorMessage,
          type: 'error',
        })

        options.onError?.(error)
        throw new Error(errorMessage)
      }
    },
    [setAuth, setLoading, showAlert, options]
  )

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    setIsLoading(true)
    setLoading(true)

    try {
      // Call logout endpoint to invalidate token on server
      await authService.logout()
    } catch (error) {
      // Even if logout fails, clear local auth state
      console.error('Logout error (continuing with local cleanup):', error)
    }

    // Clear auth state
    await clearAuth()

    setIsLoading(false)
    setLoading(false)
  }, [clearAuth, setLoading])

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken()
      const { updateToken } = useAuthStore.getState()
      await updateToken(response.token)
      return response.token
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, clear auth and force re-login
      await clearAuth()
      throw error
    }
  }, [clearAuth])

  return {
    isLoading,
    sendOtp,
    verifyOtp,
    completeSignup,
    signOut,
    refreshToken,
  }
}
