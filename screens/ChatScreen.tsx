import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
    return 'Today, 10:42 AM';
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Dark Gradient Background */}
      <View style={StyleSheet.absoluteFill} className="bg-background-dark">
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.4)',
            'rgba(15, 23, 42, 0.25)',
            'rgba(17, 29, 33, 0.15)',
            'rgba(17, 29, 33, 0.05)',
            'transparent',
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View 
          style={[
            styles.backgroundBlob1,
            { backgroundColor: 'rgba(25, 179, 230, 0.08)' }
          ]} 
        />
        <View 
          style={[
            styles.backgroundBlob2,
            { backgroundColor: 'rgba(88, 28, 135, 0.12)' }
          ]} 
        />
      </View>

      <ChatHeader
        name="Haven"
        status="Online"
        onBack={onBack}
        onTalkToHuman={onTalkToHuman}
      />
      <ScrollView
        className="flex-1 relative z-10"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.messagesContainer}>
          <View style={styles.dateSeparator}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{formatDate()}</Text>
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
          <View style={styles.spacer} />
        </View>
      </ScrollView>
      <ChatInput onSend={handleSend} onVoicePress={onVoicePress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  messagesContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(156, 163, 175, 0.8)',
  },
  spacer: {
    height: 8,
  },
  backgroundBlob1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.4,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: '20%',
    right: '-5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.4,
  },
});
