import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
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
    <View className="bg-background-light dark:bg-background-dark p-4 border-t border-gray-200 dark:border-gray-800">
      <View className="flex-row items-end gap-2">
        {onVoicePress && (
          <TouchableOpacity
            onPress={onVoicePress}
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-dark items-center justify-center active:bg-gray-200 dark:active:bg-gray-800"
          >
            <Icon name="mic" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
        <View className="flex-1 bg-white dark:bg-surface-dark rounded-2xl flex-row items-center border border-gray-200 dark:border-gray-700">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            className="flex-1 bg-transparent text-slate-900 dark:text-white px-4 py-3.5 text-base min-h-[48px]"
            style={{ maxHeight: 128 }}
          />
          <TouchableOpacity
            onPress={handleSend}
            className="pr-2 pl-1 mr-1"
            disabled={!message.trim()}
          >
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
              <Icon name="arrow_upward" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
