import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_CONFIG, getApiUrl } from '@/constants/api'
import type { ApiError } from '@/types/api'

// Lazy import to avoid circular dependency
let authStore: { clearAuth: () => Promise<void> } | null = null

const getAuthStore = async () => {
  if (!authStore) {
    const { useAuthStore } = await import('@/store')
    authStore = useAuthStore.getState()
  }
  return authStore
}

/**
 * API Client with authentication and error handling
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: getApiUrl(''),
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await AsyncStorage.getItem('auth_token')
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.error('Error getting auth token:', error)
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          // Handle specific error status codes
          switch (error.response.status) {
            case 401:
              // Unauthorized - clear token and auth state
              try {
                await AsyncStorage.removeItem('auth_token')
                const store = await getAuthStore()
                if (store) {
                  await store.clearAuth()
                }
                console.log('Authentication expired - cleared auth state')
              } catch (clearError) {
                console.error('Error clearing auth on 401:', clearError)
              }
              break
            case 403:
              // Forbidden
              console.error('Access forbidden:', error.response.data)
              break
            case 404:
              // Not found
              console.error('Resource not found:', error.response.data)
              break
            case 422:
              // Validation error
              console.error('Validation error:', error.response.data)
              break
            case 500:
              // Server error
              console.error('Server error:', error.response.data)
              break
            default:
              console.error('API error:', error.response.data)
          }
        } else if (error.request) {
          // Request made but no response
          const url = error.config?.baseURL && error.config?.url
            ? `${error.config.baseURL}${error.config.url}`
            : error.config?.url ?? error.config?.baseURL ?? 'unknown'
          console.error('Network error: No response received', {
            url,
            method: error.config?.method?.toUpperCase(),
          })
        } else {
          // Error setting up request
          console.error('Request error:', error.message)
        }

        return Promise.reject(this.formatError(error))
      }
    )
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      return {
        message:
          (error.response.data as any)?.message || error.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      }
    }

    if (error.request) {
      return {
        message: 'Network error: Please check your internet connection',
        status: 0,
        data: null,
      }
    }

    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null,
    }
  }

  get instance(): AxiosInstance {
    return this.client
  }

  // Helper methods
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
