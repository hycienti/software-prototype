import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { cn } from '@/utils/cn';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatScreenProps {
  onBack?: () => void;
  onTalkToHuman?: () => void;
  onVoicePress?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  onTalkToHuman,
  onVoicePress,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello, I'm Haven. I'm here to listen without judgment. How are you feeling today?",
      isUser: false,
      timestamp: '10:42 AM',
    },
    {
      id: '2',
      text: "I'm feeling a bit overwhelmed honestly. Just a lot going on at work and home.",
      isUser: true,
      timestamp: '10:43 AM',
    },
    {
      id: '3',
      text: "I hear you, and it's completely valid to feel that way when things pile up. Would you like to focus on what's happening at work, or talk about home first?",
      isUser: false,
      timestamp: '10:43 AM',
    },
    {
      id: '4',
      text: 'I think work is the main stressor right now.',
      isUser: true,
      timestamp: '10:44 AM',
    },
  ]);
  const [isTyping, setIsTyping] = useState(true);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
    setMessages([...messages, newMessage]);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ChatHeader
        name="Haven"
        status="Online"
        onBack={onBack}
        onTalkToHuman={onTalkToHuman}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-col gap-6">
          <View className="flex items-center py-2">
            <View className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {formatDate()}
              </Text>
            </View>
          </View>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
              showAvatar={!message.isUser}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <View className="h-2" />
        </View>
      </ScrollView>
      <ChatInput onSend={handleSend} onVoicePress={onVoicePress} />
    </SafeAreaView>
  );
};
