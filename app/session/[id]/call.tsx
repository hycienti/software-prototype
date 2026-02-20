import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SessionVideoCallScreen } from '@/screens/SessionVideoCallScreen';

export default function SessionCallPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = id ? parseInt(id, 10) : 0;

  const handleBack = () => router.back();
  const handleEndCall = () => {
    router.replace('/my-therapists');
  };

  if (!id || Number.isNaN(sessionId)) {
    return null;
  }

  return (
    <SessionVideoCallScreen
      sessionId={sessionId}
      onBack={handleBack}
      onEndCall={handleEndCall}
    />
  );
}
