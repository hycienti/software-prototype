import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface ChatHeaderProps {
  name: string;
  status?: string;
  avatarUri?: string;
  onBack?: () => void;
  onTalkToHuman?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  status = 'Online',
  avatarUri,
  onBack,
  onTalkToHuman,
}) => {
  return (
    <View className="bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3 flex-1">
        <TouchableOpacity
          onPress={onBack}
          className="p-2 -ml-2 rounded-full active:bg-gray-200 dark:active:bg-gray-800"
        >
          <Icon name="arrow_back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Avatar uri={avatarUri} size={40} showOnline={status === 'Online'} />
        <View className="flex-col">
          <Text className="text-base font-bold leading-tight">{name}</Text>
          <Text className="text-xs text-primary font-medium">{status}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onTalkToHuman}
        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 active:bg-rose-100 dark:active:bg-rose-900/30"
      >
        <Icon name="support_agent" size={18} color="#e11d48" />
        <Text className="text-xs font-bold text-rose-600 dark:text-rose-300">
          Human
        </Text>
      </TouchableOpacity>
    </View>
  );
};
