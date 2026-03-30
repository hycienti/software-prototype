import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTherapistThread,
  useTherapistSendThreadMessage,
} from '@/hooks/useTherapistApi';
import type { ThreadMessage } from '@/types/therapist';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function MessageBubble({ msg }: { msg: ThreadMessage }) {
  const isTherapist = msg.senderType === 'therapist';
  return (
    <View
      className={`max-w-[80%] mb-2 px-4 py-3 rounded-2xl ${
        isTherapist
          ? 'self-end bg-[#19b3e6] rounded-br-sm'
          : 'self-start bg-white/8 rounded-bl-sm'
      }`}
    >
      <Text className={isTherapist ? 'text-white' : 'text-white/80'}>
        {msg.body}
      </Text>
      <Text
        className={`text-[10px] mt-1 ${
          isTherapist ? 'text-white/60' : 'text-white/30'
        }`}
      >
        {formatTime(msg.createdAt)}
      </Text>
    </View>
  );
}

export default function ThreadChatRoute() {
  const { threadId: threadIdParam } = useLocalSearchParams<{ threadId: string }>();
  const threadId = threadIdParam ? parseInt(threadIdParam, 10) : null;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [body, setBody] = useState('');

  const { thread, messages, loading } = useTherapistThread(threadId);
  const { sendMessage, loading: sending } = useTherapistSendThreadMessage(threadId);

  const clientName = thread?.user?.fullName ?? `Client #${thread?.userId ?? ''}`;

  const handleSend = async () => {
    const text = body.trim();
    if (!text || !threadId) return;
    setBody('');
    try {
      await sendMessage({ body: text });
    } catch (e) {
      console.error('Send error:', e);
    }
  };

  if (!threadIdParam || threadId == null || Number.isNaN(threadId)) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#111d21]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        className="bg-[#0a1a1f] border-b border-white/5 px-4 pb-3 flex-row items-center gap-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#19b3e6" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{clientName}</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          inverted={false}
        />
      )}

      {/* Input */}
      <View
        className="bg-[#0a1a1f] border-t border-white/5 px-4 py-3 flex-row items-end gap-2"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Type a message..."
          placeholderTextColor="#7a8a8e"
          multiline
          className="flex-1 bg-white/5 rounded-2xl px-4 py-3 text-white text-sm max-h-[120px] border border-white/8"
        />
        <Pressable
          onPress={handleSend}
          disabled={!body.trim() || sending}
          className="w-10 h-10 rounded-full bg-[#19b3e6] items-center justify-center"
          style={{ opacity: !body.trim() || sending ? 0.4 : 1 }}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="send" size={18} color="white" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
