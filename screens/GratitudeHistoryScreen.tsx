import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import { gratitudeService } from '@/services/gratitude';
import type { Gratitude, GratitudeInsights } from '@/services/gratitude';
import { useUIStore } from '@/store';

interface GratitudeHistoryScreenProps {
  onBack?: () => void;
  onEntryPress?: (entryId: string) => void;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return { day, month, date: dateString };
};

// Helper function to get icon and color based on entry content
const getEntryIcon = (entries: string[]): { icon: string; color: string } => {
  const text = entries.join(' ').toLowerCase();
  if (text.includes('family') || text.includes('mom') || text.includes('dad')) {
    return { icon: 'family_restroom', color: '#f59e0b' };
  }
  if (text.includes('friend') || text.includes('colleague')) {
    return { icon: 'group', color: '#a78bfa' };
  }
  if (text.includes('nature') || text.includes('sunset') || text.includes('outdoor')) {
    return { icon: 'wb_sunny', color: '#f59e0b' };
  }
  if (text.includes('coffee') || text.includes('food') || text.includes('meal')) {
    return { icon: 'coffee', color: '#60a5fa' };
  }
  if (text.includes('pet') || text.includes('dog') || text.includes('cat')) {
    return { icon: 'pets', color: '#34d399' };
  }
  return { icon: 'favorite', color: '#f59e0b' };
};

export const GratitudeHistoryScreen: React.FC<GratitudeHistoryScreenProps> = ({
  onBack,
  onEntryPress,
}) => {
  const { showAlert } = useUIStore();
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([]);
  const [insights, setInsights] = useState<GratitudeInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [historyData, insightsData] = await Promise.all([
          gratitudeService.getHistory({ limit: 50 }),
          gratitudeService.getInsights(),
        ]);
        setGratitudes(historyData.data);
        setInsights(insightsData);
      } catch (error: any) {
        console.error('Error fetching gratitude history:', error);
        showAlert({
          type: 'error',
          title: 'Error',
          message: error?.message || 'Failed to load gratitude history. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data from monthly trend
  const chartData = insights?.monthlyTrend.map((month, index) => ({
    week: month.month.split(' ')[0], // Get month abbreviation
    height: Math.max(20, (month.count / (insights.monthlyTrend.reduce((max, m) => Math.max(max, m.count), 0) || 1)) * 100),
    isSelected: index === insights.monthlyTrend.length - 1, // Select current month
  })) || [];

  // Get top theme
  const topTheme = insights?.mostCommonThemes[0];

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
                {chartData.length > 0 ? chartData.map((week, index) => (
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
                )) : (
                  <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartText}>No data yet</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Insights */}
            {insights && (
              <View style={styles.insightsList}>
                {topTheme && (
                  <View style={styles.insightItem}>
                    <View style={styles.insightIcon}>
                      <Icon name="psychology_alt" size={14} color="#f59e0b" />
                    </View>
                    <Text style={styles.insightText}>
                      Your focus on <Text style={styles.insightBold}>"{topTheme.theme}"</Text> appears {topTheme.count} times in your entries.
                    </Text>
                  </View>
                )}
                {insights.currentStreak > 0 && (
                  <View style={styles.insightItem}>
                    <View style={[styles.insightIcon, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                      <Icon name="local_fire_department" size={14} color="#f97316" />
                    </View>
                    <Text style={styles.insightText}>
                      You've maintained a <Text style={styles.insightBold}>{insights.currentStreak}-day streak!</Text>{' '}
                      {insights.currentStreak >= 7 ? 'Consistency is building your emotional resilience.' : 'Keep it up!'}
                    </Text>
                  </View>
                )}
                {insights.entriesThisMonth > 0 && (
                  <View style={styles.insightItem}>
                    <View style={styles.insightIcon}>
                      <Icon name="calendar_month" size={14} color="#f59e0b" />
                    </View>
                    <Text style={styles.insightText}>
                      You've written <Text style={styles.insightBold}>{insights.entriesThisMonth} entries</Text> this month.
                      {insights.entriesLastMonth > 0 && insights.entriesThisMonth > insights.entriesLastMonth && ' That\'s more than last month!'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Recent Entries */}
        <Text style={styles.sectionTitle}>RECENT ENTRIES</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        ) : gratitudes.length > 0 ? (
          <View style={styles.entriesList}>
            {gratitudes.map((gratitude) => {
              const { day, month } = formatDate(gratitude.entryDate);
              const { icon, color } = getEntryIcon(gratitude.entries);
              const firstEntry = gratitude.entries[0] || '';
              const preview = firstEntry.length > 60 ? firstEntry.substring(0, 60) + '...' : firstEntry;

              return (
                <TouchableOpacity
                  key={gratitude.id}
                  style={styles.entryCard}
                  onPress={() => onEntryPress?.(gratitude.id.toString())}
                  activeOpacity={0.95}
                >
                  <View style={styles.entryDate}>
                    <Text style={styles.entryMonth}>{month}</Text>
                    <Text style={styles.entryDay}>{day}</Text>
                  </View>
                  <View style={styles.entryContent}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryTitleRow}>
                        <Icon name={icon} size={18} color={color} />
                        <Text style={styles.entryTitle} numberOfLines={1}>
                          {gratitude.entries.length} {gratitude.entries.length === 1 ? 'Entry' : 'Entries'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.entryDescription} numberOfLines={2}>
                      {preview}
                    </Text>
                  </View>
                  <Icon name="chevron_right" size={18} color="#4b5563" />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>No gratitude entries yet</Text>
            <Text style={styles.emptySubtext}>Start your gratitude practice today!</Text>
          </View>
        )}

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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyChart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
