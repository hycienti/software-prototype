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

function getDateRangeFromToday(days: number): { from: string; to: string } {
  const today = new Date();
  const from = new Date(today);
  from.setHours(0, 0, 0, 0);
  const to = new Date(today);
  to.setDate(to.getDate() + days - 1);
  to.setHours(23, 59, 59, 999);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return { from: toISODate(from), to: toISODate(to) };
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00.000Z');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function BookSlotPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const therapistId = id ? Number(id) : 0;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { from, to } = useMemo(() => getDateRangeFromToday(14), []);

  const { data: therapistData } = useQuery({
    queryKey: ['therapist', therapistId],
    queryFn: () => therapistsService.getById(therapistId),
    enabled: therapistId > 0,
  });

  const { data: bookableData, isLoading: bookableLoading } = useQuery({
    queryKey: ['therapist-bookable-slots', therapistId, from, to],
    queryFn: () => therapistsService.getBookableSlots(therapistId, { from, to }),
    enabled: therapistId > 0,
  });

  const datesWithSlots = bookableData?.dates ?? [];
  const selectedDateEntry = selectedDate
    ? datesWithSlots.find((e) => e.date === selectedDate)
    : null;
  const timeSlotsForSelectedDate = selectedDateEntry?.timeSlots ?? [];

  const handleContinueToPayment = () => {
    if (!selectedDate || !selectedTime || !therapistId) return;
    const scheduledAt = `${selectedDate}T${selectedTime}:00.000Z`;
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
        {bookableLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#19b3e6" />
            <Text style={styles.loadingText}>Loading available dates…</Text>
          </View>
        ) : (
          <View style={styles.daysRow}>
            {datesWithSlots.map((entry) => {
              const isSelected = selectedDate === entry.date;
              return (
                <TouchableOpacity
                  key={entry.date}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                  onPress={() => {
                    setSelectedDate(entry.date);
                    setSelectedTime(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                    {formatDateLabel(entry.date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {datesWithSlots.length === 0 && !bookableLoading && (
          <Text style={styles.hint}>No available dates in the next 14 days.</Text>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Time</Text>
        {selectedDate ? (
          <View style={styles.timesRow}>
            {timeSlotsForSelectedDate.map((time) => {
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
        ) : (
          <Text style={styles.hint}>Select a date to see available times.</Text>
        )}

        <Text style={styles.hint}>
          Session duration: {DURATION_MINUTES} minutes. Only available slots are shown.
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
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
    borderRadius: 50,
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
