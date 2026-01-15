/**
 * Example usage of Haven screens
 * Replace App.tsx content with one of these examples to test different screens
 */

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from '@/screens/HomeScreen';
import { ChatScreen } from '@/screens/ChatScreen';
import { VoiceScreen } from '@/screens/VoiceScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
// Import other screens as needed

export default function App() {
  return (
    <GluestackUIProvider mode="dark">
      {/* Example: Show Home Screen */}
      <HomeScreen />
      
      {/* Or show other screens: */}
      {/* <ChatScreen /> */}
      {/* <VoiceScreen /> */}
      {/* <WelcomeScreen /> */}
      
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
