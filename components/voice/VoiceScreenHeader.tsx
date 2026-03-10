import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { voiceScreenStyles } from '@/screens/voice/voiceScreenStyles';

export interface VoiceScreenHeaderProps {
  statusText: string;
  recordingDuration: number;
  showRecordingDuration: boolean;
  pingStyle: object;
  listeningTextStyle: object;
}

export function VoiceScreenHeader({
  statusText,
  recordingDuration,
  showRecordingDuration,
  pingStyle,
  listeningTextStyle,
}: VoiceScreenHeaderProps) {
  const styles = voiceScreenStyles;
  return (
    <View style={styles.headerContainer} className="relative z-10 pt-12 pb-4 px-6 items-center">
      <BlurView intensity={20} tint="dark" style={styles.liveSessionBadge}>
        <View style={styles.liveDotContainer}>
          <Animated.View style={[styles.pingDot, pingStyle, { backgroundColor: '#19b3e6' }]} />
          <View style={[styles.liveDot, { backgroundColor: '#19b3e6' }]} />
        </View>
        <Text style={styles.liveSessionText}>Live Session</Text>
      </BlurView>
      <Animated.Text style={[styles.listeningText, listeningTextStyle]}>{statusText}</Animated.Text>
      {showRecordingDuration && recordingDuration > 0 && (
        <Text style={styles.recordingDuration}>
          {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
          {recordingDuration >= 55 && (
            <Text style={styles.durationWarning}> (Max 60s)</Text>
          )}
        </Text>
      )}
    </View>
  );
}
