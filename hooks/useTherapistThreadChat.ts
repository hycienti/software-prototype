import { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  useAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  createAudioPlayer,
} from 'expo-audio';
import { therapistMessagesService } from '@/services/therapistMessages';
import type { ApiError, TherapistThreadMessage as ApiMessage } from '@/types/api';

export interface UseTherapistThreadChatOptions {
  therapistId: number;
  sessionId?: number;
  therapistName?: string | null;
}

export interface UseTherapistThreadChatResult {
  messages: ApiMessage[];
  isLoading: boolean;
  threadId: number | undefined;
  displayName: string;
  inputText: string;
  setInputText: (value: string) => void;
  canSendText: boolean;
  canSend: boolean;
  isRecording: boolean;
  recordingDurationSec: number;
  uploadingAttachment: boolean;
  uploadingVoice: boolean;
  playingVoiceUrl: string | null;
  isSending: boolean;
  handleSend: () => void;
  handlePickAttachment: () => Promise<void>;
  handleVoicePress: () => void;
  handleSendButtonPress: () => void;
  playOrPauseVoice: (voiceUrl: string) => Promise<void>;
}

export function useTherapistThreadChat({
  therapistId,
  sessionId,
  therapistName,
}: UseTherapistThreadChatOptions): UseTherapistThreadChatResult {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDurationSec, setRecordingDurationSec] = useState(0);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [playingVoiceUrl, setPlayingVoiceUrl] = useState<string | null>(null);

  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Tracks our recording session; native AudioRecorder can be released before React reruns — never gate cleanup on `audioRecorder.isRecording`. */
  const recordingNativeActiveRef = useRef(false);
  const playbackPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
  });

  const queryClient = useQueryClient();

  const threadQueryKey =
    sessionId != null ? ['therapist-thread', 'session', sessionId] : ['therapist-thread', therapistId];
  const { data, isLoading } = useQuery({
    queryKey: threadQueryKey,
    queryFn: () =>
      sessionId != null
        ? therapistMessagesService.getOrCreateThreadBySession(sessionId, { limit: 100 })
        : therapistMessagesService.getOrCreateThreadByTherapist(therapistId, { limit: 100 }),
    enabled: sessionId != null ? sessionId > 0 : therapistId > 0,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { body?: string; voiceUrl?: string; attachmentUrls?: string[] }) => {
      const tid = data?.thread?.id;
      if (!tid) throw new Error('No thread');
      return therapistMessagesService.sendMessage(tid, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: threadQueryKey });
      setInputText('');
    },
  });

  const messages: ApiMessage[] = data?.messages ?? [];
  const threadId = data?.thread?.id;

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
      queryClient.invalidateQueries({ queryKey: threadQueryKey });
      setInputText('');
    } catch (err) {
      const apiErr = err as ApiError | undefined;
      const base = err instanceof Error ? err.message : 'Could not send attachment.';
      const hint =
        apiErr?.status === 400
          ? ' Invalid file or format.'
          : apiErr?.status && apiErr.status >= 500
            ? ' Server error. Try again.'
            : '';
      Alert.alert('Upload failed', base + hint);
    } finally {
      setUploadingAttachment(false);
    }
  }, [threadId, inputText, queryClient, threadQueryKey, uploadingAttachment]);

  const clearRecordingTimer = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setRecordingDurationSec(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (!threadId || uploadingVoice) return;
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Microphone access is required to record voice messages.');
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      recordingNativeActiveRef.current = true;
      setIsRecording(true);
      setRecordingDurationSec(0);
      recordingIntervalRef.current = setInterval(() => {
        try {
          const status = audioRecorder.getStatus();
          setRecordingDurationSec(Math.floor(status.durationMillis / 1000));
        } catch {
          // Recorder may already be released (e.g. blur cleanup)
        }
      }, 1000);
    } catch (err) {
      recordingNativeActiveRef.current = false;
      Alert.alert(
        'Recording failed',
        err instanceof Error ? err.message : 'Could not start recording.'
      );
    }
  }, [threadId, uploadingVoice, audioRecorder]);

  const stopRecordingAndSend = useCallback(async () => {
    if (!recordingNativeActiveRef.current || !threadId) return;
    recordingNativeActiveRef.current = false;
    setIsRecording(false);
    clearRecordingTimer();
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
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
      queryClient.invalidateQueries({ queryKey: threadQueryKey });
      setInputText('');
    } catch (err) {
      const apiErr = err as ApiError | undefined;
      const base = err instanceof Error ? err.message : 'Could not send voice message.';
      const hint =
        apiErr?.status === 400
          ? ' Invalid file or format.'
          : apiErr?.status && apiErr.status >= 500
            ? ' Server error. Try again.'
            : '';
      Alert.alert('Send failed', base + hint);
    } finally {
      setUploadingVoice(false);
    }
  }, [threadId, inputText, queryClient, threadQueryKey, clearRecordingTimer, audioRecorder]);

  const stopRecordingAndDiscard = useCallback(async () => {
    if (!recordingNativeActiveRef.current) return;
    recordingNativeActiveRef.current = false;
    setIsRecording(false);
    clearRecordingTimer();
    try {
      await audioRecorder.stop();
    } catch {
      // ignore on discard / already released
    }
  }, [clearRecordingTimer, audioRecorder]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        void stopRecordingAndDiscard();
      };
    }, [stopRecordingAndDiscard])
  );

  useEffect(() => {
    return () => {
      void stopRecordingAndDiscard();
    };
  }, [stopRecordingAndDiscard]);

  const handleVoicePress = useCallback(() => {
    if (isRecording) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecordingAndSend]);

  const stopPlayback = useCallback(() => {
    const player = playbackPlayerRef.current;
    if (!player) return;
    try {
      player.pause();
      player.remove();
    } catch {
      // ignore
    }
    playbackPlayerRef.current = null;
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
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: 'duckOthers',
        });
        const player = createAudioPlayer(voiceUrl, {});
        playbackPlayerRef.current = player;
        setPlayingVoiceUrl(voiceUrl);
        player.addListener('playbackStatusUpdate', (status) => {
          if (status.didJustFinish) {
            stopPlayback();
          }
        });
        player.play();
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
  const displayName =
    therapistName ?? data?.thread?.therapist?.fullName ?? `Therapist #${therapistId}`;

  const handleSendButtonPress = useCallback(() => {
    if (isRecording) {
      stopRecordingAndSend();
    } else {
      handleSend();
    }
  }, [isRecording, stopRecordingAndSend, handleSend]);

  return {
    messages,
    isLoading,
    threadId,
    displayName,
    inputText,
    setInputText,
    canSendText,
    canSend,
    isRecording,
    recordingDurationSec,
    uploadingAttachment,
    uploadingVoice,
    playingVoiceUrl,
    isSending: sendMutation.isPending || uploadingVoice,
    handleSend,
    handlePickAttachment,
    handleVoicePress,
    handleSendButtonPress,
    playOrPauseVoice,
  };
}
