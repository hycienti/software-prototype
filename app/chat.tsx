import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/screens/ChatScreen';
import { useConversationContext } from '@/contexts/ConversationContext';

export default function ChatPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const { currentConversation } = useConversationContext();

  const conversationId = params.conversationId
    ? Number(params.conversationId)
    : currentConversation?.id || null;

  const handleBack = () => {
    router.back();
  };

  const handleTalkToHuman = () => {
    router.push('/therapists');
  };

  const handleVoicePress = () => {
    router.push('/voice');
  };

  return (
    <ChatScreen
      onBack={handleBack}
      onTalkToHuman={handleTalkToHuman}
      onVoicePress={handleVoicePress}
      conversationId={conversationId}
      useStreaming={true}
    />
  );
}
