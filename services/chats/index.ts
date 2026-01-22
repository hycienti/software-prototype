import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Message,
  Conversation,
  SendMessageRequest,
  SendMessageResponse,
  ConversationHistoryResponse,
  ConversationResponse,
  PaginationParams,
} from '@/types/api'

/**
 * Chat API Service
 */
export const chatService = {
  /**
   * Send a text message and get AI response
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>(API_ENDPOINTS.CONVERSATIONS.MESSAGE, data)
  },

  /**
   * Get conversation history with pagination
   */
  async getHistory(params?: PaginationParams): Promise<ConversationHistoryResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const url = `${API_ENDPOINTS.CONVERSATIONS.HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<ConversationHistoryResponse>(url)
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
    return apiClient.get<ConversationResponse>(url)
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
  ConversationHistoryResponse,
  ConversationResponse,
}
