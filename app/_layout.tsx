import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationProvider } from '@/contexts/ConversationContext';
import { GlobalAlertModal } from '@/components/ui';
import '../global.css';

import { ErrorBoundary } from '@/components/ErrorBoundary'

// Create a client for React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 0, // Consider data stale immediately (can be overridden per query)
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConversationProvider>
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
            <Stack.Screen name="my-therapists" />
            <Stack.Screen name="therapist/[id]" />
            <Stack.Screen name="session/[id]/summary" />
            <Stack.Screen name="session/[id]/feedback" />
            <Stack.Screen name="session/[id]/call" />
            <Stack.Screen name="feedback-thank-you" />
            <Stack.Screen name="therapist/[id]/message" />
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
              <GlobalAlertModal />
            </GluestackUIProvider>
          </SafeAreaProvider>
        </ConversationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
