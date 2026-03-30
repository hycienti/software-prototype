import { Stack } from 'expo-router';

export default function TherapistSessionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="video-session" />
      <Stack.Screen name="session-summary" />
    </Stack>
  );
}
