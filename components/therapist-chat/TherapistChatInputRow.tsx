import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { therapistChatStyles } from '@/screens/therapist-chat/therapistChatStyles';

const styles = therapistChatStyles;

export interface TherapistChatInputRowProps {
  inputText: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  editable: boolean;
  onAttach: () => void;
  attachDisabled: boolean;
  attachLoading: boolean;
  onVoice: () => void;
  voiceDisabled: boolean;
  voiceLoading: boolean;
  isRecording: boolean;
  onSend: () => void;
  sendDisabled: boolean;
  sendLoading: boolean;
}

export function TherapistChatInputRow({
  inputText,
  onChangeText,
  placeholder,
  editable,
  onAttach,
  attachDisabled,
  attachLoading,
  onVoice,
  voiceDisabled,
  voiceLoading,
  isRecording,
  onSend,
  sendDisabled,
  sendLoading,
}: TherapistChatInputRowProps) {
  return (
    <View style={styles.inputRow}>
      <TouchableOpacity
        style={[styles.attachButton, attachDisabled && styles.buttonDisabled]}
        onPress={onAttach}
        disabled={attachDisabled}
        activeOpacity={0.8}
      >
        {attachLoading ? (
          <ActivityIndicator size="small" color="#19b3e6" />
        ) : (
          <Icon name="attach_file" size={24} color="#19b3e6" />
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        value={inputText}
        onChangeText={onChangeText}
        multiline
        maxLength={5000}
        editable={editable}
      />
      <TouchableOpacity
        style={[styles.voiceButton, voiceDisabled && styles.buttonDisabled]}
        onPress={onVoice}
        disabled={voiceDisabled}
        activeOpacity={0.8}
      >
        {voiceLoading ? (
          <ActivityIndicator size="small" color="#19b3e6" />
        ) : isRecording ? (
          <View style={styles.recordingDot} />
        ) : (
          <Icon name="mic" size={24} color="#19b3e6" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={sendDisabled}
        activeOpacity={0.8}
      >
        {sendLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="send" size={22} color="#ffffff" />
        )}
      </TouchableOpacity>
    </View>
  );
}
