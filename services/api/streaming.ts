import AsyncStorage from '@react-native-async-storage/async-storage'

export interface StreamingMessageEvent {
  type: 'start' | 'chunk' | 'complete' | 'error'
  conversationId?: number
  messageId?: number
  content?: string
  sentiment?: {
    sentiment: 'positive' | 'neutral' | 'negative'
    crisisIndicators: string[]
    confidence: number
  }
  message?: string
}

/**
 * WebSocket-based Streaming Service
 */
export class WebSocketStreamingService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  /**
   * Connect to WebSocket server
   */
  private async connect(): Promise<WebSocket> {
    return new Promise(async (resolve, reject) => {
      const token = await AsyncStorage.getItem('auth_token')
      if (!token) {
        reject(new Error('No authentication token found'))
        return
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333'
      const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://')
      const url = `${wsUrl}/streaming?token=${encodeURIComponent(token)}`

      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        resolve(this.ws!)
      }

      this.ws.onerror = (error) => {
        reject(error)
      }
    })
  }

  /**
   * Stream AI response for a message using WebSocket
   */
  async *streamMessage(
    conversationId: number | null,
    message: string,
    onError?: (error: Error) => void
  ): AsyncGenerator<StreamingMessageEvent, void, unknown> {
    try {
      // Connect if not already connected
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        await this.connect()
      }

      // Set up event handlers
      const eventQueue: StreamingMessageEvent[] = []
      let isComplete = false
      let hasError = false
      let resolveNext: ((value: StreamingMessageEvent) => void) | null = null

      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as any
          let streamEvent: StreamingMessageEvent | null = null

          // AdonisJS WebSocket emits events directly, check for event name or type
          // Format: { event: 'stream:start', ... } or direct { type: 'stream:start', ... }
          const eventName = data.event || data.type
          
          if (eventName === 'stream:start') {
            streamEvent = {
              type: 'start',
              conversationId: data.conversationId || data.data?.conversationId,
              messageId: data.messageId || data.data?.messageId,
            }
          } else if (eventName === 'stream:chunk') {
            streamEvent = {
              type: 'chunk',
              content: data.content || data.data?.content,
            }
          } else if (eventName === 'stream:complete') {
            streamEvent = {
              type: 'complete',
              messageId: data.messageId || data.data?.messageId,
              sentiment: data.sentiment || data.data?.sentiment,
            }
            isComplete = true
          } else if (eventName === 'stream:error') {
            streamEvent = {
              type: 'error',
              message: data.message || data.data?.message || 'Unknown error',
            }
            hasError = true
          }

          if (streamEvent) {
            if (resolveNext) {
              resolveNext(streamEvent)
              resolveNext = null
            } else {
              eventQueue.push(streamEvent)
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          if (resolveNext) {
            resolveNext({
              type: 'error',
              message: 'Failed to parse message',
            })
            resolveNext = null
          }
        }
      }

      const errorHandler = (error: Event) => {
        hasError = true
        const errorEvent: StreamingMessageEvent = {
          type: 'error',
          message: 'WebSocket connection error',
        }
        if (resolveNext) {
          resolveNext(errorEvent)
          resolveNext = null
        } else {
          eventQueue.push(errorEvent)
        }
      }

      this.ws!.addEventListener('message', messageHandler)
      this.ws!.addEventListener('error', errorHandler)

      // Send stream request
      // AdonisJS WebSocket routes by method name, so we send the event name
      // The channel will handle 'onMessage' method
      this.ws!.send(
        JSON.stringify({
          event: 'message',
          data: {
            conversationId,
            message,
          },
        })
      )

      // Yield events as they arrive using async iteration
      while (!isComplete && !hasError) {
        let event: StreamingMessageEvent

        if (eventQueue.length > 0) {
          event = eventQueue.shift()!
        } else {
          // Wait for next event
          event = await new Promise<StreamingMessageEvent>((resolve) => {
            resolveNext = resolve
          })
        }

        yield event

        if (event.type === 'complete' || event.type === 'error') {
          break
        }
      }

      // Clean up
      this.ws!.removeEventListener('message', messageHandler)
      this.ws!.removeEventListener('error', errorHandler)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Streaming error')
      onError?.(err)
      yield {
        type: 'error',
        message: err.message,
      }
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Export singleton instance
export const streamingService = new WebSocketStreamingService()
