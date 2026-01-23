import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store';

/**
 * Root index page - handles initial routing based on authentication state
 * Checks if user is authenticated and redirects accordingly
 */
export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Small delay to ensure store is hydrated from AsyncStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading indicator while checking auth state
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#19b3e6" />
      </View>
    );
  }

  // Redirect based on authentication state
  if (isAuthenticated) {
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
