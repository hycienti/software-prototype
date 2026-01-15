import React from 'react';
import { useRouter } from 'expo-router';
import { GratitudeScreen } from '@/screens/GratitudeScreen';

export default function GratitudePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Save gratitude entry
    console.log('Saving gratitude entry');
    router.back();
  };

  return (
    <GratitudeScreen
      onBack={handleBack}
      onSave={handleSave}
    />
  );
}
