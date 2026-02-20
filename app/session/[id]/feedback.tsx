import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SessionFeedbackScreen } from '@/screens/SessionFeedbackScreen';

export default function SessionFeedbackPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = id ? parseInt(id, 10) : 0;

  const handleBack = () => router.back();
  const handleSubmitSuccess = () => {
    router.replace({
      pathname: '/feedback-thank-you',
      params: {},
    });
  };

  if (!id || Number.isNaN(sessionId)) {
    return null;
  }

  return (
    <SessionFeedbackScreen
      sessionId={sessionId}
      onBack={handleBack}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
}
