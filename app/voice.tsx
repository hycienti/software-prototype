import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VoiceScreen } from '@/screens/VoiceScreen';
import { useConversationContext } from '@/contexts/ConversationContext';

export default function VoicePage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const { currentConversation } = useConversationContext();

  const conversationId = params.conversationId
    ? Number(params.conversationId)
    : currentConversation?.id || null;

  const handleBack = () => {
    router.back();
  };

  const handleKeyboardPress = () => {
    router.push('/chat');
  };

  return (
    <VoiceScreen
      onBack={handleBack}
      onKeyboardPress={handleKeyboardPress}
      conversationId={conversationId}
    />
  );
}
