import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Icon } from '@/components/ui/Icon';
import { useSendMessage, useConversation } from '@/hooks/useChat';
import { useStreamingMessage } from '@/hooks/useStreamingMessage';
import { useConversationContext } from '@/contexts/ConversationContext';
import { cacheMessages, getCachedMessages } from '@/utils/messageCache';
import { groupMessagesByDate, formatMessageTime } from '@/utils/timeUtils';
import { useUIStore } from '@/store';
import type { Message as ApiMessage } from '@/services/chats';

interface Message {
  id: string | number;
  text: string;
  isUser: boolean;
  timestamp: string;
  pending?: boolean;
  error?: boolean;
}

interface ChatScreenProps {
  onBack?: () => void;
  onTalkToHuman?: () => void;
  onVoicePress?: () => void;
  conversationId?: number | null;
  useStreaming?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  onTalkToHuman,
  onVoicePress,
  conversationId = null,
  useStreaming = true,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'thinking' | 'generating' | 'complete'>('idle');
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pendingMessagesRef = useRef<Map<string | number, Message>>(new Map());

  const { currentConversation, updateConversationId } = useConversationContext();
  const currentConversationId = conversationId || currentConversation?.id || null;
  const { showAlert } = useUIStore();

  const sendMessageMutation = useSendMessage();
  const { data: conversationData, isLoading: isLoadingConversation } = useConversation(
    currentConversationId,
    { page: 1, limit: 20 }
  );

  const {
    streamMessage,
    isStreaming,
    streamedContent,
    reset: resetStream,
  } = useStreamingMessage({
    onStart: (convId, msgId) => {
      updateConversationId(convId);
      setLoadingState('generating');
      // Add user message when streaming starts
      setMessages((prev) => {
        const withoutTemp = prev.filter((msg) => !String(msg.id).startsWith('temp-'));
        return [
          ...withoutTemp,
          {
            id: msgId,
            text: prev.find((m) => String(m.id).startsWith('temp-'))?.text || '',
            isUser: true,
            timestamp: new Date().toISOString(),
            pending: false,
          },
          {
            id: `streaming-${Date.now()}`,
            text: '',
            isUser: false,
            timestamp: new Date().toISOString(),
            pending: false,
          },
        ];
      });
    },
    onChunk: (chunk) => {
      // Update the last assistant message with new content
      setMessages((prev) => {
        const updated = [...prev];
        const lastAssistantIndex = updated.length - 1;
        if (lastAssistantIndex >= 0 && !updated[lastAssistantIndex].isUser) {
          updated[lastAssistantIndex] = {
            ...updated[lastAssistantIndex],
            text: updated[lastAssistantIndex].text + chunk,
          };
        }
        return updated;
      });
    },
    onComplete: (msgId, sentiment) => {
      setLoadingState('complete');
      setIsTyping(false);
      // Update the streaming message with final ID
      if (msgId) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastAssistantIndex = updated.length - 1;
          if (lastAssistantIndex >= 0 && !updated[lastAssistantIndex].isUser) {
            updated[lastAssistantIndex] = {
              ...updated[lastAssistantIndex],
              id: msgId,
            };
          }
          return updated;
        });
      }
      if (sentiment?.crisisIndicators && sentiment.crisisIndicators.length > 0) {
        showAlert({
          title: 'Support Available',
          message: "I've noticed some concerning indicators in your message. Would you like to speak with a human therapist?",
          type: 'warning',
          buttons: [
            { text: 'Continue Chat', style: 'cancel' },
            {
              text: 'Talk to Human',
              onPress: onTalkToHuman,
            },
          ],
        });
      }
      resetStream();
    },
    onError: (error) => {
      setLoadingState('idle');
      setIsTyping(false);
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to send message. Please try again.',
        type: 'error',
      });
      resetStream();
    },
  });

  // Load conversation messages when conversationId is available
  useEffect(() => {
    const loadMessages = async () => {
      if (conversationData?.messages) {
        const formattedMessages: Message[] = conversationData.messages.map((msg) => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: msg.createdAt,
          pending: false,
          error: false,
        }));
        setMessages(formattedMessages);
        // Cache messages
        if (currentConversationId) {
          await cacheMessages(
            currentConversationId,
            formattedMessages.map((m) => ({
              id: m.id,
              role: m.isUser ? 'user' : 'assistant',
              content: m.text,
              timestamp: m.timestamp,
              pending: false,
            }))
          );
        }
      } else if (!currentConversationId && messages.length === 0) {
        // Try to load from cache first
        const cached = await getCachedMessages(0);
        if (cached && cached.length > 0) {
          setMessages(
            cached.map((m) => ({
              id: m.id,
              text: m.content,
              isUser: m.role === 'user',
              timestamp: m.timestamp,
              pending: m.pending || false,
              error: !!m.error,
            }))
          );
        } else {
          // Show welcome message for new conversation
          setMessages([
            {
              id: 'welcome',
              text: "Hello, I'm Haven. I'm here to listen without judgment. How are you feeling today?",
              isUser: false,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    };
    loadMessages();
  }, [conversationData, currentConversationId]);

  // Handle streaming content updates
  useEffect(() => {
    if (streamedContent && isStreaming) {
      setMessages((prev) => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          updated[updated.length - 1] = {
            ...lastMessage,
            text: streamedContent,
          };
        } else {
          // Create new assistant message if none exists
          updated.push({
            id: `streaming-${Date.now()}`,
            text: streamedContent,
            isUser: false,
            timestamp: new Date().toISOString(),
          });
        }
        return updated;
      });
    }
  }, [streamedContent, isStreaming]);

  // Scroll to bottom when new messages arrive (only if user hasn't scrolled up)
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current && !userHasScrolled) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, userHasScrolled]);

  // Handle scroll events
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    setUserHasScrolled(!isNearBottom);
    setShowScrollButton(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setUserHasScrolled(false);
    setShowScrollButton(false);
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Optimistically add user message
      const tempId = `temp-${Date.now()}`;
      const userMessage: Message = {
        id: tempId,
        text,
        isUser: true,
        timestamp: new Date().toISOString(),
        pending: true,
      };
      pendingMessagesRef.current.set(tempId, userMessage);
      setMessages((prev) => [...prev, userMessage]);
      setLoadingState('thinking');
      setIsTyping(true);

      try {
        if (useStreaming) {
          // Use streaming - the hook handles conversation ID update via onStart callback
          await streamMessage(currentConversationId, text);
          // Remove temp message - real user message is added via streaming start event
          setMessages((prev) => {
            return prev.filter((msg) => !String(msg.id).startsWith('temp-'));
          });
        } else {
          // Use regular API
          const response = await sendMessageMutation.mutateAsync({
            conversationId: currentConversationId || undefined,
            message: text,
            mode: 'text',
          });

          // Update conversation ID if this was a new conversation
          if (!currentConversationId && response.conversation.id) {
            updateConversationId(response.conversation.id);
          }

          // Remove temp message and add real messages
          setMessages((prev) => {
            const withoutTemp = prev.filter((msg) => !String(msg.id).startsWith('temp-'));
            return [
              ...withoutTemp,
              {
                id: response.message.id,
                text: response.message.content,
                isUser: true,
                timestamp: response.message.createdAt,
                pending: false,
              },
              {
                id: response.response.id,
                text: response.response.content,
                isUser: false,
                timestamp: response.response.createdAt,
                pending: false,
              },
            ];
          });

          // Check for crisis indicators
          if (response.sentiment?.crisisIndicators && response.sentiment.crisisIndicators.length > 0) {
            showAlert({
              title: 'Support Available',
              message: "I've noticed some concerning indicators in your message. Would you like to speak with a human therapist?",
              type: 'warning',
              buttons: [
                { text: 'Continue Chat', style: 'cancel' },
                {
                  text: 'Talk to Human',
                  onPress: onTalkToHuman,
                },
              ],
            });
          }
        }
      } catch (error: any) {
        // Remove temp message on error
        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => !String(msg.id).startsWith('temp-'));
          // Mark last user message as error
          const updated = [...withoutTemp];
          if (updated.length > 0 && updated[updated.length - 1].isUser) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              pending: false,
              error: true,
            };
          }
          return updated;
        });
        showAlert({
          title: 'Error',
          message: error?.message || 'Failed to send message. Please try again.',
          type: 'error',
        });
      } finally {
        setIsTyping(false);
        setLoadingState('idle');
        pendingMessagesRef.current.clear();
      }
    },
    [
      currentConversationId,
      sendMessageMutation,
      streamMessage,
      useStreaming,
      updateConversationId,
      onTalkToHuman,
    ]
  );

  const getLoadingMessage = () => {
    switch (loadingState) {
      case 'thinking':
        return "Haven is thinking...";
      case 'generating':
        return "Haven is responding...";
      default:
        return "Haven is typing...";
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Dark Gradient Background */}
      <View style={StyleSheet.absoluteFill} className="bg-background-dark">
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.4)',
            'rgba(15, 23, 42, 0.25)',
            'rgba(17, 29, 33, 0.15)',
            'rgba(17, 29, 33, 0.05)',
            'transparent',
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[styles.backgroundBlob1, { backgroundColor: 'rgba(25, 179, 230, 0.08)' }]}
        />
        <View
          style={[styles.backgroundBlob2, { backgroundColor: 'rgba(88, 28, 135, 0.12)' }]}
        />
      </View>

      <ChatHeader
        name="Haven"
        status="Online"
        onBack={onBack}
        onTalkToHuman={onTalkToHuman}
      />
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 relative z-10"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.messagesContainer}>
          {groupedMessages.map((group, groupIndex) => (
            <View key={group.date}>
              <View style={styles.dateSeparator}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{group.date}</Text>
                </View>
              </View>
              {group.messages.map((message, index) => (
                <ChatBubble
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  showAvatar={!message.isUser}
                  pending={message.pending}
                  error={message.error}
                  index={index}
                />
              ))}
            </View>
          ))}
          {isTyping && (
            <View>
              <TypingIndicator />
              <Text style={styles.loadingText}>{getLoadingMessage()}</Text>
            </View>
          )}
          <View style={styles.spacer} />
        </View>
      </ScrollView>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <TouchableOpacity
          style={styles.scrollToBottomButton}
          onPress={scrollToBottom}
          activeOpacity={0.8}
        >
          <View style={styles.scrollToBottomButtonInner}>
            <Icon name="arrow_downward" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>
      )}

      <ChatInput
        onSend={handleSend}
        onVoicePress={onVoicePress}
        disabled={isTyping || isStreaming}
        useStreaming={useStreaming}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  messagesContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(156, 163, 175, 0.8)',
  },
  spacer: {
    height: 8,
  },
  backgroundBlob1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.4,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: '20%',
    right: '-5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.4,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(156, 163, 175, 0.6)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 30,
  },
  scrollToBottomButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(25, 179, 230, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
