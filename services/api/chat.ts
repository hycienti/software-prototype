import { apiClient } from './client'

export interface Message {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface Conversation {
  id: number
  title: string | null
  mode: 'text' | 'voice'
  messageCount?: number
  lastMessageAt: string | null
  createdAt: string
  messages?: Message[]
}

export interface SendMessageRequest {
  conversationId?: number
  message: string
  mode?: 'text' | 'voice'
}

export interface SendMessageResponse {
  conversation: Conversation
  message: Message
  response: Message
  sentiment?: {
    sentiment: 'positive' | 'neutral' | 'negative'
    crisisIndicators: string[]
    confidence: number
  }
}

export interface ConversationHistoryResponse {
  conversations: (Conversation & { messages: Message[] })[]
  pagination: {
    page: number
    perPage: number
    total: number
    lastPage: number
  }
}

export interface ConversationResponse {
  conversation: Conversation
  messages: Message[]
}

/**
 * Chat API Service
 */
export const chatService = {
  /**
   * Send a text message and get AI response
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>('/conversations/message', data)
  },

  /**
   * Get conversation history with pagination
   */
  async getHistory(params?: {
    page?: number
    limit?: number
  }): Promise<ConversationHistoryResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const url = `/conversations/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<ConversationHistoryResponse>(url)
  },

  /**
   * Get a specific conversation with paginated messages
   */
  async getConversation(
    conversationId: number,
    options?: { page?: number; limit?: number }
  ): Promise<ConversationResponse & { pagination?: any }> {
    const queryParams = new URLSearchParams()
    if (options?.page) queryParams.append('page', options.page.toString())
    if (options?.limit) queryParams.append('limit', options.limit.toString())

    const url = `/conversations/${conversationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<ConversationResponse & { pagination?: any }>(url)
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/conversations/${conversationId}`)
  },
}
