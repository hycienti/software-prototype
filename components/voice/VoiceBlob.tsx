import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { voiceScreenStyles } from '@/screens/voice/voiceScreenStyles';
import type { VoiceState } from '@/screens/voice/voiceScreenTypes';

const BLOB_COLORS: Record<VoiceState, readonly [string, string, string]> = {
  listening: [
    'rgba(25, 179, 230, 0.9)',
    'rgba(76, 29, 149, 0.7)',
    'rgba(17, 29, 33, 0.2)',
  ],
  thinking: [
    'rgba(139, 92, 246, 0.8)',
    'rgba(88, 28, 135, 0.6)',
    'rgba(17, 29, 33, 0.1)',
  ],
  speaking: [
    'rgba(34, 197, 94, 0.8)',
    'rgba(25, 179, 230, 0.6)',
    'rgba(17, 29, 33, 0.1)',
  ],
  idle: [
    'rgba(25, 179, 230, 0.8)',
    'rgba(76, 29, 149, 0.6)',
    'rgba(17, 29, 33, 0.1)',
  ],
};

export interface VoiceBlobProps {
  voiceState: VoiceState;
  onPress: () => void;
  disabled: boolean;
  blobStyle: object;
  innerGlowStyle: object;
  ripple1Style: object;
  ripple2Style: object;
  ripple3Style: object;
}

export function VoiceBlob({
  voiceState,
  onPress,
  disabled,
  blobStyle,
  innerGlowStyle,
  ripple1Style,
  ripple2Style,
  ripple3Style,
}: VoiceBlobProps) {
  const styles = voiceScreenStyles;
  const colors = BLOB_COLORS[voiceState];
  return (
    <View className="relative w-64 h-64 items-center justify-center">
      <View style={styles.rippleContainer}>
        <Animated.View style={[styles.ripple, ripple1Style, { borderColor: 'rgba(25, 179, 230, 0.2)' }]} />
        <Animated.View style={[styles.ripple, ripple2Style, { borderColor: 'rgba(25, 179, 230, 0.1)' }]} />
        <Animated.View style={[styles.ripple, ripple3Style, { borderColor: 'rgba(25, 179, 230, 0.05)' }]} />
      </View>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        disabled={disabled}
        className="relative w-64 h-64"
      >
        <Animated.View
          style={[
            styles.innerGlow,
            innerGlowStyle,
            { backgroundColor: 'rgba(25, 179, 230, 0.2)' },
          ]}
        />
        <Animated.View style={[styles.blob, blobStyle]}>
          <LinearGradient
            colors={[...colors]}
            start={{ x: 0.3, y: 0.3 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
