import React from 'react';
import { useRouter } from 'expo-router';
import { ChatScreen } from '@/screens/ChatScreen';

export default function ChatPage() {
  const router = useRouter();

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
    />
  );
}
