import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { formatTherapistDisplayName } from '@/utils/user';
import type { Session } from '@/types/api';

interface MyTherapistSessionCardProps {
  session: Session;
  formatDate: (iso: string) => string;
  formatTime?: (iso: string) => string;
  onMessage: (therapistId: number) => void;
  onJoinSession: (sessionId: number) => void;
}

export function MyTherapistSessionCard({
  session,
  formatDate,
  formatTime,
  onMessage,
  onJoinSession,
}: MyTherapistSessionCardProps) {
  const therapist = session.therapist;
  const name = formatTherapistDisplayName(therapist?.fullName) || `Therapist #${session.therapistId}`;
  const title = therapist?.professionalTitle ?? null;
  const avatarUri = therapist?.profilePhotoUrl ?? undefined;
  const dateStr = formatDate(session.scheduledAt);
  const timeStr = formatTime
    ? formatTime(session.scheduledAt)
    : new Date(session.scheduledAt).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
  const detailLine = `Next session: ${dateStr} at ${timeStr} · ${session.durationMinutes} min`;

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={28} color="#6b7280" />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.sessionDetail}>{detailLine}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => onMessage(session.therapistId)}
              activeOpacity={0.8}
            >
              <Icon name="message" size={18} color="#19b3e6" />
              <Text style={styles.buttonSecondaryText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => onJoinSession(session.id)}
              activeOpacity={0.8}
            >
              <Icon name="videocam" size={18} color="#fff" />
              <Text style={styles.buttonPrimaryText}>Join session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a2c32',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarContainer: {
    flexShrink: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#243e47',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#93bac8',
    marginTop: 2,
  },
  sessionDetail: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 6,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(25, 179, 230, 0.15)',
  },
  buttonSecondaryText: {
    fontSize: 14,
    color: '#19b3e6',
    fontWeight: '500',
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    backgroundColor: '#19b3e6',
  },
  buttonPrimaryText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
