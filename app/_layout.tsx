import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="dark">
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#111d21' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/welcome" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="voice" />
          <Stack.Screen name="therapists" />
          <Stack.Screen name="therapist/[id]" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="breathing" />
          <Stack.Screen name="box-breathing-settings" />
          <Stack.Screen name="journal" />
          <Stack.Screen name="gratitude" />
          <Stack.Screen name="gratitude-history" />
          <Stack.Screen name="mood-history" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="profile" />
        </Stack>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
