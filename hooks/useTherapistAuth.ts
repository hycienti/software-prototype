import { useState, useCallback } from 'react'
import * as therapistAuthService from '@/services/therapist/auth'
import { useAuthStore, useUIStore } from '@/store'
import type { AuthToken } from '@/types/api'

interface UseTherapistAuthOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Authentication hook for therapist email/OTP flow
 * Handles login, onboarding, and token management
 */
export function useTherapistAuth(options: UseTherapistAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const { setTherapistAuth, clearAuth, setLoading } = useAuthStore()
  const { showAlert } = useUIStore()

  const sendOtp = useCallback(
    async (email: string): Promise<{ expiresIn?: number }> => {
      setIsLoading(true)
      setLoading(true)
      try {
        const response = await therapistAuthService.sendOtp(email)
        return { expiresIn: response.expiresIn }
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to send OTP code'
        console.error('Therapist send OTP error:', error)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
        setLoading(false)
      }
    },
    [setLoading]
  )

  const verifyOtp = useCallback(
    async (
      email: string,
      code: string
    ): Promise<{ requiresOnboarding: boolean }> => {
      setIsLoading(true)
      setLoading(true)
      try {
        const response = await therapistAuthService.verifyOtp(email, code)

        if (response.requiresOnboarding) {
          return { requiresOnboarding: true }
        }

        if (response.therapist && response.token) {
          const token: AuthToken = {
            type: response.token.type as 'bearer',
            value: response.token.value,
            expiresAt: response.token.expiresAt ?? null,
          }
          await setTherapistAuth(response.therapist, token)
          options.onSuccess?.()
          return { requiresOnboarding: false }
        }

        throw new Error('Invalid response from server')
      } catch (error: any) {
        const errorMessage = error?.message || 'Invalid OTP code'
        console.error('Therapist verify OTP error:', error)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
        setLoading(false)
      }
    },
    [setTherapistAuth, setLoading, options]
  )

  const onboard = useCallback(
    async (payload: {
      email: string
      fullName: string
      professionalTitle: string
      specialties: string[]
      licenseUrl?: string
      identityUrl?: string
    }): Promise<void> => {
      setIsLoading(true)
      setLoading(true)
      try {
        const response = await therapistAuthService.onboard(payload)
        const token: AuthToken = {
          type: response.token.type as 'bearer',
          value: response.token.value,
          expiresAt: response.token.expiresAt ?? null,
        }
        await setTherapistAuth(response.therapist, token)
        options.onSuccess?.()
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to complete onboarding'
        console.error('Therapist onboard error:', error)
        showAlert({
          title: 'Onboarding Failed',
          message: errorMessage,
          type: 'error',
        })
        options.onError?.(error)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
        setLoading(false)
      }
    },
    [setTherapistAuth, setLoading, showAlert, options]
  )

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setLoading(true)
    try {
      // Server-side logout not needed for therapist (token just expires)
    } catch (error) {
      console.error('Therapist logout error:', error)
    }
    await clearAuth()
    setIsLoading(false)
    setLoading(false)
  }, [clearAuth, setLoading])

  return {
    isLoading,
    sendOtp,
    verifyOtp,
    onboard,
    signOut,
  }
}
