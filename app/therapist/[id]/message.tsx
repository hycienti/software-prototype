import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DirectMessageTherapistScreen } from '@/screens/DirectMessageTherapistScreen';

export default function TherapistMessagePage() {
  const router = useRouter();
  const { id, sessionId: sessionIdParam } = useLocalSearchParams<{ id: string; sessionId?: string }>();
  const therapistId = id ? parseInt(id, 10) : 0;
  const sessionId = sessionIdParam != null && sessionIdParam !== '' ? parseInt(sessionIdParam, 10) : undefined;

  const handleBack = () => router.back();

  if (!id || Number.isNaN(therapistId)) {
    return null;
  }

  return (
    <DirectMessageTherapistScreen
      therapistId={therapistId}
      sessionId={Number.isNaN(sessionId ?? NaN) ? undefined : sessionId}
      onBack={handleBack}
    />
  );
}
