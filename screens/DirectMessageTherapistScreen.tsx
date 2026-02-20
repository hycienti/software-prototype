import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Icon } from '@/components/ui/Icon';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { therapistMessagesService } from '@/services/therapistMessages';
import type { TherapistThreadMessage as ApiMessage } from '@/types/api';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAMwb-cetFJqCtYFVevmjKD1ZHWxaXhuAkk6KOFUzdzYtTjXr3jI3oWgDXCZz-dD6K76ElAi6i1uBOPbnXKaFY0UBILhUKY90lwEMYaTZVf_YJrrBl8a77pYn67_CqF9bvgf48hv4K2mUqkNgPRhc9so4R5umLkwvmvP4I4n7i7YG3I9qR7f-dHF9aU_OrjJrayPeORCW3PkheM5OqRF6TkDhVg5_9L1PTaBHTivzsLNXso-kMjujHRT42AfbMy5A9uoiy8U1gbJpE';

interface DirectMessageTherapistScreenProps {
  therapistId: number;
  therapistName?: string | null;
  onBack: () => void;
}

export function DirectMessageTherapistScreen({
  therapistId,
  therapistName,
  onBack,
}: DirectMessageTherapistScreenProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDurationSec, setRecordingDurationSec] = useState(0);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackSoundRef = useRef<Audio.Sound | null>(null);
  const [playingVoiceUrl, setPlayingVoiceUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['therapist-thread', therapistId],
    queryFn: () => therapistMessagesService.getOrCreateThreadByTherapist(therapistId, { limit: 100 }),
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { body?: string; voiceUrl?: string; attachmentUrls?: string[] }) =>
      therapistMessagesService.sendMessage(data!.thread.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-thread', therapistId] });
      setInputText('');
    },
  });

  const messages: ApiMessage[] = data?.messages ?? [];
  const threadId = data?.thread?.id;

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const body = inputText.trim();
    if (!threadId || sendMutation.isPending) return;
    if (!body) return;
    sendMutation.mutate({ body });
  }, [inputText, threadId, sendMutation]);

  const handlePickAttachment = useCallback(async () => {
    if (!threadId || uploadingAttachment) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos to send an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    setUploadingAttachment(true);
    try {
      const { url } = await therapistMessagesService.upload(threadId, {
        uri: asset.uri,
        name: asset.fileName ?? 'image.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
      await therapistMessagesService.sendMessage(threadId, {
        body: inputText.trim() || undefined,
        attachmentUrls: [url],
      });
      queryClient.invalidateQueries({ queryKey: ['therapist-thread', therapistId] });
      setInputText('');
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Could not send attachment.');
    } finally {
      setUploadingAttachment(false);
    }
  }, [threadId, inputText, queryClient, therapistId, uploadingAttachment]);

  const startRecording = useCallback(async () => {
    if (!threadId || uploadingVoice) return;
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Microphone access is required to record voice messages.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDurationSec(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDurationSec((s) => s + 1);
      }, 1000);
    } catch (err) {
      Alert.alert('Recording failed', err instanceof Error ? err.message : 'Could not start recording.');
    }
  }, [threadId, uploadingVoice]);

  const clearRecordingTimer = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setRecordingDurationSec(0);
  }, []);

  const stopRecordingAndSend = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording || !threadId) return;
    setIsRecording(false);
    recordingRef.current = null;
    clearRecordingTimer();
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;
      setUploadingVoice(true);
      const { url } = await therapistMessagesService.upload(threadId, {
        uri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      });
      await therapistMessagesService.sendMessage(threadId, {
        body: inputText.trim() || undefined,
        voiceUrl: url,
      });
      queryClient.invalidateQueries({ queryKey: ['therapist-thread', therapistId] });
      setInputText('');
    } catch (err) {
      Alert.alert('Send failed', err instanceof Error ? err.message : 'Could not send voice message.');
    } finally {
      setUploadingVoice(false);
    }
  }, [threadId, inputText, queryClient, therapistId, clearRecordingTimer]);

  const stopRecordingAndDiscard = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    recordingRef.current = null;
    setIsRecording(false);
    clearRecordingTimer();
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // ignore on discard
    }
  }, [clearRecordingTimer]);

  // Stop recording when leaving the chat page (blur or unmount)
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopRecordingAndDiscard();
      };
    }, [stopRecordingAndDiscard])
  );

  useEffect(() => {
    return () => {
      stopRecordingAndDiscard();
    };
  }, [stopRecordingAndDiscard]);

  const handleVoicePress = useCallback(() => {
    if (isRecording) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecordingAndSend]);

  const stopPlayback = useCallback(async () => {
    if (!playbackSoundRef.current) return;
    try {
      await playbackSoundRef.current.unloadAsync();
    } catch {
      // ignore
    }
    playbackSoundRef.current = null;
    setPlayingVoiceUrl(null);
  }, []);

  const playOrPauseVoice = useCallback(
    async (voiceUrl: string) => {
      if (playingVoiceUrl === voiceUrl) {
        await stopPlayback();
        return;
      }
      await stopPlayback();
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          interruptionModeIOS: 1,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: voiceUrl },
          { shouldPlay: true }
        );
        playbackSoundRef.current = sound;
        setPlayingVoiceUrl(voiceUrl);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish && !status.isLooping) {
            stopPlayback();
          }
        });
      } catch (err) {
        if (__DEV__) console.warn('Voice playback failed', err);
        setPlayingVoiceUrl(null);
      }
    },
    [playingVoiceUrl, stopPlayback]
  );

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  const canSendText = Boolean(inputText.trim()) && !sendMutation.isPending;
  const canSend = canSendText || isRecording;
  const displayName = therapistName ?? data?.thread?.therapist?.fullName ?? `Therapist #${therapistId}`;

  const renderMessageContent = (item: ApiMessage, isUser: boolean) => {
    const hasVoice = Boolean(item.voiceUrl?.trim());
    const hasAttachments = Array.isArray(item.attachmentUrls) && item.attachmentUrls.length > 0;
    const hasBody = Boolean(item.body?.trim());
    const isPlayingThis = hasVoice && item.voiceUrl === playingVoiceUrl;
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleTherapist]}>
        {hasBody ? (
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextTherapist]}>
            {item.body}
          </Text>
        ) : null}
        {hasVoice ? (
          <TouchableOpacity
            style={styles.voiceRow}
            onPress={() => item.voiceUrl && playOrPauseVoice(item.voiceUrl)}
            activeOpacity={0.8}
          >
            <Icon
              name={isPlayingThis ? 'pause' : 'play_arrow'}
              size={20}
              color={isUser ? '#ffffff' : '#19b3e6'}
            />
            <Text style={[styles.voiceLabel, isUser ? styles.bubbleTextUser : styles.bubbleTextTherapist]}>
              {isPlayingThis ? 'Playing…' : 'Voice message'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {hasAttachments
          ? (item.attachmentUrls ?? []).map((url, idx) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp)/i.test(url) || /image\//i.test(url);
              return (
                <View key={idx} style={styles.attachmentWrap}>
                  {isImage ? (
                    <Image source={{ uri: url }} style={styles.attachmentImage} resizeMode="cover" />
                  ) : (
                    <TouchableOpacity onPress={() => Linking.openURL(url)} activeOpacity={0.8}>
                      <Text style={[styles.attachmentLink, isUser ? styles.bubbleTextUser : styles.bubbleTextTherapist]}>
                        Attachment
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          : null}
        <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeTherapist]}>
          {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatHeader
        avatarUri={DEFAULT_AVATAR}
        variant="therapist"
        name={displayName}
        status="Online"
        onBack={onBack}
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
                <Text style={styles.emptySubtext}>Send a message, voice note, or attachment to start.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isUser = item.senderType === 'user';
              return (
                <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapTherapist]}>
                  {renderMessageContent(item, isUser)}
                </View>
              );
            }}
          />
          {isRecording && (
            <View style={styles.recordingBar}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingLabel}>Recording</Text>
              <Text style={styles.recordingDuration}>
                {Math.floor(recordingDurationSec / 60)}:{(recordingDurationSec % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.attachButton, (uploadingAttachment || !threadId) && styles.buttonDisabled]}
              onPress={handlePickAttachment}
              disabled={uploadingAttachment || !threadId}
              activeOpacity={0.8}
            >
              {uploadingAttachment ? (
                <ActivityIndicator size="small" color="#19b3e6" />
              ) : (
                <Icon name="attach_file" size={24} color="#19b3e6" />
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder={isRecording ? 'Tap Send to finish…' : 'Type a message...'}
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={5000}
              editable={!sendMutation.isPending && !isRecording}
            />
            <TouchableOpacity
              style={[styles.voiceButton, (!threadId || uploadingVoice) && styles.buttonDisabled]}
              onPress={handleVoicePress}
              disabled={!threadId || uploadingVoice}
              activeOpacity={0.8}
            >
              {uploadingVoice ? (
                <ActivityIndicator size="small" color="#19b3e6" />
              ) : isRecording ? (
                <View style={styles.recordingDot} />
              ) : (
                <Icon name="mic" size={24} color="#19b3e6" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
              onPress={canSend ? (isRecording ? stopRecordingAndSend : handleSend) : undefined}
              disabled={!canSend}
              activeOpacity={0.8}
            >
              {sendMutation.isPending || uploadingVoice ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="send" size={22} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  bubbleWrap: {
    marginBottom: 10,
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapTherapist: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#19b3e6',
    borderBottomRightRadius: 4,
  },
  bubbleTherapist: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
  },
  bubbleTextUser: {
    color: '#ffffff',
  },
  bubbleTextTherapist: {
    color: '#e5e7eb',
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  voiceLabel: {
    fontSize: 14,
  },
  attachmentWrap: {
    marginTop: 6,
  },
  attachmentImage: {
    width: 160,
    height: 120,
    borderRadius: 8,
  },
  attachmentLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 4,
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.8)',
  },
  bubbleTimeTherapist: {
    color: '#9ca3af',
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.3)',
  },
  recordingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fca5a5',
  },
  recordingDuration: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f87171',
    fontVariant: ['tabular-nums'],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.5)',
    backgroundColor: '#111d21',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#e5e7eb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#19b3e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
