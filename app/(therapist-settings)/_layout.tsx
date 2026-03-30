import { Stack } from 'expo-router';

export default function TherapistSettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="professional-profile" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="security" />
      <Stack.Screen name="help-support" />
    </Stack>
  );
}
