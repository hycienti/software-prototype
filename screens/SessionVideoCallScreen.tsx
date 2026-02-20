import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { sessionsService } from '@/services/sessions';

interface SessionVideoCallScreenProps {
  sessionId: number;
  onEndCall: () => void;
  onBack: () => void;
}

export function SessionVideoCallScreen({ sessionId, onEndCall, onBack }: SessionVideoCallScreenProps) {
  const [joined, setJoined] = useState(false);
  const [callStartTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionQuery = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsService.getById(sessionId),
  });

  const joinRoomQuery = useQuery({
    queryKey: ['session-join-room', sessionId],
    queryFn: () => sessionsService.getJoinRoom(sessionId),
    enabled: false,
  });

  const handleJoin = async () => {
    try {
      const result = await joinRoomQuery.refetch()
      if (result.data) {
        setJoined(true)
      }
    } catch {
      Alert.alert(
        'Cannot join',
        'Video room may not be ready yet. The therapist will create it when they start the session.'
      )
    }
  }

  useEffect(() => {
    if (joined) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - callStartTime) / 1000))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [joined, callStartTime])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const session = sessionQuery.data?.session
  const therapistName = session?.therapist?.fullName ?? 'Your therapist'
  const isLoading = sessionQuery.isLoading

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      </SafeAreaView>
    )
  }

  if (!joined) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
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
          <Text style={styles.therapistName}>{therapistName}</Text>
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
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inCall}>
        <View style={styles.videoPlaceholder}>
          <Icon name="videocam" size={80} color="#374151" />
          <Text style={styles.videoPlaceholderText}>Video call in progress</Text>
          <Text style={styles.videoPlaceholderSubtext}>{therapistName}</Text>
        </View>
        <View style={styles.timerBar}>
          <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
            <Icon name="mic" size={28} color="#e5e7eb" />
            <Text style={styles.controlLabel}>Mute</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
            <Icon name="videocam" size={28} color="#e5e7eb" />
            <Text style={styles.controlLabel}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.endButton]}
            onPress={onEndCall}
            activeOpacity={0.8}
          >
            <Icon name="call_end" size={28} color="#ffffff" />
            <Text style={[styles.controlLabel, styles.endButtonLabel]}>End</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
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
  header: {
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
  therapistName: {
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
  inCall: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
  },
  videoPlaceholderText: {
    fontSize: 18,
    color: '#9ca3af',
    marginTop: 12,
  },
  videoPlaceholderSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  timerBar: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.5)',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  endButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButtonLabel: {
    color: '#ffffff',
  },
})
