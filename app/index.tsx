import { useEffect } from 'react';
import { Redirect } from 'expo-router';

// For now, redirect to welcome screen
// In production, check auth state here
export default function Index() {
  useEffect(() => {
    console.log('Index screen loaded, redirecting to welcome');
  }, []);

  return <Redirect href="/(auth)/welcome" />;
}
