import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  chatService,
  type SendMessageRequest,
  type SendMessageResponse,
  type ConversationHistoryResponse,
  type ConversationResponse,
} from '@/services/chats'
import { retryWithBackoff, isRetryableError } from '@/utils/retry'
import { cacheMessages, addToOfflineQueue } from '@/utils/messageCache'

/**
 * React Query hooks for chat functionality
 */

/**
 * Hook to send a message and get AI response with retry logic
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      return retryWithBackoff(
        () => chatService.sendMessage(data),
        {
          maxRetries: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            console.log(`Retrying message send (attempt ${attempt}):`, error.message)
          },
        }
      )
    },
    onSuccess: async (data) => {
      // Cache messages locally
      if (data.conversation && data.message && data.response) {
        if (data.conversation.id) {
          try {
            const messages = [
              {
                id: data.message.id,
                role: data.message.role,
                content: data.message.content,
                timestamp: data.message.createdAt,
                pending: false,
              },
              {
                id: data.response.id,
                role: data.response.role,
                content: data.response.content,
                timestamp: data.response.createdAt,
                pending: false,
              },
            ]
            await cacheMessages(data.conversation.id, messages)
          } catch (error) {
            console.error('Error caching messages:', error)
          }
        }

        // Invalidate and refetch conversation history
        queryClient.invalidateQueries({ queryKey: ['conversations', 'history'] })
        // Update specific conversation cache if conversationId exists
        if (data.conversation.id) {
          queryClient.invalidateQueries({
            queryKey: ['conversations', data.conversation.id],
          })
        }
      }
    },
    onError: async (error: any, variables) => {
      console.error('Error sending message:', error)

      // If retryable error, add to offline queue
      if (isRetryableError(error)) {
        try {
          await addToOfflineQueue(
            variables.conversationId || null,
            variables.message,
            variables.mode || 'text'
          )
        } catch (queueError) {
          console.error('Error adding to offline queue:', queueError)
        }
      }
    },
  })
}

/**
 * Hook to get conversation history
 */
export function useConversationHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['conversations', 'history', params],
    queryFn: () => chatService.getHistory(params),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

/**
 * Hook to get a specific conversation with pagination
 */
export function useConversation(
  conversationId: number | null,
  options?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['conversations', conversationId, options],
    queryFn: () => chatService.getConversation(conversationId!, options),
    enabled: conversationId !== null,
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Retry up to 3 times for retryable errors
      if (failureCount < 3 && isRetryableError(error)) {
        return true
      }
      return false
    },
  })
}

/**
 * Hook to delete a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: number) => chatService.deleteConversation(conversationId),
    onSuccess: () => {
      // Invalidate conversation history
      queryClient.invalidateQueries({ queryKey: ['conversations', 'history'] })
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error)
    },
  })
}
