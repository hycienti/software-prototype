import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { sessionsService } from '@/services/sessions';
import { formatTherapistDisplayName } from '@/utils/user';
import type { Session } from '@/types/api';

type Tab = 'active' | 'past';

interface MyTherapistsScreenProps {
  onBack: () => void;
  onMessage: (therapistId: number) => void;
  onVideoCall: (sessionId: number) => void;
  onBookAgain: (therapistId: string) => void;
  onViewNotesSummary: (sessionId: number) => void;
}

/** Group completed sessions by therapist; each group has therapist info, last session, total count */
function groupPastSessionsByTherapist(sessions: Session[]) {
  const completed = sessions
    .filter((s) => s.status === 'COMPLETED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  const byTherapist = new Map<
    number,
    { therapist: NonNullable<Session['therapist']>; lastSession: Session; total: number }
  >();
  for (const s of completed) {
    const existing = byTherapist.get(s.therapistId);
    if (!existing) {
      byTherapist.set(s.therapistId, {
        therapist: s.therapist ?? { id: s.therapistId, fullName: null, professionalTitle: null },
        lastSession: s,
        total: 1,
      });
    } else {
      existing.total += 1;
    }
  }
  return Array.from(byTherapist.values());
}

function matchesSearch(name: string | null, query: string): boolean {
  if (!query.trim()) return true;
  return (name ?? '').toLowerCase().includes(query.trim().toLowerCase());
}

export function MyTherapistsScreen({
  onBack,
  onMessage,
  onVideoCall,
  onBookAgain,
  onViewNotesSummary,
}: MyTherapistsScreenProps) {
  const [tab, setTab] = useState<Tab>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['sessions', 'list'],
    queryFn: () => sessionsService.list({ limit: 100 }),
  });

  const activeSessions = useMemo(() => {
    const scheduled = (data?.sessions ?? []).filter((s) => s.status === 'SCHEDULED');
    if (!searchQuery.trim()) return scheduled;
    return scheduled.filter((s) => matchesSearch(s.therapist?.fullName ?? null, searchQuery));
  }, [data, searchQuery]);

  const pastGroups = useMemo(() => {
    const groups = groupPastSessionsByTherapist(data?.sessions ?? []);
    if (!searchQuery.trim()) return groups;
    return groups.filter((g) => matchesSearch(g.therapist?.fullName ?? null, searchQuery));
  }, [data, searchQuery]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Therapists</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Icon name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by therapist name..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.tabActive]}
          onPress={() => setTab('past')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>Past</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#19b3e6" />
          }
        >
          {tab === 'active' && (
            <>
              {activeSessions.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No upcoming sessions</Text>
                  <Text style={styles.emptySubtext}>Your active therapists will appear here</Text>
                </View>
              ) : (
                activeSessions.map((session) => (
                  <View key={session.id} style={styles.card}>
                    <Text style={styles.cardName}>
                      {formatTherapistDisplayName(session.therapist?.fullName) || `Therapist #${session.therapistId}`}
                    </Text>
                    {session.therapist?.professionalTitle ? (
                      <Text style={styles.cardTitle}>{session.therapist.professionalTitle}</Text>
                    ) : null}
                    <Text style={styles.cardDate}>Next session: {formatDate(session.scheduledAt)}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.cardButtonSecondary}
                        onPress={() => onMessage(session.therapistId)}
                        activeOpacity={0.8}
                      >
                        <Icon name="message" size={18} color="#19b3e6" />
                        <Text style={styles.cardButtonSecondaryText}>Message</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardButtonPrimary}
                        onPress={() => onVideoCall(session.id)}
                        activeOpacity={0.8}
                      >
                        <Icon name="videocam" size={18} color="#fff" />
                        <Text style={styles.cardButtonPrimaryText}>Join session</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {tab === 'past' && (
            <>
              {pastGroups.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No past sessions</Text>
                  <Text style={styles.emptySubtext}>Completed sessions will appear here</Text>
                </View>
              ) : (
                pastGroups.map(({ therapist, lastSession, total }) => (
                  <View key={therapist.id} style={styles.card}>
                    <Text style={styles.cardName}>{formatTherapistDisplayName(therapist.fullName) || `Therapist #${therapist.id}`}</Text>
                    {therapist.professionalTitle ? (
                      <Text style={styles.cardTitle}>{therapist.professionalTitle}</Text>
                    ) : null}
                    <Text style={styles.cardDate}>
                      Last session: {formatDate(lastSession.scheduledAt)} · {total} session{total !== 1 ? 's' : ''} total
                    </Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.cardButtonSecondary}
                        onPress={() => onBookAgain(String(therapist.id))}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cardButtonSecondaryText}>Book Again</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardButtonPrimary}
                        onPress={() => onViewNotesSummary(lastSession.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cardButtonPrimaryText}>View Notes Summary</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
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
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(26, 44, 50, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 0,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
  },
  tabActive: {
    backgroundColor: 'rgba(25, 179, 230, 0.25)',
  },
  tabText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#19b3e6',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 17,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  cardName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 13,
    color: '#d1d5db',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cardButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(25, 179, 230, 0.15)',
  },
  cardButtonSecondaryText: {
    fontSize: 14,
    color: '#19b3e6',
    fontWeight: '500',
  },
  cardButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#19b3e6',
  },
  cardButtonPrimaryText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
