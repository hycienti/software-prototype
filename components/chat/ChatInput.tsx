import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoicePress?: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onVoicePress,
  placeholder = 'Type your thoughts...',
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.inputContainer}>
        {onVoicePress && (
          <TouchableOpacity
            onPress={onVoicePress}
            style={styles.voiceButton}
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.voiceButtonContent}>
              <Icon name="mic" size={24} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.inputWrapper}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.textInput}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendButton}
            disabled={!message.trim()}
            activeOpacity={0.8}
          >
            <View style={[styles.sendButtonInner, !message.trim() && styles.sendButtonDisabled]}>
              <Icon name="arrow_upward" size={18} color={message.trim() ? "#111d21" : "#6b7280"} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.safeArea} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 20,
    padding: 16,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(17, 29, 33, 0.3)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 38, 42, 0.6)',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  voiceButtonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(26, 38, 42, 0.6)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 48,
    maxHeight: 128,
    zIndex: 1,
  },
  sendButton: {
    paddingRight: 8,
    paddingLeft: 4,
    marginRight: 4,
  },
  sendButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#19b3e6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
  safeArea: {
    height: 4,
    width: '100%',
  },
});
