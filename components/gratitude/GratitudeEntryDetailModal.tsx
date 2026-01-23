import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import type { Gratitude } from '@/services/gratitude';

interface GratitudeEntryDetailModalProps {
  visible: boolean;
  gratitude: Gratitude | null;
  onClose: () => void;
}

export const GratitudeEntryDetailModal: React.FC<GratitudeEntryDetailModalProps> = ({
  visible,
  gratitude,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  if (!gratitude) return null;

  const entryDate = new Date(gratitude.entryDate);
  const formattedDate = entryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <BottomSheetModal visible={visible} onClose={onClose} showBackdrop={true}>
      <View style={styles.container}>
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
          {gratitude.photoUrl && (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: gratitude.photoUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Entries */}
          <View style={styles.entriesContainer}>
            <Text style={styles.entriesTitle}>What I'm Grateful For</Text>
            {gratitude.entries.map((entry, index) => (
              <View key={index} style={styles.entryItem}>
                <View style={styles.entryNumber}>
                  <Text style={styles.entryNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.entryContent}>
                  <Text style={styles.entryText}>{entry}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Metadata tags if available */}
          {gratitude.metadata && Object.keys(gratitude.metadata).length > 0 && (
            <View style={styles.metadataContainer}>
              <Text style={styles.metadataTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {Object.entries(gratitude.metadata).map(([key, value]) => (
                  <View key={key} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {key}: {String(value)}
                    </Text>
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
                Created {new Date(gratitude.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
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
  entriesContainer: {
    marginBottom: 24,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  entryItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  entryNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(25, 179, 230, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  entryNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#19b3e6',
  },
  entryContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  entryText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e2e8f0',
    fontWeight: '400',
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
  tagsContainer: {
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
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
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
