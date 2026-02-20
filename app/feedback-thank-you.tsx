import React from 'react';
import { useRouter } from 'expo-router';
import { FeedbackThankYouScreen } from '@/screens/FeedbackThankYouScreen';

export default function FeedbackThankYouPage() {
  const router = useRouter();

  return (
    <FeedbackThankYouScreen
      onReturnHome={() => router.replace('/(tabs)')}
      onStartBreathing={() => router.push('/breathing')}
    />
  );
}
