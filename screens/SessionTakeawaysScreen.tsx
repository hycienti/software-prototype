import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { sessionsService } from '@/services/sessions';
import type { UserTakeaways } from '@/types/api';

interface SessionTakeawaysScreenProps {
  sessionId: number;
  onBackToHistory: () => void;
  onAddToJournal: () => void;
  onBack: () => void;
}

export function SessionTakeawaysScreen({
  sessionId,
  onBackToHistory,
  onAddToJournal,
  onBack,
}: SessionTakeawaysScreenProps) {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsService.getById(sessionId),
  });

  const takeaways: UserTakeaways | null = data?.session?.userTakeaways ?? null;
  const hasAnyTakeaways =
    takeaways &&
    ((takeaways.mainTopics?.length ?? 0) > 0 ||
      (takeaways.actionItems?.length ?? 0) > 0 ||
      (takeaways.keyReflection?.trim()?.length ?? 0) > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Takeaways</Text>
        <View style={styles.headerButton} />
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
          {!hasAnyTakeaways ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No takeaways for this session yet</Text>
              <Text style={styles.emptySubtext}>
                Your therapist may add a summary after the session.
              </Text>
            </View>
          ) : (
            <>
              {takeaways!.mainTopics && takeaways!.mainTopics.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Main topics</Text>
                  {takeaways!.mainTopics.map((topic, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              )}
              {takeaways!.actionItems && takeaways!.actionItems.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Action items</Text>
                  {takeaways!.actionItems.map((item, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
              {takeaways!.keyReflection?.trim() && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Key reflection</Text>
                  <Text style={styles.reflectionText}>{takeaways!.keyReflection}</Text>
                </View>
              )}
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={onAddToJournal} activeOpacity={0.8}>
              <Icon name="book_2" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Add to Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onBackToHistory} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>Back to History</Text>
            </TouchableOpacity>
          </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#19b3e6',
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    color: '#9ca3af',
    marginRight: 8,
    fontSize: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#e5e7eb',
  },
  reflectionText: {
    fontSize: 15,
    color: '#e5e7eb',
    lineHeight: 22,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#19b3e6',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
  },
});
