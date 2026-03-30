import { Stack } from "expo-router";

export default function TherapistOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#111d21" },
        presentation: "modal",
      }}
    >
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="specialties" />
    </Stack>
  );
}
