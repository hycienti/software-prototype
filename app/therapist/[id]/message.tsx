import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DirectMessageTherapistScreen } from '@/screens/DirectMessageTherapistScreen';

export default function TherapistMessagePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const therapistId = id ? parseInt(id, 10) : 0;

  const handleBack = () => router.back();

  if (!id || Number.isNaN(therapistId)) {
    return null;
  }

  return (
    <DirectMessageTherapistScreen
      therapistId={therapistId}
      onBack={handleBack}
    />
  );
}
