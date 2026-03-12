import { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  useAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { getBase64FromRecordingUri } from '@/utils/voiceHelper';
import { useProcessVoiceMessageAsync } from '@/hooks/useVoice';
import { useConversationContext } from '@/contexts/ConversationContext';
import { useAuthStore, useUIStore } from '@/store';
import { subscribeToVoiceResults, unsubscribeFromVoiceResults } from '@/services/voice/voicePusher';
import { getStatusText as getStatusTextFn, type VoiceState } from '@/screens/voice/voiceScreenTypes';

export interface UseVoiceScreenOptions {
  conversationId: number | null;
  onKeyboardPress?: () => void;
  onBack?: () => void;
}

export interface UseVoiceScreenResult {
  voiceState: VoiceState;
  progressStep: string | null;
  currentConversationId: number | null;
  recordingDuration: number;
  audioLevel: number;
  statusText: string;
  handleBlobPress: () => void;
  onBack: (() => void) | undefined;
  onKeyboardPress: (() => void) | undefined;
}

export function useVoiceScreen({
  conversationId,
  onKeyboardPress,
  onBack,
}: UseVoiceScreenOptions): UseVoiceScreenResult {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(conversationId);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopRecordingRef = useRef<(() => Promise<void>) | null>(null);
  const isRecordingRef = useRef(false);
  const speechResolveRef = useRef<(() => void) | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const user = useAuthStore((s) => s.user);
  const { showAlert } = useUIStore();
  const processVoiceMutation = useProcessVoiceMessageAsync(user?.id ?? null);
  const { currentConversation, updateConversationId } = useConversationContext();

  useEffect(() => {
    const uid = user?.id;
    if (uid == null) return;
    subscribeToVoiceResults(uid, {
      onProgress: (step) => setProgressStep(step),
    });
    return () => {
      unsubscribeFromVoiceResults(uid);
    };
  }, [user?.id]);

  useEffect(() => {
    if (currentConversation?.id && currentConversation.id !== currentConversationId) {
      setCurrentConversationId(currentConversation.id);
    }
  }, [currentConversation, currentConversationId]);

  const stopTTSPlayback = useCallback(() => {
    Speech.stop();
    if (speechResolveRef.current) {
      speechResolveRef.current();
      speechResolveRef.current = null;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopTTSPlayback();
        if (isRecordingRef.current) {
          isRecordingRef.current = false;
          try {
            audioRecorder.stop().catch(() => {});
          } catch (_) {}
        }
      };
    }, [audioRecorder, stopTTSPlayback])
  );

  useEffect(() => {
    return () => {
      stopTTSPlayback();
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        try {
          audioRecorder.stop().catch(() => {});
        } catch (_) {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current);
      }
    };
  }, [audioRecorder, stopTTSPlayback]);

  const handleStartRecording = useCallback(async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        throw new Error('Microphone permission not granted');
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setVoiceState('listening');
      setRecordingDuration(0);
      setAudioLevel(0);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      isRecordingRef.current = true;
      recordingStartTimeRef.current = Date.now();

      durationTimerRef.current = setInterval(() => {
        const status = audioRecorder.getStatus();
        setRecordingDuration(Math.floor(status.durationMillis / 1000));
        if (status.durationMillis >= 60_000) {
          stopRecordingRef.current?.();
        }
      }, 1000);

      meteringIntervalRef.current = setInterval(() => {
        const status = audioRecorder.getStatus();
        if (status.metering !== undefined) {
          const normalizedLevel = Math.max(0, Math.min(1, (status.metering + 60) / 60));
          setAudioLevel(normalizedLevel);
          const elapsed = Date.now() - recordingStartTimeRef.current;
          const minRecordingMs = 4000;
          if (status.metering < -45 && elapsed >= minRecordingMs) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                stopRecordingRef.current?.();
              }, 4000);
            }
          } else {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          }
        }
      }, 100);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error: unknown) {
      isRecordingRef.current = false;
      showAlert({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to start recording',
        type: 'error',
      });
      setVoiceState('idle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [audioRecorder, showAlert]);

  const handleStopRecording = useCallback(async () => {
    try {
      if (!isRecordingRef.current) return;
      isRecordingRef.current = false;
      if (!audioRecorder.isRecording) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current);
        meteringIntervalRef.current = null;
      }
      recordingStartTimeRef.current = 0;

      setVoiceState('thinking');
      setProgressStep(null);
      setAudioLevel(0);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        throw new Error('No recording URI available');
      }
      const audioBase64 = await getBase64FromRecordingUri(uri);
      setRecordingDuration(0);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const response = await processVoiceMutation.mutateAsync({
        conversationId: currentConversationId || undefined,
        audioData: audioBase64,
        audioFormat: 'm4a',
        language: 'en',
      });

      if (!currentConversationId && response.conversation.id) {
        setCurrentConversationId(response.conversation.id);
        updateConversationId(response.conversation.id);
      }

      if (response.sentiment?.crisisIndicators && response.sentiment.crisisIndicators.length > 0) {
        showAlert({
          title: 'Support Available',
          message:
            "I've noticed some concerning indicators. Would you like to speak with a human therapist?",
          type: 'warning',
          buttons: [
            { text: 'Continue', style: 'cancel' },
            { text: 'Talk to Human', onPress: () => onKeyboardPress?.() },
          ],
        });
      }

      setProgressStep(null);
      const content = response.response?.content?.trim() ?? '';
      if (!content) {
        if (__DEV__) console.warn('Voice: missing or empty response content');
        setVoiceState('idle');
      } else {
        if (__DEV__) console.log('Voice: speaking with expo-speech', { contentLength: content.length });
        setVoiceState('speaking');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await new Promise<void>((resolve, reject) => {
          speechResolveRef.current = resolve;
          Speech.speak(content, {
            onDone: () => {
              if (speechResolveRef.current) {
                speechResolveRef.current();
                speechResolveRef.current = null;
              }
              resolve();
            },
            onError: (err) => {
              speechResolveRef.current = null;
              reject(err);
            },
          });
        });
        setVoiceState('idle');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error: unknown) {
      setProgressStep(null);
      showAlert({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to process voice message',
        type: 'error',
      });
      setVoiceState('idle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [
    currentConversationId,
    processVoiceMutation,
    onKeyboardPress,
    updateConversationId,
    audioRecorder,
    showAlert,
  ]);

  useEffect(() => {
    stopRecordingRef.current = handleStopRecording;
    return () => {
      stopRecordingRef.current = null;
    };
  }, [handleStopRecording]);

  const handleBlobPress = useCallback(() => {
    if (voiceState === 'idle') {
      handleStartRecording();
    } else if (voiceState === 'listening') {
      handleStopRecording();
    } else if (voiceState === 'speaking') {
      stopTTSPlayback();
      setVoiceState('idle');
      handleStartRecording();
    }
  }, [voiceState, handleStartRecording, handleStopRecording, stopTTSPlayback]);

  const statusText = getStatusTextFn(voiceState, progressStep);

  return {
    voiceState,
    progressStep,
    currentConversationId,
    recordingDuration,
    audioLevel,
    statusText,
    handleBlobPress,
    onBack,
    onKeyboardPress,
  };
}
