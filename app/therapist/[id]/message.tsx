import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DirectMessageTherapistScreen } from '@/screens/DirectMessageTherapistScreen';

export default function TherapistMessagePage() {
  const router = useRouter();
  const { id, sessionId: sessionIdParam } = useLocalSearchParams<{ id: string; sessionId?: string }>();
  const therapistId = id ? parseInt(id, 10) : 0;
  const sessionId = sessionIdParam != null && sessionIdParam !== '' ? parseInt(sessionIdParam, 10) : undefined;

  const handleBack = () => router.back();

  const handleVideoPress = () => {
    if (sessionId != null && !Number.isNaN(sessionId)) {
      router.push({ pathname: '/session/[id]/call', params: { id: String(sessionId) } });
    }
  };

  if (!id || Number.isNaN(therapistId)) {
    return null;
  }

  const resolvedSessionId = sessionId != null && !Number.isNaN(sessionId) ? sessionId : undefined;

  return (
    <DirectMessageTherapistScreen
      therapistId={therapistId}
      sessionId={resolvedSessionId}
      onBack={handleBack}
      onVideoPress={resolvedSessionId != null ? handleVideoPress : undefined}
    />
  );
}
