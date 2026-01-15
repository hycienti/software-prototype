import React from 'react';
import { useRouter } from 'expo-router';
import { BoxBreathingScreen } from '@/screens/BoxBreathingScreen';

export default function BreathingPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    router.push('/box-breathing-settings');
  };

  return (
    <BoxBreathingScreen onBack={handleBack} onSettings={handleSettings} />
  );
}
