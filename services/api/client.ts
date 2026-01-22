import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333'

/**
 * API Client with authentication and error handling
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 30000,
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
              // Unauthorized - clear token and redirect to login
              await AsyncStorage.removeItem('auth_token')
              // You might want to trigger a navigation event here
              break
            case 403:
              // Forbidden
              console.error('Access forbidden')
              break
            case 404:
              // Not found
              console.error('Resource not found')
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
          console.error('Network error: No response received')
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

export interface ApiError {
  message: string
  status: number
  data: any
}

export const apiClient = new ApiClient()
