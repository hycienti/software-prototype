import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Message,
  Conversation,
  SendMessageRequest,
  SendMessageResponse,
  StreamStatusResponse,
  ConversationHistoryResponse,
  ConversationResponse,
  PaginationParams,
} from '@/types/api'

/** Standard API success shape from backend */
interface ApiSuccess<T> {
  success: true
  data: T
}

/**
 * Chat API Service
 */
export const chatService = {
  /**
   * Send a text message and get AI response
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const res = await apiClient.post<ApiSuccess<SendMessageResponse> | SendMessageResponse>(
      API_ENDPOINTS.CONVERSATIONS.MESSAGE,
      data,
      { timeout: 90000 }
    )
    if (typeof res === 'object' && (res as ApiSuccess<SendMessageResponse>).success && (res as ApiSuccess<SendMessageResponse>).data) {
      return (res as ApiSuccess<SendMessageResponse>).data
    }
    return res as SendMessageResponse
  },

  /**
   * Get stream progress (polling fallback when Pusher is unavailable)
   */
  async getStreamStatus(
    conversationId: number,
    userMessageId: number
  ): Promise<StreamStatusResponse> {
    const url = `${API_ENDPOINTS.CONVERSATIONS.STREAM_STATUS}?conversationId=${conversationId}&userMessageId=${userMessageId}`
    const res = await apiClient.get<ApiSuccess<StreamStatusResponse> | StreamStatusResponse>(url)
    if (typeof res === 'object' && (res as ApiSuccess<StreamStatusResponse>).success && (res as ApiSuccess<StreamStatusResponse>).data) {
      return (res as ApiSuccess<StreamStatusResponse>).data
    }
    return res as StreamStatusResponse
  },

  /**
   * Get conversation history with pagination
   */
  async getHistory(params?: PaginationParams): Promise<ConversationHistoryResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const url = `${API_ENDPOINTS.CONVERSATIONS.HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const res = await apiClient.get<ApiSuccess<ConversationHistoryResponse> | ConversationHistoryResponse>(url)
    if (typeof res === 'object' && (res as ApiSuccess<ConversationHistoryResponse>).success && (res as ApiSuccess<ConversationHistoryResponse>).data) {
      return (res as ApiSuccess<ConversationHistoryResponse>).data
    }
    return res as ConversationHistoryResponse
  },

  /**
   * Get a specific conversation with paginated messages
   */
  async getConversation(
    conversationId: number,
    options?: PaginationParams
  ): Promise<ConversationResponse> {
    const queryParams = new URLSearchParams()
    if (options?.page) queryParams.append('page', options.page.toString())
    if (options?.limit) queryParams.append('limit', options.limit.toString())

    const url = `${API_ENDPOINTS.CONVERSATIONS.BY_ID(conversationId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const res = await apiClient.get<ApiSuccess<ConversationResponse> | ConversationResponse>(url)
    if (typeof res === 'object' && (res as ApiSuccess<ConversationResponse>).success && (res as ApiSuccess<ConversationResponse>).data) {
      return (res as ApiSuccess<ConversationResponse>).data
    }
    return res as ConversationResponse
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.CONVERSATIONS.DELETE(conversationId))
  },
}

// Re-export types for convenience
export type {
  Message,
  Conversation,
  SendMessageRequest,
  SendMessageResponse,
  StreamStatusResponse,
  ConversationHistoryResponse,
  ConversationResponse,
}
