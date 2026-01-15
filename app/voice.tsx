import React from 'react';
import { useRouter } from 'expo-router';
import { VoiceScreen } from '@/screens/VoiceScreen';

export default function VoicePage() {
  const router = useRouter();

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
    />
  );
}
