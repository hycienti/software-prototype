import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { therapistsService } from '@/services/therapists';

const DURATION_MINUTES = 50;
const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

function getNextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(d: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function BookSlotPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const therapistId = id ? Number(id) : 0;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: therapistData } = useQuery({
    queryKey: ['therapist', therapistId],
    queryFn: () => therapistsService.getById(therapistId),
    enabled: therapistId > 0,
  });

  const days = useMemo(() => getNextDays(14), []);

  const handleContinueToPayment = () => {
    if (!selectedDate || !selectedTime || !therapistId) return;
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduled = new Date(selectedDate);
    scheduled.setHours(hours, minutes, 0, 0);
    const scheduledAt = scheduled.toISOString();
    router.push({
      pathname: '/payment',
      params: {
        therapistId: String(therapistId),
        scheduledAt,
        durationMinutes: String(DURATION_MINUTES),
      },
    });
  };

  const therapistName = therapistData?.therapist?.fullName ?? `Therapist #${therapistId}`;
  const canContinue = selectedDate && selectedTime;

  if (!therapistId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select date & time</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.therapistName}>{therapistName}</Text>
        <Text style={styles.sectionLabel}>Date</Text>
        <View style={styles.daysRow}>
          {days.map((d) => {
            const key = toISODate(d);
            const isSelected = selectedDate?.toDateString() === d.toDateString();
            return (
              <TouchableOpacity
                key={key}
                style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                onPress={() => setSelectedDate(d)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                  {formatDateLabel(d)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Time</Text>
        <View style={styles.timesRow}>
          {TIME_SLOTS.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                onPress={() => setSelectedTime(time)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Session duration: {DURATION_MINUTES} minutes. Availability is confirmed at checkout.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={handleContinueToPayment}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue to payment</Text>
          <Icon name="arrow_forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1a2c32',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  dayChipSelected: {
    borderColor: '#19b3e6',
    backgroundColor: 'rgba(25, 179, 230, 0.15)',
  },
  dayChipText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  dayChipTextSelected: {
    color: '#19b3e6',
    fontWeight: '600',
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1a2c32',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  timeChipSelected: {
    borderColor: '#19b3e6',
    backgroundColor: 'rgba(25, 179, 230, 0.15)',
  },
  timeChipText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  timeChipTextSelected: {
    color: '#19b3e6',
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#111d21',
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.5)',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#19b3e6',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
