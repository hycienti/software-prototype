import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { paymentsService } from '@/services/payments';
import type { PaymentRecord } from '@/types/api';

interface PaymentHistoryScreenProps {
  onBack: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PaymentHistoryScreen({ onBack }: PaymentHistoryScreenProps) {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['payments', 'list'],
    queryFn: () => paymentsService.list({ page: 1, limit: 50 }),
  });

  const payments = data?.payments ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
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
          {payments.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="receipt_long" size={48} color="#4b5563" />
              <Text style={styles.emptyText}>No payments yet</Text>
              <Text style={styles.emptySubtext}>Your consultation payments will appear here</Text>
            </View>
          ) : (
            payments.map((p: PaymentRecord) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardAmount}>{formatAmount(p.amountCents)}</Text>
                  <View style={[styles.statusBadge, p.status === 'completed' && styles.statusCompleted]}>
                    <Text style={styles.statusText}>{p.status}</Text>
                  </View>
                </View>
                <Text style={styles.cardDate}>{formatDate(p.createdAt)}</Text>
                {p.therapist && (
                  <Text style={styles.cardTherapist}>
                    {p.therapist.fullName ?? `Therapist #${p.therapistId}`}
                    {p.therapist.professionalTitle ? ` · ${p.therapist.professionalTitle}` : ''}
                  </Text>
                )}
              </View>
            ))
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 17,
    color: '#e5e7eb',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1a2c32',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  cardDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  cardTherapist: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
});
