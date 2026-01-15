import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
      <View style={styles.inputContainer}>
        {onVoicePress && (
          <TouchableOpacity
            onPress={onVoicePress}
            style={styles.voiceButton}
            activeOpacity={0.7}
          >
            <Icon name="mic" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
        <View style={styles.inputWrapper}>
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
    backgroundColor: '#111d21',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.8)',
    position: 'relative',
    zIndex: 20,
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
    backgroundColor: '#1a262a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#1a262a',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
