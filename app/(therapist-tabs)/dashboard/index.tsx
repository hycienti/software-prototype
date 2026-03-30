import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store';
import {
  useTherapistDashboard,
  useTherapistSessions,
  useTherapistCreateTestRoom,
} from '@/hooks/useTherapistApi';
import type { TherapistSessionSummary } from '@/types/therapist';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function getNextSession(sessions: TherapistSessionSummary[]): TherapistSessionSummary | null {
  const now = new Date().toISOString();
  const upcoming = sessions
    .filter((s) => s.status === 'scheduled' && s.scheduledAt >= now)
    .sort((a, b) => (a.scheduledAt > b.scheduledAt ? 1 : -1));
  return upcoming[0] ?? null;
}

/** Upcoming sessions still on today's calendar, excluding the "Next connection" card. */
function getLaterTodaySessions(
  sessions: TherapistSessionSummary[],
  next: TherapistSessionSummary | null
): TherapistSessionSummary[] {
  const nowIso = new Date().toISOString();
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const dayStart = new Date(y, m, d).toISOString();
  const dayEnd = new Date(y, m, d, 23, 59, 59, 999).toISOString();

  const upcomingToday = sessions
    .filter(
      (s) =>
        s.status === 'scheduled' &&
        s.scheduledAt >= nowIso &&
        s.scheduledAt >= dayStart &&
        s.scheduledAt <= dayEnd
    )
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? -1 : 1));

  if (!next) {
    return upcomingToday;
  }
  return upcomingToday.filter((s) => s.id !== next.id);
}

function initialsFromName(name: string | null | undefined): string {
  const t = name?.trim();
  if (!t) return '?';
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0] ?? '';
  const b = parts[parts.length - 1][0] ?? '';
  return (a + b).toUpperCase() || '?';
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { therapistProfile, clearAuth } = useAuthStore();
  const { data: stats, loading: statsLoading, error: statsError } = useTherapistDashboard();
  const { sessions, loading: sessionsLoading } = useTherapistSessions({
    page: 1,
    limit: 100,
  });
  const { createTestRoom, loading: testCallLoading } = useTherapistCreateTestRoom();

  const nextSession = getNextSession(sessions);
  const laterTodaySessions = useMemo(
    () => getLaterTodaySessions(sessions, nextSession),
    [sessions, nextSession]
  );
  const displayName = therapistProfile?.fullName?.split(' ')[0] ?? 'Therapist';

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/therapist-welcome' as any);
  };

  const startTestVideoSession = async () => {
    try {
      const result = await createTestRoom();
      if (result?.meetingId) {
        router.push({
          pathname: '/session/video-call' as any,
          params: { meetingId: result.meetingId, token: result.token },
        });
      }
    } catch (e) {
      console.error('Test room error:', e);
    }
  };

  return (
    <View className="flex-1 bg-[#111d21]">
      {/* Header */}
      <View
        className="bg-[#0a1a1f] border-b border-white/5"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={handleLogout}
              className="w-11 h-11 rounded-full bg-white/10 items-center justify-center"
            >
              <MaterialIcons name="person" size={22} color="#19b3e6" />
            </Pressable>
            <View>
              <Text className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Healing Workspace
              </Text>
              <Text className="text-lg font-bold leading-tight tracking-tight text-white mt-0.5">
                {displayName}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/notifications' as any)}
            className="p-2.5 rounded-full bg-white/5 border border-white/10"
          >
            <MaterialIcons name="notifications" size={20} color="#7a8a8e" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View className="pt-6 pb-2 px-1">
          <Text className="text-2xl font-extrabold tracking-tight text-white">
            Good Morning, {displayName}
          </Text>
          <Text className="text-white/50 text-sm font-medium mt-1">
            Your sanctuary for today is prepared.
          </Text>
        </View>

        {(statsLoading || sessionsLoading) && !stats && !sessions.length ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#19b3e6" />
            <Text className="text-white/50 mt-2">Loading...</Text>
          </View>
        ) : (
          <>
            {statsError ? (
              <View className="py-4 px-4 rounded-2xl bg-red-900/30 border border-red-500/20">
                <Text className="text-red-400 text-sm">{statsError}</Text>
              </View>
            ) : null}

            {/* Stats Grid */}
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/5">
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  Sessions Today
                </Text>
                <Text className="text-white text-3xl font-extrabold mt-1">
                  {stats?.sessionsToday ?? 0}
                </Text>
              </View>
              <View className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/5">
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  New Requests
                </Text>
                <Text className="text-white text-3xl font-extrabold mt-1">
                  {stats?.newRequests ?? 0}
                </Text>
                {stats && (stats.newRequests ?? 0) > 0 && (
                  <Text className="text-[#19b3e6] text-[10px] font-bold mt-1">Action Required</Text>
                )}
              </View>
            </View>

            {/* Monthly Revenue */}
            <View className="mt-4 bg-white/5 rounded-3xl p-6 border border-white/5">
              <View className="flex-row justify-between items-center">
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  Monthly Revenue
                </Text>
              </View>
              <Text className="text-3xl font-extrabold mt-2 text-white">
                ${stats?.monthlyRevenue ?? '0.00'}
              </Text>
            </View>
          </>
        )}

        {/* Next Connection */}
        <View className="pt-8 pb-4 flex-row items-center justify-between px-1">
          <Text className="text-lg font-bold tracking-tight text-white">Next Connection</Text>
          <Pressable onPress={() => router.push('/(therapist-tabs)/schedule' as any)}>
            <Text className="text-[#19b3e6] text-xs font-bold uppercase tracking-wider">
              Schedule
            </Text>
          </Pressable>
        </View>

        {/* Next Session Card */}
        <View className="relative mb-6">
          {nextSession ? (
            <View className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/8 p-6">
              <View className="absolute top-4 right-4 z-10">
                <View className="bg-[#19b3e6]/10 px-3 py-1 rounded-full border border-[#19b3e6]/20">
                  <Text className="text-[#19b3e6] text-[10px] font-bold">UPCOMING</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4 mb-6 mt-1">
                <View className="w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
                  <MaterialIcons name="person" size={28} color="#19b3e6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-white">
                    {nextSession.user?.fullName ?? 'Client'}
                  </Text>
                  <Text className="text-white/50 text-sm font-medium mt-0.5">
                    Individual Therapy
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-1.5">
                    <MaterialIcons name="schedule" size={18} color="#19b3e6" />
                    <Text className="text-[#19b3e6]/70 text-xs font-bold">
                      {formatTime(nextSession.scheduledAt)} - {nextSession.durationMinutes} min
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/session/video-call' as any,
                    params: { sessionId: String(nextSession.id) },
                  })
                }
                className="w-full bg-[#19b3e6] py-4 rounded-full flex-row items-center justify-center gap-3"
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <MaterialIcons name="videocam" size={20} color="white" />
                <Text className="text-white font-bold">Join Video Call</Text>
              </Pressable>

              <Pressable
                onPress={startTestVideoSession}
                disabled={testCallLoading}
                className="w-full mt-3 py-3 rounded-full flex-row items-center justify-center gap-2 border border-white/10 bg-white/5"
                style={({ pressed }) => ({
                  opacity: pressed || testCallLoading ? 0.7 : 1,
                })}
              >
                {testCallLoading ? (
                  <ActivityIndicator size="small" color="#7a8a8e" />
                ) : (
                  <MaterialIcons name="science" size={18} color="#7a8a8e" />
                )}
                <Text className="text-white/60 font-semibold text-sm">
                  {testCallLoading ? 'Creating room...' : 'Test video call (new room)'}
                </Text>
              </Pressable>

              <View className="mt-6 pt-5 border-t border-white/10 flex-row justify-between">
                <Pressable className="flex-row items-center gap-2">
                  <MaterialIcons name="notes" size={18} color="#7a8a8e" />
                  <Text className="text-[11px] font-bold text-white/40 uppercase tracking-wide">
                    Client Notes
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(therapist-tabs)/messages/client/[userId]' as any,
                      params: { userId: String(nextSession.userId) },
                    })
                  }
                  className="flex-row items-center gap-2"
                >
                  <MaterialIcons name="chat-bubble" size={18} color="#7a8a8e" />
                  <Text className="text-[11px] font-bold text-white/40 uppercase tracking-wide">
                    Message
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="rounded-[2rem] overflow-hidden p-6 bg-white/5 border border-white/8">
              <Text className="text-white/50 text-center mb-4">
                No upcoming sessions. Check your schedule.
              </Text>
              <Pressable
                onPress={startTestVideoSession}
                disabled={testCallLoading}
                className="w-full py-3 rounded-full flex-row items-center justify-center gap-2 border border-white/10 bg-white/5"
                style={({ pressed }) => ({ opacity: pressed || testCallLoading ? 0.7 : 1 })}
              >
                {testCallLoading ? (
                  <ActivityIndicator size="small" color="#7a8a8e" />
                ) : (
                  <MaterialIcons name="science" size={18} color="#7a8a8e" />
                )}
                <Text className="text-white/60 font-semibold text-sm">
                  {testCallLoading ? 'Creating room...' : 'Test video call (new room)'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Later Today */}
        <View className="pt-8 pb-4 px-1">
          <Text className="text-lg font-bold tracking-tight text-white">Later Today</Text>
        </View>

        <View className="gap-3 mb-6">
          {laterTodaySessions.length === 0 ? (
            <View className="rounded-[30px] overflow-hidden bg-white/5 border border-white/8 p-5">
              <Text className="text-white/45 text-center text-sm">
                No other sessions on your schedule for today.
              </Text>
            </View>
          ) : (
            laterTodaySessions.map((s) => {
              const clientName = s.user?.fullName ?? 'Client';
              return (
                <Pressable
                  key={s.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(therapist-tabs)/messages/client/[userId]' as any,
                      params: { userId: String(s.userId) },
                    })
                  }
                  className="rounded-[30px] overflow-hidden bg-white/5 border border-white/8 p-4 flex-row items-center justify-between active:opacity-90"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-[#19b3e6]/10 border border-[#19b3e6]/20 items-center justify-center">
                      <Text className="text-[#19b3e6] font-bold text-xs">
                        {initialsFromName(clientName)}
                      </Text>
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="font-bold text-white" numberOfLines={1}>
                        {clientName}
                      </Text>
                      <Text className="text-[11px] font-medium text-white/40 mt-0.5">
                        {formatTime(s.scheduledAt)} · {s.durationMinutes} min
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#7a8a8e" />
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
