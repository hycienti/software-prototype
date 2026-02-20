import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SessionTakeawaysScreen } from '@/screens/SessionTakeawaysScreen';

export default function SessionSummaryPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = id ? parseInt(id, 10) : 0;

  const handleBack = () => router.back();
  const handleBackToHistory = () => router.replace('/my-therapists');
  const handleAddToJournal = () => router.push('/journal');

  if (!id || Number.isNaN(sessionId)) {
    return null;
  }

  return (
    <SessionTakeawaysScreen
      sessionId={sessionId}
      onBack={handleBack}
      onBackToHistory={handleBackToHistory}
      onAddToJournal={handleAddToJournal}
    />
  );
}
