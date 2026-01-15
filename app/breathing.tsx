import React from 'react';
import { useRouter } from 'expo-router';
import { BoxBreathingScreen } from '@/screens/BoxBreathingScreen';

export default function BreathingPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <BoxBreathingScreen onBack={handleBack} />
  );
}
