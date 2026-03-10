import React from 'react';
import { View, Text } from 'react-native';
import { therapistChatStyles } from '@/screens/therapist-chat/therapistChatStyles';

const styles = therapistChatStyles;

export interface TherapistChatRecordingBarProps {
  recordingDurationSec: number;
}

export function TherapistChatRecordingBar({ recordingDurationSec }: TherapistChatRecordingBarProps) {
  return (
    <View style={styles.recordingBar}>
      <View style={styles.recordingDot} />
      <Text style={styles.recordingLabel}>Recording</Text>
      <Text style={styles.recordingDuration}>
        {Math.floor(recordingDurationSec / 60)}:
        {(recordingDurationSec % 60).toString().padStart(2, '0')}
      </Text>
    </View>
  );
}
