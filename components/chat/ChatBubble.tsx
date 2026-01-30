import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { formatMessageTime } from '@/utils/timeUtils';
import { MarkdownMessage } from './MarkdownMessage';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  showAvatar?: boolean;
  avatarUri?: string;
  pending?: boolean;
  error?: boolean;
  index?: number;
}

const havenAvatars = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbQ_QQDehffb7PueavmHdWYt5CUOnMQeW8Yks1ORez_O1ULbN2xSM2z5hpykH6OClDGdamv787VsHZYnyhBLurhcoFrXTBe-uQ7zOK9VNkC09oUmMzFnB1xRo_A3No6AqZTBHTD3UMVQG1stY4PhpdsIYdbtwrGGNv3EOS7rXVb_hLE2zr46GUuv2B4cpSE-v3ZDdLMV1Jrljqe9zcZ72QupjZUbXSo-G4owVjHCFgHjw_Rgq2ozShZ3FYKM_SU2ZeZwg3tFyoI3k',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDW0GN3Bt8GTh5cKrHSMejWorGMcjeqDAZ_FxmP2Bf-K5MCSZA9foknnuIC-p7UU2WqgHGdQTIAjJPOMNvw1P6ckRrVcTgGzxsCvWEI-6yqE8HD4JPCZbYEQ-6pShDflvLPCt0brLyCSqD6JmLC6w0-miN5ulw8xazj0TelK8dJeJQ--zLQxTgrl9cXadZAMYPQXpYiEQOtseBJz75HYxgoDUehOvU2WyCcRCqYtuq2PsBzgzTTk9vWji1BBbkV7zXXNHWbSRArsK4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAe8RFfY736d1qSC7thn6DYIe8U1E7BqMCz1GYgbyFQMXGC_4OmwQ3n9ISRgGL7_t7Rrob7jmyLjO1p3-UA8PP7PSp2q0nLv633JPzCSJQ_5VUq_093DSHghXJe-uftMRmM2mp_7MnDOWMNtWTsnHxCiuhW-VZGXeyTDRvFRBDy5HY5A_7ZfgjrGkXKFEh2z6Hx7oQIU4GzxUjzClFlzv9uvKORvXmytJSieF0W2IYyhKTNRa-0ZJJXAlu9X64tnVSBv5_SeVjdu_4',
];

export const ChatBubble = React.memo<ChatBubbleProps>(({
  message,
  isUser,
  timestamp,
  showAvatar = false,
  avatarUri,
  pending = false,
  error = false,
  index = 0,
}) => {
  // Use first Haven avatar for consistency (HTML shows different ones for visual variety)
  const avatarUrl = avatarUri || (showAvatar ? havenAvatars[0] : undefined);
  const formattedTimestamp = timestamp ? formatMessageTime(timestamp) : undefined;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={[
        styles.container,
        isUser && styles.containerUser,
        pending && styles.containerPending,
        error && styles.containerError,
      ]}
    >
      {!isUser && showAvatar && avatarUrl && (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}
      <View style={[styles.bubbleContainer, isUser && styles.bubbleContainerUser]}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleHaven
          ]}
        >
          <MarkdownMessage content={message} isUser={isUser} />
        </View>
        {formattedTimestamp && (
          <View style={[styles.timestampContainer, isUser && styles.timestampContainerUser]}>
            <Text style={styles.timestamp}>{formattedTimestamp}</Text>
            {isUser && !pending && !error && (
              <Icon name="done_all" size={12} color="#19b3e6" />
            )}
            {isUser && pending && (
              <Icon name="schedule" size={12} color="#9ca3af" />
            )}
            {isUser && error && (
              <Icon name="error" size={12} color="#f87171" />
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Memo comparison - only re-render if these change
  return (
    prevProps.message === nextProps.message &&
    prevProps.timestamp === nextProps.timestamp &&
    prevProps.pending === nextProps.pending &&
    prevProps.error === nextProps.error
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
    flexShrink: 0,
  },
  bubbleContainer: {
    flexDirection: 'column',
    gap: 4,
    maxWidth: '80%',
  },
  bubbleContainerUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleHaven: {
    backgroundColor: '#1e3a45',
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#eef2f6',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e0f2fe',
  },
  messageTextUser: {
    color: '#0f172a',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 4,
  },
  timestampContainerUser: {
    marginLeft: 0,
    marginRight: 4,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(156, 163, 175, 0.8)',
  },
  containerPending: {
    opacity: 0.7,
  },
  containerError: {
    opacity: 0.8,
  },
});
