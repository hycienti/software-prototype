import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store';

/**
 * Root index page - handles initial routing based on authentication state
 * Waits for persisted auth to rehydrate so therapists are not sent to welcome briefly.
 */
export default function Index() {
  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setAuthHydrated(true);
    });
    return unsub;
  }, []);

  if (!authHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#19b3e6" />
      </View>
    );
  }

  // Redirect based on authentication state and role
  if (isAuthenticated) {
    if (role === 'therapist') {
      return <Redirect href="/(therapist-tabs)/dashboard" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111d21',
  },
});
