import React from 'react';
import { useRouter } from 'expo-router';
import { MoodJournalScreen } from '@/screens/MoodJournalScreen';

export default function JournalPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Save journal entry
    console.log('Saving journal entry');
    router.back();
  };

  return (
    <MoodJournalScreen
      onBack={handleBack}
      onSave={handleSave}
    />
  );
}
