import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChatHeader } from '@/components/chat/ChatHeader';
import {
  useTherapistPortalThreadChat,
  type TherapistPortalChatSource,
} from '@/hooks/useTherapistPortalThreadChat';
import { TherapistMessageBubble } from '@/components/therapist-chat/TherapistMessageBubble';
import { TherapistChatRecordingBar } from '@/components/therapist-chat/TherapistChatRecordingBar';
import { TherapistChatInputRow } from '@/components/therapist-chat/TherapistChatInputRow';
import { therapistChatStyles } from '@/screens/therapist-chat/therapistChatStyles';
import type { ThreadMessage } from '@/types/therapist';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAMwb-cetFJqCtYFVevmjKD1ZHWxaXhuAkk6KOFUzdzYtTjXr3jI3oWgDXCZz-dD6K76ElAi6i1uBOPbnXKaFY0UBILhUKY90lwEMYaTZVf_YJrrBl8a77pYn67_CqF9bvgf48hv4K2mUqkNgPRhc9so4R5umLkwvmvP4I4n7i7YG3I9qR7f-dHF9aU_OrjJrayPeORCW3PkheM5OqRF6TkDhVg5_9L1PTaBHTivzsLNXso-kMjujHRT42AfbMy5A9uoiy8U1gbJpE';

export interface TherapistClientChatScreenProps {
  source: TherapistPortalChatSource;
  onBack: () => void;
}

export function TherapistClientChatScreen({ source, onBack }: TherapistClientChatScreenProps) {
  const listRef = useRef<FlatList<ThreadMessage>>(null);

  const {
    clientName,
    sessionId,
    clientAvatarUrl,
    messages,
    isLoading,
    threadId,
    inputText,
    setInputText,
    canSend,
    isRecording,
    recordingDurationSec,
    uploadingAttachment,
    uploadingVoice,
    playingVoiceUrl,
    isSending,
    handlePickAttachment,
    handleVoicePress,
    handleSendButtonPress,
    playOrPauseVoice,
  } = useTherapistPortalThreadChat(source);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const styles = therapistChatStyles;

  const handleVideoPress = () => {
    if (sessionId != null && sessionId > 0) {
      router.push({
        pathname: '/(therapist-sessions)/video-session',
        params: { sessionId: String(sessionId) },
      });
    } else {
      Alert.alert(
        'No session',
        'There is no booked session linked to this chat. Open the client from the schedule or dashboard to start a video call.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatHeader
        avatarUri={clientAvatarUrl ?? DEFAULT_AVATAR}
        variant="therapist"
        name={clientName}
        status="Messages"
        onBack={onBack}
        onVideoPress={handleVideoPress}
        onMorePress={() => {}}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>
                  Send a message, voice note, or attachment to start.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isClient = item.senderType === 'user';
              return (
                <View style={[styles.bubbleWrap, isClient ? styles.bubbleWrapUser : styles.bubbleWrapTherapist]}>
                  <TherapistMessageBubble
                    item={item}
                    isUser={isClient}
                    playingVoiceUrl={playingVoiceUrl}
                    onPlayVoice={playOrPauseVoice}
                  />
                </View>
              );
            }}
          />
          {isRecording && <TherapistChatRecordingBar recordingDurationSec={recordingDurationSec} />}
          <TherapistChatInputRow
            inputText={inputText}
            onChangeText={setInputText}
            placeholder={isRecording ? 'Tap Send to finish…' : 'Type a message...'}
            editable={!isSending && !isRecording}
            onAttach={handlePickAttachment}
            attachDisabled={uploadingAttachment || !threadId}
            attachLoading={uploadingAttachment}
            onVoice={handleVoicePress}
            voiceDisabled={!threadId || uploadingVoice}
            voiceLoading={uploadingVoice}
            isRecording={isRecording}
            onSend={handleSendButtonPress}
            sendDisabled={!canSend}
            sendLoading={isSending}
          />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
