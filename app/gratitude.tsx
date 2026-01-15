import React from 'react';
import { useRouter } from 'expo-router';
import { GratitudeScreen } from '@/screens/GratitudeScreen';

export default function GratitudePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Gratitude entry saved');
    router.back();
  };

  return (
    <GratitudeScreen
      onBack={handleBack}
      onSave={handleSave}
    />
  );
}
