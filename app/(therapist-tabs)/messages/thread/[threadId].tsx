import { router, useLocalSearchParams } from 'expo-router';
import { TherapistClientChatScreen } from '@/screens/TherapistClientChatScreen';

export default function ThreadChatRoute() {
  const { threadId: threadIdParam } = useLocalSearchParams<{ threadId: string }>();
  const threadId = threadIdParam ? parseInt(threadIdParam, 10) : null;

  if (!threadIdParam || threadId == null || Number.isNaN(threadId)) {
    return null;
  }

  return (
    <TherapistClientChatScreen
      source={{ kind: 'thread', threadId }}
      onBack={() => router.back()}
    />
  );
}
