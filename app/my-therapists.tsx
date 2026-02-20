import React from 'react';
import { useRouter } from 'expo-router';
import { MyTherapistsScreen } from '@/screens/MyTherapistsScreen';

export default function MyTherapistsPage() {
  const router = useRouter();

  const handleBack = () => router.back();
  const handleMessage = (therapistId: number, sessionId: number) => {
    router.push({
      pathname: '/therapist/[id]/message',
      params: { id: String(therapistId), sessionId: String(sessionId) },
    });
  };
  const handleVideoCall = (sessionId: number) => {
    router.push({ pathname: '/session/[id]/call', params: { id: String(sessionId) } });
  };
  const handleBookAgain = (therapistId: string) => {
    router.push(`/therapist/${therapistId}`);
  };
  const handleViewNotesSummary = (sessionId: number) => {
    router.push({ pathname: '/session/[id]/summary', params: { id: String(sessionId) } });
  };

  return (
    <MyTherapistsScreen
      onBack={handleBack}
      onMessage={handleMessage}
      onVideoCall={handleVideoCall}
      onBookAgain={handleBookAgain}
      onViewNotesSummary={handleViewNotesSummary}
    />
  );
}
