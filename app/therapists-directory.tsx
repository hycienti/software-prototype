import React from 'react';
import { useRouter } from 'expo-router';
import { TherapistsDirectoryScreen } from '@/screens/TherapistsDirectoryScreen';

export default function TherapistsDirectoryPage() {
  const router = useRouter();

  const handleBack = () => router.back();
  const handleTherapistPress = (id: string) => {
    router.push(`/therapist/${id}`);
  };

  return (
    <TherapistsDirectoryScreen onBack={handleBack} onTherapistPress={handleTherapistPress} />
  );
}
