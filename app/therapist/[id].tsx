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
    router.push({
      pathname: '/payment',
      params: { therapistId: id },
    });
  };

  const handleMessage = () => {
    // TODO: Navigate to messaging
    console.log('Message therapist:', id);
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
