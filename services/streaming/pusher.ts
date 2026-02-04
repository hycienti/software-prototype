import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { chatService } from '@/services/chats';
import type { StreamingMessageEvent, SendMessageResponse } from '@/types/api';


const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY || '640987342798234'; 
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'mt1';

export class PusherStreamingService {
  private pusher: Pusher;
  private currentChannelName: string | null = null;
  private isInitialized = false;

  constructor() {
    try {
      this.pusher = Pusher.getInstance();
      if (!this.pusher) {
        throw new Error('Pusher.getInstance() returned null');
      }
    } catch (error) {
      console.error('Failed to initialize Pusher native instance:', error);
      throw new Error(
        'Pusher native module is not properly linked. If you are using Expo, you must use a Development Client (npx expo run:ios/android) instead of Expo Go, or switch to the JS-only "pusher-js" library.'
      );
    }
  }

  private async initPusher() {
    if (this.isInitialized) return;

    try {
      await this.pusher.init({
        apiKey: PUSHER_KEY,
        cluster: PUSHER_CLUSTER,
      });
      await this.pusher.connect();
      this.isInitialized = true;
    } catch (e) {
      console.error('Error initializing pusher:', e);
      // Don't set isInitialized to true if it fails
      throw e; 
    }
  }

  async *streamMessage(
    conversationId: number | null,
    message: string,
    onError?: (error: Error) => void
  ): AsyncGenerator<StreamingMessageEvent, void, unknown> {
    const eventQueue: StreamingMessageEvent[] = [];
    let resolveNext: ((value: StreamingMessageEvent) => void) | null = null;
    let isComplete = false;
    let hasError = false;

    const pushEvent = (event: StreamingMessageEvent) => {
      if (resolveNext) {
        resolveNext(event);
        resolveNext = null;
      } else {
        eventQueue.push(event);
      }
    };

    // 1. Handle New Conversation (No ID) - Fallback to HTTP Request (simulate streaming)
    if (!conversationId) {
      try {
        const response = await chatService.sendMessage({
          message,
          mode: 'text',
          stream: false, 
        });

        yield {
          type: 'start',
          conversationId: response.conversation.id,
          messageId: response.message.id,
        };

        yield {
          type: 'chunk',
          content: response.response.content,
        };

        yield {
          type: 'complete',
          messageId: response.response.id,
          sentiment: response.sentiment,
        };
        
        return;
      } catch (error: any) {
        const err = new Error(error.message || 'Failed to send message');
        onError?.(err);
        yield { type: 'error', message: err.message };
        return;
      }
    }

    // 2. Handle Existing Conversation - Use Pusher
    try {
      await this.initPusher();
      const channelName = `conversation-${conversationId}`;

      // Unsubscribe from previous channel if different
      if (this.currentChannelName && this.currentChannelName !== channelName) {
        await this.pusher.unsubscribe({ channelName: this.currentChannelName });
        this.currentChannelName = null;
      }

      // Subscribe to new channel
      if (this.currentChannelName !== channelName) {
         await this.pusher.subscribe({
          channelName,
          onEvent: (event: PusherEvent) => {
            try {
              // event.data is usually a JSON string
              const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              const type = event.eventName;

              if (type === 'stream:start') {
                pushEvent({
                  type: 'start',
                  conversationId: conversationId,
                  messageId: data.messageId,
                });
              } else if (type === 'stream:chunk') {
                pushEvent({
                  type: 'chunk',
                  content: data.content,
                });
              } else if (type === 'stream:error') {
                 pushEvent({
                    type: 'error',
                    message: data.message || 'Streaming error',
                 });
              }
            } catch (err) {
              console.error('Error parsing pusher event data:', err);
            }
          },
        });
        this.currentChannelName = channelName;
      }

      // Trigger API call
      const apiPromise = chatService.sendMessage({
        conversationId,
        message,
        mode: 'text',
        stream: true,
      });

      // Handle API completion
      apiPromise
        .then((response) => {
          pushEvent({
            type: 'complete',
            messageId: response.response.id,
            sentiment: response.sentiment,
          });
          isComplete = true;
        })
        .catch((error) => {
          const err = new Error(error.message || 'Failed to send message');
          onError?.(err);
          pushEvent({ type: 'error', message: err.message });
          hasError = true;
          isComplete = true; 
        });

      // Generator loop
      while (!isComplete || eventQueue.length > 0) {
        if (eventQueue.length > 0) {
          const event = eventQueue.shift()!;
          yield event;
          if (event.type === 'error') break; 
          if (event.type === 'complete') break; 
        } else {
          if (hasError) break; 
          // Wait for next event
          const event = await new Promise<StreamingMessageEvent>((resolve) => {
            resolveNext = resolve;
          });
          yield event;
          if (event.type === 'error') break;
          if (event.type === 'complete') break;
        }
      }
      
    } catch (error: any) {
      const err = new Error(error.message || 'Streaming setup error');
      onError?.(err);
      yield { type: 'error', message: err.message };
    }
  }

  async disconnect() {
    if (this.currentChannelName) {
      try {
        await this.pusher.unsubscribe({ channelName: this.currentChannelName });
        this.currentChannelName = null;
      } catch (e) {
        console.warn('Error unsubscribing:', e);
      }
    }
    // We don't necessarily need to disconnect the global pusher instance, 
    // but if we wanted to:
    // this.pusher.disconnect(); 
  }
}

export const pusherService = new PusherStreamingService();
