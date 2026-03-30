import { Stack } from 'expo-router';

export default function TherapistFinancialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="withdrawal-history" />
      <Stack.Screen name="transaction-details" />
      <Stack.Screen name="payment-success" />
    </Stack>
  );
}
