import { router, useLocalSearchParams } from 'expo-router';
import { TherapistClientChatScreen } from '@/screens/TherapistClientChatScreen';

export default function ClientChatRoute() {
  const { userId: userIdParam } = useLocalSearchParams<{ userId: string }>();
  const userId = userIdParam ? parseInt(userIdParam, 10) : null;

  if (!userIdParam || userId == null || Number.isNaN(userId)) {
    return null;
  }

  return (
    <TherapistClientChatScreen
      source={{ kind: 'user', userId }}
      onBack={() => router.back()}
    />
  );
}
