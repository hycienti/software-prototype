import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import type { Mood } from '@/services/mood';

interface MoodEntryDetailModalProps {
  visible: boolean;
  mood: Mood | null;
  onClose: () => void;
}

const getMoodColor = (mood: string): string => {
  switch (mood) {
    case 'happy':
      return '#19b3e6';
    case 'calm':
      return '#34d399';
    case 'anxious':
      return '#fbbf24';
    case 'sad':
      return '#60a5fa';
    case 'angry':
      return '#ef4444';
    default:
      return '#9ca3af';
  }
};

const getMoodIcon = (mood: string): string => {
  switch (mood) {
    case 'happy':
      return 'sentiment_satisfied';
    case 'anxious':
      return 'thunderstorm';
    case 'calm':
      return 'spa';
    case 'sad':
      return 'water_drop';
    case 'angry':
      return 'local_fire_department';
    default:
      return 'sentiment_neutral';
  }
};

const getMoodLabel = (mood: string): string => {
  switch (mood) {
    case 'happy':
      return 'Happy';
    case 'calm':
      return 'Calm';
    case 'anxious':
      return 'Anxious';
    case 'sad':
      return 'Sad';
    case 'angry':
      return 'Angry';
    default:
      return 'Unknown';
  }
};

const getIntensityColor = (intensity: number): string => {
  const colorStops = [
    '#19b3e6', // 1 - Cool blue
    '#22d3ee', // 2 - Light cyan
    '#34d399', // 3 - Teal
    '#65a30d', // 4 - Green
    '#84cc16', // 5 - Yellow-green
    '#eab308', // 6 - Yellow
    '#fbbf24', // 7 - Bright yellow
    '#fb923c', // 8 - Light orange
    '#f97316', // 9 - Orange
    '#ef4444', // 10 - Hot red
  ];
  const clamped = Math.max(1, Math.min(10, Math.round(intensity)));
  return colorStops[clamped - 1];
};

export const MoodEntryDetailModal: React.FC<MoodEntryDetailModalProps> = ({
  visible,
  mood,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetModal visible={visible} onClose={onClose} showBackdrop={true}>
      <View style={styles.container}>
      {!mood ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#19b3e6" />
          <Text style={styles.loadingText}>Loading entry...</Text>
        </View>
      ) : (() => {
        const entryDate = new Date(mood.entryDate);
        const formattedDate = entryDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const moodColor = getMoodColor(mood.mood);
        const intensityColor = getIntensityColor(mood.intensity);
        return (
        <>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.dateBadge}>
                <Icon name="calendar_month" size={16} color="#f59e0b" />
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Icon name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo if available */}
          {mood.photoUrl && (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: mood.photoUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Mood and Intensity Section */}
          <View style={styles.moodSection}>
            <View style={styles.moodHeader}>
              <View style={[styles.moodBadge, { backgroundColor: `${moodColor}20`, borderColor: `${moodColor}40` }]}>
                <Icon name={getMoodIcon(mood.mood)} size={20} color={moodColor} />
                <Text style={[styles.moodLabel, { color: moodColor }]}>{getMoodLabel(mood.mood)}</Text>
              </View>
              <View style={[styles.intensityBadge, { backgroundColor: `${intensityColor}20`, borderColor: `${intensityColor}40` }]}>
                <Text style={[styles.intensityValue, { color: intensityColor }]}>
                  {mood.intensity}/10
                </Text>
              </View>
            </View>
          </View>

          {/* Notes Section */}
          {mood.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Journal Entry</Text>
              <View style={styles.notesContent}>
                <Text style={styles.notesText}>{mood.notes}</Text>
              </View>
            </View>
          )}

          {/* Tags if available */}
          {mood.tags && mood.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags</Text>
              <View style={styles.tagsList}>
                {mood.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Metadata if available */}
          {mood.metadata && Object.keys(mood.metadata).length > 0 && (
            <View style={styles.metadataContainer}>
              <Text style={styles.metadataTitle}>Additional Info</Text>
              <View style={styles.metadataContent}>
                {Object.entries(mood.metadata).map(([key, value]) => (
                  <View key={key} style={styles.metadataItem}>
                    <Text style={styles.metadataKey}>{key}:</Text>
                    <Text style={styles.metadataValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Footer info */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Icon name="access_time" size={14} color="#6b7280" />
              <Text style={styles.footerText}>
                Created {new Date(mood.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            {mood.updatedAt && mood.updatedAt !== mood.createdAt && (
              <View style={styles.footerItem}>
                <Icon name="edit" size={14} color="#6b7280" />
                <Text style={styles.footerText}>
                  Updated {new Date(mood.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        </>
        );
      })()}
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  photoContainer: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  photo: {
    width: '100%',
    height: 200,
    backgroundColor: '#1a2c32',
  },
  moodSection: {
    marginBottom: 24,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  intensityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  intensityValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  notesContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e2e8f0',
    fontWeight: '400',
  },
  tagsContainer: {
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  metadataContainer: {
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataContent: {
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metadataKey: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    minWidth: 80,
  },
  metadataValue: {
    fontSize: 13,
    color: '#e2e8f0',
    flex: 1,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
