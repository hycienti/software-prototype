import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="thread/[threadId]" />
      <Stack.Screen name="client/[userId]" />
    </Stack>
  );
}
