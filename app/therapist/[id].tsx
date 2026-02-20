import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TherapistProfileScreen } from '@/screens/TherapistProfileScreen';

export default function TherapistDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleBookConsultation = () => {
    router.push(`/therapist/${id}/book`);
  };

  const handleMessage = () => {
    if (id) router.push({ pathname: '/therapist/[id]/message', params: { id } });
  };

  return (
    <TherapistProfileScreen
      therapistId={id}
      onBack={handleBack}
      onBookConsultation={handleBookConsultation}
      onMessage={handleMessage}
    />
  );
}
