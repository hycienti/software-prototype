import React from 'react';
import { useRouter } from 'expo-router';
import { BoxBreathingScreen } from '@/screens/BoxBreathingScreen';
import { BoxBreathingSettingsProvider } from '@/store/BoxBreathingSettingsContext';

export default function BreathingPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    router.push('/box-breathing-settings');
  };

  return (
    <BoxBreathingSettingsProvider>
      <BoxBreathingScreen onBack={handleBack} onSettings={handleSettings} />
    </BoxBreathingSettingsProvider>
  );
}
