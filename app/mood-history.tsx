import React from 'react';
import { useRouter } from 'expo-router';
import { MoodHistoryScreen } from '@/screens/MoodHistoryScreen';

export default function MoodHistoryPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleEntryPress = (entryId: string) => {
    // TODO: Navigate to entry detail or edit
    console.log('Entry pressed:', entryId);
  };

  return (
    <MoodHistoryScreen
      onBack={handleBack}
      onEntryPress={handleEntryPress}
    />
  );
}
