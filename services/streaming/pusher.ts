import Pusher from 'pusher-js';
import { chatService } from '@/services/chats';
import type { StreamingMessageEvent, SendMessageResponse } from '@/types/api';



const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY || '640987342798234'; 
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'mt1';

export class PusherStreamingService {
  private pusher: Pusher | null = null;
  private channel: any = null;

  private initPusher() {
    if (!this.pusher) {
      this.pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
      });
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

    
    try {
      this.initPusher();
      const channelName = `conversation-${conversationId}`;

      
      if (!this.channel || this.channel.name !== channelName) {
        if (this.channel) {
          this.pusher?.unsubscribe(this.channel.name);
        }
        this.channel = this.pusher?.subscribe(channelName);
      }

      
      const handlePusherEvent = (type: string, data: any) => {
        if (type === 'start') {
          pushEvent({
            type: 'start',
            conversationId: conversationId,
            messageId: data.messageId,
          });
        } else if (type === 'chunk') {
          pushEvent({
            type: 'chunk',
            content: data.content,
          });
        } else if (type === 'error') {
            
            
             pushEvent({
                type: 'error',
                message: data.message || 'Streaming error',
             });
        }
        
        
      };

      this.channel.bind('stream:start', (data: any) => handlePusherEvent('start', data));
      this.channel.bind('stream:chunk', (data: any) => handlePusherEvent('chunk', data));
      this.channel.bind('stream:error', (data: any) => handlePusherEvent('error', data));
      

      
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
          const err = new Error(error.message || 'Failed to send message');
          onError?.(err);
          pushEvent({ type: 'error', message: err.message });
          hasError = true;
          isComplete = true; 
        });

    
      while (!isComplete || eventQueue.length > 0) {
        if (eventQueue.length > 0) {
          const event = eventQueue.shift()!;
          yield event;
          if (event.type === 'error') break; 
          if (event.type === 'complete') break; 
        } else {
          if (hasError) break; 
          
          await new Promise<void>((resolve) => {
            resolveNext = () => resolve();
          });
        }
      }

      
      this.channel.unbind('stream:start');
      this.channel.unbind('stream:chunk');
      this.channel.unbind('stream:error');
      
    } catch (error: any) {
      const err = new Error(error.message || 'Streaming setup error');
      onError?.(err);
      yield { type: 'error', message: err.message };
    }
  }

  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.channel = null;
    }
  }
}

export const pusherService = new PusherStreamingService();
