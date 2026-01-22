import { useState, useCallback, useRef } from 'react'
import { streamingService, type StreamingMessageEvent } from '@/services/api/streaming'
import { retryWithBackoff, isRetryableError } from '@/utils/retry'

interface UseStreamingMessageOptions {
  onStart?: (conversationId: number, messageId: number) => void
  onChunk?: (chunk: string) => void
  onComplete?: (messageId: number, sentiment?: any) => void
  onError?: (error: Error) => void
}

export function useStreamingMessage(options: UseStreamingMessageOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const streamMessage = useCallback(
    async (conversationId: number | null, message: string) => {
      setIsStreaming(true)
      setStreamedContent('')
      setError(null)

      try {
        await retryWithBackoff(
          async () => {
            for await (const event of streamingService.streamMessage(
              conversationId,
              message,
              (err) => {
                setError(err)
                options.onError?.(err)
              }
            )) {
              switch (event.type) {
                case 'start':
                  if (event.conversationId && event.messageId) {
                    options.onStart?.(event.conversationId, event.messageId)
                  }
                  break

                case 'chunk':
                  if (event.content) {
                    setStreamedContent((prev) => prev + event.content!)
                    options.onChunk?.(event.content)
                  }
                  break

                case 'complete':
                  setIsStreaming(false)
                  if (event.messageId) {
                    options.onComplete?.(event.messageId, event.sentiment)
                  }
                  return // Exit the generator loop

                case 'error':
                  const err = new Error(event.message || 'Streaming error')
                  setError(err)
                  setIsStreaming(false)
                  options.onError?.(err)
                  throw err
              }
            }
          },
          {
            maxRetries: 3,
            onRetry: (attempt, error) => {
              console.log(`Retrying stream (attempt ${attempt}):`, error.message)
            },
          }
        )
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        if (!isRetryableError(err)) {
          setError(err)
          setIsStreaming(false)
          options.onError?.(err)
        }
      }
    },
    [options]
  )

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const reset = useCallback(() => {
    setStreamedContent('')
    setError(null)
    setIsStreaming(false)
  }, [])

  return {
    streamMessage,
    stopStreaming,
    reset,
    isStreaming,
    streamedContent,
    error,
  }
}
