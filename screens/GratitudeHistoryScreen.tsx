import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';

interface GratitudeHistoryScreenProps {
  onBack?: () => void;
  onEntryPress?: (entryId: string) => void;
}

interface GratitudeEntry {
  id: string;
  date: string;
  day: number;
  month: string;
  title: string;
  icon: string;
  iconColor: string;
  description: string;
  tag?: {
    label: string;
    color: string;
  };
}

const gratitudeEntries: GratitudeEntry[] = [
  {
    id: '1',
    date: '2023-10-24',
    day: 24,
    month: 'Oct',
    title: 'Morning Sun',
    icon: 'wb_sunny',
    iconColor: '#f59e0b',
    description: 'The way the light hit the leaves this morning was absolutely magical...',
    tag: {
      label: 'High Impact',
      color: '#d97706',
    },
  },
  {
    id: '2',
    date: '2023-10-23',
    day: 23,
    month: 'Oct',
    title: 'Warm Coffee',
    icon: 'coffee',
    iconColor: '#60a5fa',
    description: 'Grateful for that first sip of coffee before the house woke up. Pure peace.',
  },
  {
    id: '3',
    date: '2023-10-21',
    day: 21,
    month: 'Oct',
    title: 'Friendship',
    icon: 'group',
    iconColor: '#a78bfa',
    description: 'Sarah listened to me for an hour today. So lucky to have a friend like her.',
    tag: {
      label: 'Shared',
      color: '#d97706',
    },
  },
  {
    id: '4',
    date: '2023-10-20',
    day: 20,
    month: 'Oct',
    title: 'My Dog',
    icon: 'pets',
    iconColor: '#34d399',
    description: 'Even when I\'m sad, Buster knows exactly how to cheer me up.',
  },
];

const weeklyData = [
  { week: 'W1', height: 40, isSelected: false },
  { week: 'W2', height: 65, isSelected: false },
  { week: 'W3', height: 50, isSelected: false },
  { week: 'W4', height: 85, isSelected: true },
];

export const GratitudeHistoryScreen: React.FC<GratitudeHistoryScreenProps> = ({
  onBack,
  onEntryPress,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.25)',
            'rgba(15, 23, 42, 0.15)',
            'rgba(17, 29, 33, 0.08)',
            'transparent',
          ]}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="arrow_back" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gratitude History</Text>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="filter_list" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Growth Insights Card */}
        <View style={styles.insightsCard}>
          <LinearGradient
            colors={[
              'rgba(245, 158, 11, 0.1)',
              'rgba(234, 179, 8, 0.05)',
              'rgba(249, 115, 22, 0.1)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.insightsCardContent}>
            <View style={styles.insightsHeader}>
              <View style={styles.insightsTitleRow}>
                <Icon name="auto_awesome" size={18} color="#f59e0b" />
                <Text style={styles.insightsTitle}>AI Growth Insights</Text>
              </View>
              <View style={styles.monthlyBadge}>
                <Text style={styles.monthlyBadgeText}>Monthly Analysis</Text>
              </View>
            </View>

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartLabel}>Entries</Text>
              <View style={styles.barChart}>
                {weeklyData.map((week, index) => (
                  <View key={index} style={styles.barColumn}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${week.height}%`,
                          backgroundColor: week.isSelected
                            ? '#f59e0b'
                            : 'rgba(245, 158, 11, 0.3)',
                        },
                        week.isSelected && styles.barSelected,
                      ]}
                    >
                      {week.isSelected && (
                        <LinearGradient
                          colors={['#f59e0b', '#fbbf24']}
                          start={{ x: 0, y: 1 }}
                          end={{ x: 0, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.weekLabel,
                        week.isSelected && styles.weekLabelSelected,
                      ]}
                    >
                      {week.week}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Insights */}
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <View style={styles.insightIcon}>
                  <Icon name="psychology_alt" size={14} color="#f59e0b" />
                </View>
                <Text style={styles.insightText}>
                  Your focus on <Text style={styles.insightBold}>"Nature"</Text> has increased your
                  overall positivity rating by 15%.
                </Text>
              </View>
              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                  <Icon name="local_fire_department" size={14} color="#f97316" />
                </View>
                <Text style={styles.insightText}>
                  You've maintained a <Text style={styles.insightBold}>12-day streak!</Text>{' '}
                  Consistency is building your emotional resilience.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Entries */}
        <Text style={styles.sectionTitle}>RECENT ENTRIES</Text>
        <View style={styles.entriesList}>
          {gratitudeEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => onEntryPress?.(entry.id)}
              activeOpacity={0.95}
            >
              <View style={styles.entryDate}>
                <Text style={styles.entryMonth}>{entry.month}</Text>
                <Text style={styles.entryDay}>{entry.day}</Text>
              </View>
              <View style={styles.entryContent}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Icon name={entry.icon} size={18} color={entry.iconColor} />
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                  </View>
                  {entry.tag && (
                    <View style={[styles.entryTag, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                      <Text style={[styles.entryTagText, { color: entry.tag.color }]}>
                        {entry.tag.label}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.entryDescription} numberOfLines={1}>
                  {entry.description}
                </Text>
              </View>
              <Icon name="chevron_right" size={18} color="#4b5563" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.endMarker}>
          <Text style={styles.endMarkerText}>End of history</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  header: {
    position: 'relative',
    zIndex: 10,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(17, 29, 33, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  insightsCard: {
    marginBottom: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  insightsCardContent: {
    padding: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
  monthlyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  monthlyBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#f59e0b',
  },
  chartContainer: {
    marginBottom: 20,
    height: 128,
    position: 'relative',
    paddingTop: 16,
  },
  chartLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    gap: 8,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 20,
  },
  barSelected: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  weekLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
  },
  weekLabelSelected: {
    fontWeight: '700',
    color: '#f59e0b',
  },
  insightsList: {
    flexDirection: 'column',
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#d1d5db',
  },
  insightBold: {
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6b7280',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  entriesList: {
    flexDirection: 'column',
    gap: 12,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 24,
    backgroundColor: '#1a2c32',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  entryDate: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: 48,
  },
  entryMonth: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9ca3af',
    marginBottom: 2,
  },
  entryDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  entryContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  entryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entryTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  entryDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  endMarker: {
    marginTop: 32,
    alignItems: 'center',
  },
  endMarkerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
