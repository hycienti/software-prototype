import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { chatService } from '@/services/chats';
import type { StreamingMessageEvent } from '@/types/api';

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY || '640987342798234';
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'mt1';
const PUSHER_START_TIMEOUT_MS = 12000;
const POLL_INTERVAL_MS = 600;
const POLL_MAX_ATTEMPTS = 150; // ~90s max
const WAIT_FOR_EVENT_MS = 60000; // after stream:start, wait max 60s for events then poll

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

    // 2. Handle Existing Conversation - Try Pusher, fall back to polling or non-streaming
    let pusherReady = false;
    try {
      await this.initPusher();
      pusherReady = true;
    } catch (error: any) {
      // Pusher not available: fall back to non-streaming so it always works
      try {
        const response = await chatService.sendMessage({
          conversationId,
          message,
          mode: 'text',
          stream: false,
        });
        yield { type: 'start', conversationId, messageId: response.message.id };
        yield { type: 'chunk', content: response.response.content };
        yield { type: 'complete', messageId: response.response.id, sentiment: response.sentiment };
      } catch (err: any) {
        const e = new Error(err.message || 'Failed to send message');
        onError?.(e);
        yield { type: 'error', message: e.message };
      }
      return;
    }

    const channelName = `conversation-${conversationId}`;
    if (this.currentChannelName && this.currentChannelName !== channelName) {
      await this.pusher.unsubscribe({ channelName: this.currentChannelName });
      this.currentChannelName = null;
    }
    if (this.currentChannelName !== channelName) {
      await this.pusher.subscribe({
        channelName,
        onEvent: (event: PusherEvent) => {
          try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            const type = event.eventName;
            if (type === 'stream:start') {
              pushEvent({ type: 'start', conversationId, messageId: data.messageId });
            } else if (type === 'stream:chunk') {
              pushEvent({ type: 'chunk', content: data.content });
            } else if (type === 'stream:error') {
              pushEvent({ type: 'error', message: data.message || data.code || 'Streaming error' });
            }
          } catch (err) {
            console.error('Error parsing pusher event data:', err);
          }
        },
      });
      this.currentChannelName = channelName;
    }

    const apiPromise = chatService.sendMessage({
      conversationId,
      message,
      mode: 'text',
      stream: true,
    });

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
        onError?.(error instanceof Error ? error : new Error(String(error)));
        pushEvent({ type: 'error', message: error instanceof Error ? error.message : 'Failed to send message' });
        hasError = true;
        isComplete = true;
      });

    let streamStartReceived = false;
    let userMessageIdForPolling: number | null = null;
    const startTimeout = setTimeout(() => {
      if (!streamStartReceived && userMessageIdForPolling === null) {
        streamStartReceived = true;
      }
    }, PUSHER_START_TIMEOUT_MS);

    while (!isComplete || eventQueue.length > 0) {
      if (eventQueue.length > 0) {
        const event = eventQueue.shift()!;
        if (event.type === 'start') {
          streamStartReceived = true;
          userMessageIdForPolling = event.messageId;
          clearTimeout(startTimeout);
        }
        yield event;
        if (event.type === 'error') break;
        if (event.type === 'complete') break;
      } else {
        if (hasError) break;
        const event = await (userMessageIdForPolling !== null
          ? Promise.race([
              new Promise<StreamingMessageEvent>((resolve) => {
                resolveNext = resolve;
              }),
              new Promise<StreamingMessageEvent>((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), WAIT_FOR_EVENT_MS)
              ),
            ]).catch(() => null)
          : new Promise<StreamingMessageEvent>((resolve) => {
              resolveNext = resolve;
            }));
        if (event === null) break; // timeout – will fall back to polling below
        if (event.type === 'start') {
          streamStartReceived = true;
          userMessageIdForPolling = event.messageId;
          clearTimeout(startTimeout);
        }
        yield event;
        if (event.type === 'error') break;
        if (event.type === 'complete') break;
      }
    }

    clearTimeout(startTimeout);

    // Polling fallback: we got stream:start but no complete (e.g. Pusher dropped) – poll until backend completes
    if (userMessageIdForPolling !== null && !isComplete && !hasError) {
      const pollResult = await this.pollStreamStatus(conversationId, userMessageIdForPolling);
      if (pollResult) for (const e of pollResult) yield e;
    }
  }

  private async pollStreamStatus(
    conversationId: number,
    userMessageId: number
  ): Promise<StreamingMessageEvent[] | null> {
    for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const state = await chatService.getStreamStatus(conversationId, userMessageId);
        if (state.status === 'complete' && state.fullContent !== undefined) {
          return [
            { type: 'chunk', content: state.fullContent },
            { type: 'complete', messageId: state.messageId!, sentiment: state.sentiment },
          ];
        }
        if (state.status === 'error') {
          return [{ type: 'error', message: state.error || 'Stream error' }];
        }
      } catch {
        // ignore and retry
      }
    }
    return [{ type: 'error', message: 'Stream timed out' }];
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
