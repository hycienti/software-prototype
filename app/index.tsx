import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useRouter } from 'expo-router';

// For now, redirect to welcome screen
// In production, check auth state here
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    // For now, always redirect to welcome
    router.replace('/(auth)/welcome');
  }, []);

  return null;
}
