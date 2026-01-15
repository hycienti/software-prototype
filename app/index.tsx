import { Redirect } from 'expo-router';

// For now, redirect to welcome screen
// In production, check auth state here
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
