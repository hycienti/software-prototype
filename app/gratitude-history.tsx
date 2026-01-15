import React from 'react';
import { useRouter } from 'expo-router';
import { GratitudeHistoryScreen } from '@/screens/GratitudeHistoryScreen';

export default function GratitudeHistoryPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleEntryPress = (entryId: string) => {
    // TODO: Navigate to entry detail or edit
    console.log('Entry pressed:', entryId);
  };

  return (
    <GratitudeHistoryScreen
      onBack={handleBack}
      onEntryPress={handleEntryPress}
    />
  );
}
