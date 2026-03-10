import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVoiceScreen } from '@/hooks/useVoiceScreen';
import { useVoiceAnimations } from '@/hooks/useVoiceAnimations';
import { VoiceScreenHeader } from '@/components/voice/VoiceScreenHeader';
import { VoiceBlob } from '@/components/voice/VoiceBlob';
import { VoiceBottomBar } from '@/components/voice/VoiceBottomBar';
import { voiceScreenStyles } from '@/screens/voice/voiceScreenStyles';
import type { VoiceScreenProps } from '@/screens/voice/voiceScreenTypes';

export const VoiceScreen: React.FC<VoiceScreenProps> = ({
  onBack,
  onKeyboardPress,
  conversationId = null,
}) => {
  const {
    voiceState,
    recordingDuration,
    audioLevel,
    statusText,
    handleBlobPress,
    onBack: onBackProp,
    onKeyboardPress: onKeyboardPressProp,
  } = useVoiceScreen({
    conversationId,
    onKeyboardPress,
    onBack,
  });

  const animations = useVoiceAnimations(voiceState, audioLevel);

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <View style={StyleSheet.absoluteFill} className="bg-background-dark">
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.4)',
            'rgba(15, 23, 42, 0.2)',
            'transparent',
          ]}
          locations={[0, 0.5, 1]}
          style={[StyleSheet.absoluteFill, { height: '80%' }]}
        />
        <View
          style={[voiceScreenStyles.backgroundBlob1, { backgroundColor: 'rgba(25, 179, 230, 0.1)' }]}
        />
        <View
          style={[voiceScreenStyles.backgroundBlob2, { backgroundColor: 'rgba(88, 28, 135, 0.2)' }]}
        />
      </View>

      <VoiceScreenHeader
        statusText={statusText}
        recordingDuration={recordingDuration}
        showRecordingDuration={voiceState === 'listening'}
        pingStyle={animations.pingStyle}
        listeningTextStyle={animations.listeningTextStyle}
      />

      <View className="flex-1 items-center justify-center relative z-10">
        <VoiceBlob
          voiceState={voiceState}
          onPress={handleBlobPress}
          disabled={voiceState === 'thinking'}
          blobStyle={animations.blobStyle}
          innerGlowStyle={animations.innerGlowStyle}
          ripple1Style={animations.ripple1Style}
          ripple2Style={animations.ripple2Style}
          ripple3Style={animations.ripple3Style}
        />
      </View>

      <VoiceBottomBar
        onKeyboardPress={onKeyboardPressProp}
        onBack={onBackProp}
        bar1Style={animations.bar1Style}
        bar2Style={animations.bar2Style}
        bar3Style={animations.bar3Style}
        bar4Style={animations.bar4Style}
        bar5Style={animations.bar5Style}
      />
    </SafeAreaView>
  );
};
