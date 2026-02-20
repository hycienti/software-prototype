import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  useAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { getBase64FromRecordingUri, playAudioFromBase64 } from '@/utils/voiceHelper';
import { useProcessVoiceMessageAsync } from '@/hooks/useVoice';
import { useConversationContext } from '@/contexts/ConversationContext';
import { useAuthStore, useUIStore } from '@/store';
import { subscribeToVoiceResults, unsubscribeFromVoiceResults } from '@/services/voice/voicePusher';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceScreenProps {
  onBack?: () => void;
  onKeyboardPress?: () => void;
  conversationId?: number | null;
}

export const VoiceScreen: React.FC<VoiceScreenProps> = ({
  onBack,
  onKeyboardPress,
  conversationId = null,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(conversationId);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const user = useAuthStore((s) => s.user);
  const { showAlert } = useUIStore();
  const processVoiceMutation = useProcessVoiceMessageAsync(user?.id ?? null);
  const { currentConversation, updateConversationId } = useConversationContext();

  // Subscribe to Pusher voice results on mount; unsubscribe on unmount
  useEffect(() => {
    const uid = user?.id
    if (uid == null) return
    subscribeToVoiceResults(uid, {
      onProgress: (step) => setProgressStep(step),
    })
    return () => {
      unsubscribeFromVoiceResults(uid)
    }
  }, [user?.id])

  // Sync conversation ID from context
  useEffect(() => {
    if (currentConversation?.id && currentConversation.id !== currentConversationId) {
      setCurrentConversationId(currentConversation.id);
    }
  }, [currentConversation]);

  // Blob animation values
  const blobProgress = useSharedValue(0);
  const innerGlowOpacity = useSharedValue(0.3);
  
  // Ping animation for live dot
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.75);
  
  // Listening text pulse
  const listeningOpacity = useSharedValue(0.9);
  
  // Ripple animation values
  const ripple1 = useSharedValue(0.8);
  const ripple2 = useSharedValue(0.8);
  const ripple3 = useSharedValue(0.8);
  
  // Visualizer bar animations
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.5);
  const bar3 = useSharedValue(0.8);
  const bar4 = useSharedValue(0.4);
  const bar5 = useSharedValue(0.3);

  useEffect(() => {
    // Blob morphing animation (10s infinite alternate)
    blobProgress.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Inner glow pulse (4s slow pulse)
    innerGlowOpacity.value = withRepeat(
      withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Ping animation for live dot
    pingScale.value = withRepeat(
      withTiming(2, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pingOpacity.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Listening text pulse
    listeningOpacity.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Ripple animations (3s each with delays)
    const startRipple1 = () => {
      ripple1.value = 0.8;
      ripple1.value = withRepeat(
        withTiming(2.5, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    };
    const startRipple2 = () => {
      ripple2.value = 0.8;
      ripple2.value = withRepeat(
        withTiming(2.5, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    };
    const startRipple3 = () => {
      ripple3.value = 0.8;
      ripple3.value = withRepeat(
        withTiming(2.5, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    };
    
    startRipple1();
    setTimeout(startRipple2, 1000);
    setTimeout(startRipple3, 2000);

    // Visualizer bar pulses (different timings)
    bar1.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar2.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar3.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar4.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar5.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (audioRecorder.isRecording) {
        audioRecorder.stop().catch(() => {});
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
  }, [audioRecorder]);

  // Update visualizer animation based on voice state and audio levels
  useEffect(() => {
    if (voiceState === 'listening') {
      // Real-time audio level based animation
      const updateBars = () => {
        if (voiceState === 'listening' && audioLevel > 0) {
          // Use actual audio level for more dynamic visualization
          const baseLevel = audioLevel;
          bar1.value = withTiming(baseLevel * 0.8, { duration: 100 });
          bar2.value = withTiming(baseLevel * 1.0, { duration: 100 });
          bar3.value = withTiming(baseLevel * 1.2, { duration: 100 });
          bar4.value = withTiming(baseLevel * 0.9, { duration: 100 });
          bar5.value = withTiming(baseLevel * 0.7, { duration: 100 });
        }
      };
      const interval = setInterval(updateBars, 100);
      return () => clearInterval(interval);
    } else if (voiceState === 'speaking') {
      // Active animation for speaking
      bar1.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar2.value = withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar3.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar4.value = withRepeat(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar5.value = withRepeat(
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      // Calmer animation for idle/thinking
      bar1.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar2.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar3.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar4.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar5.value = withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [voiceState, audioLevel]);

  // Voice recording handlers
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

      // Duration timer and 60s cap
      durationTimerRef.current = setInterval(() => {
        const status = audioRecorder.getStatus();
        setRecordingDuration(Math.floor(status.durationMillis / 1000));
        if (status.durationMillis >= 60_000) {
          stopRecordingRef.current?.();
        }
      }, 1000);

      // Metering and VAD (voice activity detection)
      meteringIntervalRef.current = setInterval(() => {
        const status = audioRecorder.getStatus();
        if (status.metering !== undefined) {
          const normalizedLevel = Math.max(0, Math.min(1, (status.metering + 60) / 60));
          setAudioLevel(normalizedLevel);
          if (status.metering < -40) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                stopRecordingRef.current?.();
              }, 2500);
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
    } catch (error: any) {
      showAlert({
        title: 'Error',
        message: error?.message || 'Failed to start recording',
        type: 'error',
      });
      setVoiceState('idle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [audioRecorder, showAlert]);

  const handleStopRecording = useCallback(async () => {
    try {
      if (!audioRecorder.isRecording) return;

      // Clear timers
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

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Process voice message
      const response = await processVoiceMutation.mutateAsync({
        conversationId: currentConversationId || undefined,
        audioData: audioBase64,
        audioFormat: 'm4a', // iOS default format
        language: 'en',
      });

      // Update conversation ID if this was a new conversation
      if (!currentConversationId && response.conversation.id) {
        setCurrentConversationId(response.conversation.id);
        updateConversationId(response.conversation.id);
      }

      // Check for crisis indicators
      if (response.sentiment?.crisisIndicators && response.sentiment.crisisIndicators.length > 0) {
        showAlert({
          title: 'Support Available',
          message: "I've noticed some concerning indicators. Would you like to speak with a human therapist?",
          type: 'warning',
          buttons: [
            { text: 'Continue', style: 'cancel' },
            { text: 'Talk to Human', onPress: () => onKeyboardPress?.() },
          ],
        });
      }

      // Play AI response audio
      setProgressStep(null);
      setVoiceState('speaking');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await playAudioFromBase64(response.audioData, 'mp3');
      setVoiceState('idle');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: any) {
      setProgressStep(null);
      showAlert({
        title: 'Error',
        message: error?.message || 'Failed to process voice message',
        type: 'error',
      });
      setVoiceState('idle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [currentConversationId, processVoiceMutation, onKeyboardPress, updateConversationId, audioRecorder]);

  // Keep ref updated so statusListener and duration interval can trigger stop
  useEffect(() => {
    stopRecordingRef.current = handleStopRecording;
    return () => {
      stopRecordingRef.current = null;
    };
  }, [handleStopRecording]);

  // Handle blob press for recording
  const handleBlobPress = useCallback(() => {
    if (voiceState === 'idle') {
      handleStartRecording();
    } else if (voiceState === 'listening') {
      handleStopRecording();
    }
  }, [voiceState, handleStartRecording, handleStopRecording]);

  // Get status text based on state (progressStep refines "thinking" when present)
  const getStatusText = () => {
    switch (voiceState) {
      case 'listening':
        return "I'm listening...";
      case 'thinking':
        if (progressStep) {
          const stepLabels: Record<string, string> = {
            processing: "I'm thinking...",
            transcribing: 'Transcribing...',
            thinking: 'Thinking...',
            speaking: 'Preparing response...',
          }
          return stepLabels[progressStep] ?? `${progressStep.charAt(0).toUpperCase()}${progressStep.slice(1)}...`;
        }
        return "I'm thinking...";
      case 'speaking':
        return "I'm speaking...";
      default:
        return "Tap to speak...";
    }
  };

  // Blob border-radius morphing animation
  // Note: React Native doesn't support complex border-radius strings, so we approximate with simpler values
  const blobStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(blobProgress.value, [0, 0.5, 1], [80, 50, 80]);
    const scale = interpolate(blobProgress.value, [0, 0.5, 1], [1, 1.05, 1]);
    const rotation = interpolate(blobProgress.value, [0, 0.5, 1], [0, 180, 360]);

    return {
      borderRadius,
      transform: [
        { scale },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  const listeningTextStyle = useAnimatedStyle(() => ({
    opacity: listeningOpacity.value,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: innerGlowOpacity.value,
  }));

  // Ripple styles
  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple1.value }],
    opacity: interpolate(ripple1.value, [0.8, 2.5], [1, 0]),
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple2.value }],
    opacity: interpolate(ripple2.value, [0.8, 2.5], [1, 0]),
  }));

  const ripple3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple3.value }],
    opacity: interpolate(ripple3.value, [0.8, 2.5], [1, 0]),
  }));

  // Visualizer bar styles (heights: 3px, 5px, 8px, 4px, 3px base)
  const bar1Style = useAnimatedStyle(() => ({
    height: interpolate(bar1.value, [0, 1], [12, 15]), // ~3px to 4px
  }));
  const bar2Style = useAnimatedStyle(() => ({
    height: interpolate(bar2.value, [0, 1], [20, 25]), // ~5px to 6px
  }));
  const bar3Style = useAnimatedStyle(() => ({
    height: interpolate(bar3.value, [0, 1], [32, 40]), // ~8px to 10px
  }));
  const bar4Style = useAnimatedStyle(() => ({
    height: interpolate(bar4.value, [0, 1], [16, 20]), // ~4px to 5px
  }));
  const bar5Style = useAnimatedStyle(() => ({
    height: interpolate(bar5.value, [0, 1], [12, 15]), // ~3px to 4px
  }));

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Immersive Background Layers */}
      <View style={StyleSheet.absoluteFill} className="bg-background-dark">
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.4)', // indigo-950/40
            'rgba(15, 23, 42, 0.2)', // slate-900/20
            'transparent',
          ]}
          locations={[0, 0.5, 1]}
          style={[StyleSheet.absoluteFill, { height: '80%' }]}
        />
        <View 
          style={[
            styles.backgroundBlob1,
            { backgroundColor: 'rgba(25, 179, 230, 0.1)' }
          ]} 
        />
        <View 
          style={[
            styles.backgroundBlob2,
            { backgroundColor: 'rgba(88, 28, 135, 0.2)' }
          ]} 
        />
      </View>

      {/* Header Status */}
      <View style={styles.headerContainer} className="relative z-10 pt-12 pb-4 px-6 items-center">
        <BlurView intensity={20} tint="dark" style={styles.liveSessionBadge}>
          <View style={styles.liveDotContainer}>
            <Animated.View 
              style={[
                styles.pingDot,
                pingStyle,
                { backgroundColor: '#19b3e6' }
              ]} 
            />
            <View 
              style={[
                styles.liveDot,
                { backgroundColor: '#19b3e6' }
              ]} 
            />
          </View>
          <Text style={styles.liveSessionText}>
            Live Session
          </Text>
        </BlurView>
        <Animated.Text 
          style={[styles.listeningText, listeningTextStyle]}
        >
          {getStatusText()}
        </Animated.Text>
        {voiceState === 'listening' && recordingDuration > 0 && (
          <Text style={styles.recordingDuration}>
            {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            {recordingDuration >= 55 && (
              <Text style={styles.durationWarning}> (Max 60s)</Text>
            )}
          </Text>
        )}
      </View>

      {/* Main Content: The Blob */}
      <View className="flex-1 items-center justify-center relative z-10">
        <View className="relative w-64 h-64 items-center justify-center">
          {/* Ripple Effects */}
          <View style={styles.rippleContainer}>
            <Animated.View style={[styles.ripple, ripple1Style, { borderColor: 'rgba(25, 179, 230, 0.2)' }]} />
            <Animated.View style={[styles.ripple, ripple2Style, { borderColor: 'rgba(25, 179, 230, 0.1)' }]} />
            <Animated.View style={[styles.ripple, ripple3Style, { borderColor: 'rgba(25, 179, 230, 0.05)' }]} />
          </View>

          {/* The Core Blob */}
          <TouchableOpacity
            onPress={handleBlobPress}
            activeOpacity={0.9}
            disabled={voiceState === 'thinking' || voiceState === 'speaking'}
            className="relative w-64 h-64"
          >
            {/* Inner Glow */}
            <Animated.View 
              style={[
                styles.innerGlow,
                innerGlowStyle,
                { backgroundColor: 'rgba(25, 179, 230, 0.2)' }
              ]} 
            />
            
            {/* Main Animated Shape */}
            <Animated.View style={[styles.blob, blobStyle]}>
              <LinearGradient
                colors={
                  voiceState === 'listening'
                    ? [
                        'rgba(25, 179, 230, 0.9)',
                        'rgba(76, 29, 149, 0.7)',
                        'rgba(17, 29, 33, 0.2)',
                      ]
                    : voiceState === 'thinking'
                    ? [
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(88, 28, 135, 0.6)',
                        'rgba(17, 29, 33, 0.1)',
                      ]
                    : voiceState === 'speaking'
                    ? [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(25, 179, 230, 0.6)',
                        'rgba(17, 29, 33, 0.1)',
                      ]
                    : [
                        'rgba(25, 179, 230, 0.8)',
                        'rgba(76, 29, 149, 0.6)',
                        'rgba(17, 29, 33, 0.1)',
                      ]
                }
                start={{ x: 0.3, y: 0.3 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControlsContainer}>
        <View style={styles.bottomControlsWrapper}>
          {/* Glass Control Bar */}
          <BlurView intensity={80} tint="dark" style={styles.glassPanel}>
            {/* Switch to Text */}
            <TouchableOpacity
              onPress={onKeyboardPress}
              style={styles.controlButton}
              activeOpacity={0.8}
            >
              <View style={styles.controlButtonInner}>
                <Icon name="keyboard" size={24} color="#d1d5db" />
              </View>
            </TouchableOpacity>

            {/* Visualizer Placeholder (Center) */}
            <View style={styles.visualizerContainer}>
              <Animated.View style={[styles.visualizerBar, bar1Style]} />
              <Animated.View style={[styles.visualizerBar, bar2Style]} />
              <Animated.View style={[styles.visualizerBar, bar3Style]} />
              <Animated.View style={[styles.visualizerBar, bar4Style]} />
              <Animated.View style={[styles.visualizerBar, bar5Style]} />
            </View>

            {/* End Session */}
            <TouchableOpacity
              onPress={onBack}
              style={styles.endButton}
              activeOpacity={0.8}
            >
              <View style={styles.endButtonInner}>
                <Icon name="close" size={24} color="#f87171" />
              </View>
            </TouchableOpacity>
          </BlurView>
          
          <Text style={styles.interfaceLabel}>
            Haven Voice Interface
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundBlob1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: 300,
    opacity: 0.5,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: '10%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.5,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  liveSessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  liveDotContainer: {
    position: 'relative',
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#19b3e6',
  },
  liveDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#19b3e6',
  },
  liveSessionText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: 'rgba(209, 213, 219, 1)',
    textTransform: 'uppercase',
  },
  listeningText: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  rippleContainer: {
    position: 'absolute',
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 1,
  },
  innerGlow: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    top: -32,
    left: -32,
  },
  blob: {
    width: 256,
    height: 256,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 10,
  },
  bottomControlsContainer: {
    position: 'relative',
    zIndex: 10,
    paddingBottom: 40,
    paddingHorizontal: 24,
    width: '100%',
  },
  bottomControlsWrapper: {
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  glassPanel: {
    borderRadius: 9999,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 29, 33, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  controlButton: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  controlButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  visualizerContainer: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginHorizontal: 16,
    opacity: 0.5,
    borderRadius: 9999,
  },
  visualizerBar: {
    width: 4,
    backgroundColor: '#19b3e6',
    borderRadius: 2,
    minHeight: 12,
  },
  endButton: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  endButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  interfaceLabel: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 24,
  },
  recordingDuration: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  durationWarning: {
    color: '#f87171',
    fontWeight: '600',
  },
});
