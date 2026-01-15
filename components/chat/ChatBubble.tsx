import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/utils/cn';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  showAvatar?: boolean;
  avatarUri?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp,
  showAvatar = false,
  avatarUri,
}) => {
  return (
    <View
      className={cn(
        'flex-row items-end gap-3',
        isUser && 'justify-end'
      )}
    >
      {!isUser && showAvatar && (
        <View className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 mb-1" />
      )}
      <View className={cn('flex-col gap-1', isUser ? 'items-end max-w-[80%]' : 'max-w-[80%]')}>
        <View
          className={cn(
            'px-4 py-3 rounded-2xl shadow-sm',
            isUser
              ? 'bg-white dark:bg-bubble-user rounded-br-sm border border-gray-100 dark:border-transparent'
              : 'bg-sky-100 dark:bg-bubble-haven rounded-bl-sm'
          )}
        >
          <Text
            className={cn(
              'text-[15px] leading-relaxed',
              isUser
                ? 'text-slate-900'
                : 'text-slate-800 dark:text-sky-50'
            )}
          >
            {message}
          </Text>
        </View>
        {timestamp && (
          <Text className="text-[10px] text-gray-400 dark:text-gray-500 mx-1">
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
};
