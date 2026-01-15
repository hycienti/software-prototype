import React from 'react';
import { useRouter } from 'expo-router';
import { HomeScreen } from '@/screens/HomeScreen';

export default function HomePage() {
  const router = useRouter();

  // Pass navigation handlers to HomeScreen
  const handleChatPress = () => {
    router.push('/chat');
  };

  const handleVoicePress = () => {
    router.push('/voice');
  };

  const handleJournalPress = () => {
    router.push('/journal');
  };

  const handleWellnessPress = () => {
    router.push('/breathing');
  };

  const handleProfilePress = () => {
    // TODO: Navigate to profile
    console.log('Profile pressed');
  };

  const handleRecommendationPress = (id: string, type: string) => {
    if (type === 'video' || type === 'audio') {
      router.push('/breathing');
    } else {
      // Handle article navigation
      console.log('Article pressed:', id);
    }
  };

  return (
    <HomeScreen
      onChatPress={handleChatPress}
      onVoicePress={handleVoicePress}
      onJournalPress={handleJournalPress}
      onWellnessPress={handleWellnessPress}
      onProfilePress={handleProfilePress}
      onRecommendationPress={handleRecommendationPress}
    />
  );
}
