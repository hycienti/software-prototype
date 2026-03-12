import { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useProcessVoiceMessageAsync } from '@/hooks/useVoice';
import { useConversationContext } from '@/contexts/ConversationContext';
import { useAuthStore, useUIStore } from '@/store';
import {
  subscribeToVoiceResults,
  unsubscribeFromVoiceResults,
  createWhisperRealtimeSttAdapter,
  getDocumentDirWhisperModelPaths,
} from '@/services/voice';
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

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopRecordingRef = useRef<(() => Promise<void>) | null>(null);
  const isTranscribingRef = useRef(false);
  const speechResolveRef = useRef<(() => void) | null>(null);
  const sttPortRef = useRef<ReturnType<typeof createWhisperRealtimeSttAdapter> | null>(null);

  function getSttPort() {
    if (!sttPortRef.current) {
      sttPortRef.current = createWhisperRealtimeSttAdapter({
        getModelPaths: () => Promise.resolve(getDocumentDirWhisperModelPaths()),
      });
    }
    return sttPortRef.current;
  }

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
        if (isTranscribingRef.current) {
          isTranscribingRef.current = false;
          getSttPort().stopRealtimeTranscription().catch(() => {});
        }
      };
    }, [stopTTSPlayback])
  );

  useEffect(() => {
    return () => {
      stopTTSPlayback();
      if (isTranscribingRef.current) {
        isTranscribingRef.current = false;
        getSttPort().stopRealtimeTranscription().catch(() => {});
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [stopTTSPlayback]);

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
      isTranscribingRef.current = true;
      const startTime = Date.now();

      await getSttPort().startRealtimeTranscription({ language: 'en' });

      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
        if (Date.now() - startTime >= 60_000) {
          stopRecordingRef.current?.();
        }
      }, 1000);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error: unknown) {
      isTranscribingRef.current = false;
      showAlert({
        title: 'Error',
        message:
          error instanceof Error ? error.message : 'Failed to start speech recognition. Ensure Whisper models are available.',
        type: 'error',
      });
      setVoiceState('idle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [showAlert]);

  const handleStopRecording = useCallback(async () => {
    try {
      if (!isTranscribingRef.current) return;
      isTranscribingRef.current = false;

      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }

      setVoiceState('thinking');
      setProgressStep(null);
      setAudioLevel(0);
      const transcript = await getSttPort().stopRealtimeTranscription();
      setRecordingDuration(0);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const trimmed = transcript.trim();
      if (trimmed.length < 2) {
        showAlert({
          title: 'No speech detected',
          message: 'Please try again and speak clearly.',
          type: 'warning',
        });
        setVoiceState('idle');
        return;
      }

      const response = await processVoiceMutation.mutateAsync({
        conversationId: currentConversationId || undefined,
        transcript: trimmed,
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
