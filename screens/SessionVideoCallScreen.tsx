import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  RTCView,
  MediaStream,
  register,
} from '@videosdk.live/react-native-sdk';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { sessionsService } from '@/services/sessions';
import { useAuthStore } from '@/store';
import type { Session } from '@/types/api';

// Register VideoSDK once (required for native modules)
let registered = false;
function ensureRegistered() {
  if (!registered) {
    try {
      register();
      registered = true;
    } catch {
      // may fail in Expo Go; use dev build for full VideoSDK
    }
  }
}

const FROSTED_STYLE = {
  backgroundColor: 'rgba(20, 30, 35, 0.65)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  overflow: 'hidden' as const,
};

/**
 * Renders one participant's video using RTCView.
 * Remote: consume webcam so we receive their track; local: mirror.
 */
function ParticipantView({
  participantId,
  style,
  objectFit = 'cover',
  mirror = false,
  zOrder = 0,
}: {
  participantId: string;
  style: object;
  objectFit?: 'contain' | 'cover';
  mirror?: boolean;
  zOrder?: number;
}) {
  const { webcamStream, webcamOn, isLocal, consumeWebcamStreams } = useParticipant(participantId);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (isLocal || consumedRef.current) return;
    consumeWebcamStreams?.();
    consumedRef.current = true;
  }, [isLocal, consumeWebcamStreams]);

  if (webcamOn && webcamStream) {
    return (
      <RTCView
        streamURL={new MediaStream([webcamStream.track]).toURL()}
        objectFit={objectFit}
        style={style}
        mirror={mirror}
        zOrder={zOrder}
      />
    );
  }

  return (
    <View style={[style, styles.placeholderVideo]}>
      <Icon name="person" size={48} color="#9ca3af" />
    </View>
  );
}

function formatTimeDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} Min ${s} Sec`;
}

interface InCallUIProps {
  sessionId: number;
  session: Session | undefined;
  onEndCall: () => void;
}

function InCallUI({ sessionId, session, onEndCall }: InCallUIProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    participants,
    localParticipant,
  } = useMeeting({
    onMeetingJoined: () => {
      intervalRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    },
    onMeetingLeft: () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onEndCall();
    },
    onError: (err) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      Alert.alert('Call error', err?.message ?? 'Something went wrong');
      onEndCall();
    },
  });

  const localId = localParticipant?.id;
  const participantsList = Array.from(participants?.entries() ?? []).filter(
    ([id]) => id !== localId
  );
  const firstRemoteId = participantsList[0]?.[0];

  useEffect(() => {
    join();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const handleLeave = useCallback(() => {
    try {
      if (typeof leave === 'function') leave();
    } catch {
      // SDK may have already torn down
    }
    onEndCall();
  }, [leave, onEndCall]);

  const handleEndCall = useCallback(() => {
    Alert.alert('End call', 'Are you sure you want to end this call?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: handleLeave },
    ]);
  }, [handleLeave]);

  const handleMessage = useCallback(() => {
    if (!session?.therapistId) return;
    router.push({
      pathname: '/therapist/[id]/message',
      params: { id: String(session.therapistId), sessionId: String(sessionId) },
    });
  }, [router, session?.therapistId, sessionId]);

  const therapistName = session?.therapist?.fullName ?? 'Your therapist';
  const therapistTitle = session?.therapist?.professionalTitle ?? 'Therapist';

  return (
    <View style={[styles.inCallRoot, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32, paddingHorizontal: 16 }]}>
      {/* Full-screen: remote (therapist) or placeholder */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {firstRemoteId ? (
          <ParticipantView
            participantId={firstRemoteId}
            style={StyleSheet.absoluteFill}
            objectFit="cover"
            mirror={false}
            zOrder={0}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.placeholderVideo]} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.4)']}
          style={StyleSheet.absoluteFill}
          locations={[0, 0.5, 1]}
        />
      </View>

      {/* Header: SECURE CALL pill (left) + timer (right) */}
      <View style={styles.header}>
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 120} tint="dark" style={[styles.securePill, styles.shadowLg]}>
          <Animated.View style={[styles.greenDot, { opacity: pulseAnim }]} />
          <View>
            <Text style={styles.secureLabel}>SECURE CALL</Text>
            <Text style={styles.safeSpaceSubtitle}>Safe Space</Text>
          </View>
        </BlurView>
        <View style={[styles.timerPill, FROSTED_STYLE]}>
          <Text style={styles.timerText}>{formatTimeDuration(elapsed)}</Text>
        </View>
      </View>

      {/* PiP: local user (top-right) */}
      <View style={[styles.pip, styles.shadow2xl]}>
        {localId ? (
          <ParticipantView
            participantId={localId}
            style={styles.pipVideo}
            objectFit="cover"
            mirror
            zOrder={1}
          />
        ) : (
          <View style={[styles.pipVideo, styles.placeholderVideo]}>
            <Icon name="person" size={40} color="#9ca3af" />
          </View>
        )}
        <View style={styles.pipLabel}>
          <View style={styles.pipGreenDot} />
          <Text style={styles.pipLabelText}>You</Text>
        </View>
      </View>

      {/* Footer: therapist name/title, control bar, Message / Layout */}
      <View style={styles.footer}>
        <View style={styles.therapistInfo}>
          <Text style={styles.therapistName}>{therapistName}</Text>
          <Text style={styles.therapistTitle}>{therapistTitle}</Text>
        </View>

        <BlurView intensity={Platform.OS === 'ios' ? 80 : 120} tint="dark" style={[styles.controlsPill, styles.shadow2xl]}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => {
              toggleMic();
              setMicOn((p) => !p);
            }}
            activeOpacity={0.8}
          >
            <Icon name={micOn ? 'mic' : 'mic_off'} size={24} color="#e5e7eb" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => toggleWebcam()} activeOpacity={0.8}>
            <Icon name="videocam" size={24} color="#e5e7eb" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => {}} activeOpacity={0.8}>
            <Icon name="flip_camera_ios" size={24} color="#e5e7eb" />
          </TouchableOpacity>
          <View style={styles.controlsDivider} />
          <TouchableOpacity style={[styles.controlBtn, styles.endBtn]} onPress={handleEndCall} activeOpacity={0.8}>
            <Icon name="call_end" size={24} color="#ffffff" />
          </TouchableOpacity>
        </BlurView>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleMessage} activeOpacity={0.8}>
            <Icon name="chat_bubble" size={20} color="#19b3e6" />
            <Text style={[styles.quickActionText, styles.quickActionPrimary]}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => {}} activeOpacity={0.8}>
            <Icon name="dashboard" size={20} color="#9ca3af" />
            <Text style={styles.quickActionText}>Layout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface SessionVideoCallScreenProps {
  sessionId: number;
  onEndCall: () => void;
  onBack: () => void;
}

export function SessionVideoCallScreen({ sessionId, onEndCall, onBack }: SessionVideoCallScreenProps) {
  const [joined, setJoined] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsService.getById(sessionId),
  });

  const joinRoomQuery = useQuery({
    queryKey: ['session-join-room', sessionId],
    queryFn: () => sessionsService.getJoinRoom(sessionId),
    enabled: false,
  });

  const { user } = useAuthStore();
  const userDisplayName = user?.fullName ?? 'User';

  useEffect(() => {
    ensureRegistered();
  }, []);

  const handleJoin = async () => {
    try {
      const result = await joinRoomQuery.refetch();
      if (result.data) {
        setMeetingId(result.data.meetingId);
        setToken(result.data.token);
        setJoined(true);
      }
    } catch {
      Alert.alert(
        'Cannot join',
        'Video room may not be ready yet. The therapist will create it when they start the session.'
      );
    }
  };

  const session = sessionQuery.data?.session;
  const therapistName = session?.therapist?.fullName ?? 'Your therapist';
  const isLoading = sessionQuery.isLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!joined) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerPreJoin}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="arrow_back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Video call</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.preJoin}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={64} color="#4b5563" />
          </View>
          <Text style={styles.therapistNamePreJoin}>{therapistName}</Text>
          <Text style={styles.preJoinHint}>
            {joinRoomQuery.isFetching
              ? 'Joining…'
              : 'When the therapist has started the session, tap below to join.'}
          </Text>
          <TouchableOpacity
            style={[styles.joinButton, joinRoomQuery.isFetching && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={joinRoomQuery.isFetching}
            activeOpacity={0.8}
          >
            {joinRoomQuery.isFetching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="videocam" size={24} color="#ffffff" />
                <Text style={styles.joinButtonText}>Join video call</Text>
              </>
            )}
          </TouchableOpacity>
          {joinRoomQuery.isError && (
            <Text style={styles.errorText}>
              Room not ready yet. Ask your therapist to start the session.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!meetingId || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.placeholderText}>Missing meeting credentials.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: userDisplayName,
        mode: 'SEND_AND_RECV',
      }}
      token={token}
    >
      <InCallUI sessionId={sessionId} session={session} onEndCall={onEndCall} />
    </MeetingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  headerPreJoin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 41, 55, 0.5)',
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  preJoin: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  therapistNamePreJoin: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  preJoinHint: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#19b3e6',
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#f87171',
    textAlign: 'center',
  },
  inCallRoot: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    gap: 10,
    ...FROSTED_STYLE,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  secureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  safeSpaceSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  timerPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    fontVariant: ['tabular-nums'],
  },
  pip: {
    position: 'absolute',
    top: 72,
    right: 16,
    width: 112,
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  shadowLg: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  shadow2xl: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24 },
      android: { elevation: 16 },
    }),
  },
  pipVideo: {
    width: '100%',
    height: '100%',
  },
  placeholderVideo: {
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pipGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  pipLabelText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 20,
    gap: 12,
  },
  therapistInfo: {
    marginBottom: 4,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  therapistTitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  controlsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9999,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtn: {
    backgroundColor: '#ef4444',
  },
  controlsDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 8,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  quickActionPrimary: {
    color: '#19b3e6',
  },
});
