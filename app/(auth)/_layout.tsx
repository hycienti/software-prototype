import { Stack } from 'expo-router';

/**
 * Auth group layout
 * Handles authentication-related screens
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#111d21' },
      }}
    >
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
