import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { voiceScreenStyles } from '@/screens/voice/voiceScreenStyles';

export interface VoiceBottomBarProps {
  onKeyboardPress?: () => void;
  onBack?: () => void;
  bar1Style: object;
  bar2Style: object;
  bar3Style: object;
  bar4Style: object;
  bar5Style: object;
}

export function VoiceBottomBar({
  onKeyboardPress,
  onBack,
  bar1Style,
  bar2Style,
  bar3Style,
  bar4Style,
  bar5Style,
}: VoiceBottomBarProps) {
  const styles = voiceScreenStyles;
  return (
    <View style={styles.bottomControlsContainer}>
      <View style={styles.bottomControlsWrapper}>
        <BlurView intensity={80} tint="dark" style={styles.glassPanel}>
          <TouchableOpacity
            onPress={onKeyboardPress}
            style={styles.controlButton}
            activeOpacity={0.8}
          >
            <View style={styles.controlButtonInner}>
              <Icon name="keyboard" size={24} color="#d1d5db" />
            </View>
          </TouchableOpacity>

          <View style={styles.visualizerContainer}>
            <Animated.View style={[styles.visualizerBar, bar1Style]} />
            <Animated.View style={[styles.visualizerBar, bar2Style]} />
            <Animated.View style={[styles.visualizerBar, bar3Style]} />
            <Animated.View style={[styles.visualizerBar, bar4Style]} />
            <Animated.View style={[styles.visualizerBar, bar5Style]} />
          </View>

          <TouchableOpacity onPress={onBack} style={styles.endButton} activeOpacity={0.8}>
            <View style={styles.endButtonInner}>
              <Icon name="close" size={24} color="#f87171" />
            </View>
          </TouchableOpacity>
        </BlurView>

        <Text style={styles.interfaceLabel}>Haven Voice Interface</Text>
      </View>
    </View>
  );
}
