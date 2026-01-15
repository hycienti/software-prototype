import React from 'react';
import { useRouter } from 'expo-router';
import { TherapistRecommendationsScreen } from '@/screens/TherapistRecommendationsScreen';

export default function TherapistsPage() {
  const router = useRouter();

  const handleTherapistPress = (id: string) => {
    router.push(`/therapist/${id}`);
  };

  return (
    <TherapistRecommendationsScreen
      onTherapistPress={handleTherapistPress}
    />
  );
}
