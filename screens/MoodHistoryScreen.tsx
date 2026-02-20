import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useMoodHistory, useMoodInsights, useMoodEntry } from '@/hooks/useMood';
import { MoodEntryDetailModal } from '@/components/mood/MoodEntryDetailModal';
import type { Mood, MoodInsights } from '@/services/mood';

interface MoodHistoryScreenProps {
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

// Helper function to get calendar data for a given month/year
const getCalendarData = (year: number, month: number, moods: Mood[]) => {
  if (!Array.isArray(moods)) return [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Create a map of date strings to moods for quick lookup
  const moodMap = new Map<string, string | null>();
  moods.forEach((entry) => {
    const entryDate = new Date(entry.entryDate);
    if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
      moodMap.set(entry.entryDate, entry.mood);
    }
  });

  const calendarDays: { day: number; mood: string | null; isCurrentMonth: boolean }[] = [];

  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthLastDay - i,
      mood: null,
      isCurrentMonth: false,
    });
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      day,
      mood: moodMap.get(dateStr) || null,
      isCurrentMonth: true,
    });
  }

  // Fill remaining days to complete the grid (next month)
  // Ensure we always have 6 rows (42 days) for consistent display
  const totalDays = calendarDays.length;
  const remainingDays = 42 - totalDays;
  if (remainingDays > 0) {
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        day,
        mood: null,
        isCurrentMonth: false,
      });
    }
  }

  return calendarDays;
};

const getMoodColor = (mood: string | null): string => {
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
      return 'transparent';
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

export const MoodHistoryScreen: React.FC<MoodHistoryScreenProps> = ({
  onBack,
  onEntryPress,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Use React Query hooks for data fetching
  const { data: historyData, isLoading: isLoadingHistory } = useMoodHistory({ limit: 100 });
  const { data: insights, isLoading: isLoadingInsights } = useMoodInsights();
  const { data: selectedEntryData } = useMoodEntry(selectedEntryId);

  const raw = (historyData as any)?.data;
  const moods: Mood[] = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
  const isLoading = isLoadingHistory || isLoadingInsights;
  const insightsData = insights as MoodInsights | undefined;
  // API returns { success: true, data: { mood: Mood } }; support both wrapped and unwrapped
  const selectedEntry =
    (selectedEntryData as { data?: { mood: Mood } } | undefined)?.data?.mood ??
    (selectedEntryData as { mood?: Mood } | undefined)?.mood ??
    null;

  const handleEntryPress = (entryId: string) => {
    const id = parseInt(entryId, 10);
    if (!isNaN(id)) {
      setSelectedEntryId(id);
      setIsDetailModalVisible(true);
      onEntryPress?.(entryId);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedEntryId(null);
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthDisplay = `${monthNames[currentMonth]} ${currentYear}`;

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const calendarData = useMemo(() => {
    return getCalendarData(currentYear, currentMonth, moods);
  }, [currentYear, currentMonth, moods]);

  // Prepare graph data from weekly trend
  const graphData = useMemo(() => {
    if (!insightsData?.weeklyTrend || insightsData.weeklyTrend.length === 0) return null;
    
    const trend = insightsData.weeklyTrend;
    const maxIntensity = Math.max(...trend.map(t => t.averageIntensity), 10);
    const points = trend.map((week, index) => {
      const x = (index / (trend.length - 1 || 1)) * 300;
      const y = 100 - (week.averageIntensity / maxIntensity) * 70; // Scale to 0-70 range
      return { x, y };
    });

    // Create smooth path
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 3;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) / 3;
      const cp2y = curr.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
    }

    return { path, points };
  }, [insightsData]);

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
          <Text style={styles.headerTitle}>Mood History</Text>
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
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>{monthDisplay}</Text>
            <View style={styles.calendarNav}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={handlePreviousMonth}
                activeOpacity={0.7}
              >
                <Icon name="chevron_left" size={18} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={handleNextMonth}
                activeOpacity={0.7}
              >
                <Icon name="chevron_right" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Day Labels */}
          <View style={styles.dayLabels}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={styles.dayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarData.map((item, index) => (
              <View key={index} style={styles.calendarDay}>
                <Text
                  style={[
                    styles.calendarDayText,
                    item.isCurrentMonth
                      ? item.mood
                        ? styles.calendarDayTextActive
                        : styles.calendarDayTextCurrent
                      : styles.calendarDayTextInactive,
                  ]}
                >
                  {item.day}
                </Text>
                {item.mood && item.isCurrentMonth && (
                  <View style={[styles.moodDot, { backgroundColor: getMoodColor(item.mood) }]} />
                )}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#19b3e6' }]} />
              <Text style={styles.legendText}>Good</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#34d399' }]} />
              <Text style={styles.legendText}>Neutral</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} />
              <Text style={styles.legendText}>Tense</Text>
            </View>
          </View>
        </View>

        {/* Haven Insights Card */}
        <View style={styles.insightsCard}>
          <LinearGradient
            colors={[
              'rgba(25, 179, 230, 0.05)',
              'rgba(168, 85, 247, 0.05)',
              'rgba(59, 130, 246, 0.05)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.insightsCardContent}>
            <View style={styles.insightsHeader}>
              <View style={styles.insightsTitleRow}>
                <Icon name="auto_awesome" size={18} color="#19b3e6" />
                <Text style={styles.insightsTitle}>Haven Insights</Text>
              </View>
              <View style={styles.weeklyBadge}>
                <Text style={styles.weeklyBadgeText}>Weekly Analysis</Text>
              </View>
            </View>

          {/* Graph */}
          {graphData ? (
            <View style={styles.graphContainer}>
              <Svg width="100%" height={96} viewBox="0 0 300 100" preserveAspectRatio="none">
                <Defs>
                  <SvgLinearGradient id="gradientGraph" x1="0" x2="0" y1="0" y2="1">
                    <Stop offset="0%" stopColor="#19b3e6" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#19b3e6" stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                <Path
                  d={`${graphData.path} V110 H0 Z`}
                  fill="url(#gradientGraph)"
                />
                <Path
                  d={graphData.path}
                  fill="none"
                  stroke="#19b3e6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {graphData.points.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="#ffffff"
                    stroke="#19b3e6"
                    strokeWidth="2"
                  />
                ))}
              </Svg>
              <View style={styles.graphLabels}>
                {insightsData?.weeklyTrend?.slice(0, 4).map((week, index) => (
                  <Text key={index} style={styles.graphLabel}>
                    {week.week.split(' ')[0]}
                  </Text>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyGraph}>
              <Text style={styles.emptyGraphText}>No data yet</Text>
            </View>
          )}

          {/* Insights */}
          {insightsData && (
            <View style={styles.insightsList}>
              {/* AI Weekly Summary */}
              {insightsData.aiInsights?.weeklySummary && (
                <View style={styles.aiSummaryCard}>
                  <View style={styles.aiSummaryHeader}>
                    <Icon name="auto_awesome" size={16} color="#19b3e6" />
                    <Text style={styles.aiSummaryTitle}>This Week's Summary</Text>
                  </View>
                  <Text style={styles.aiSummaryText}>{insightsData.aiInsights.weeklySummary}</Text>
                </View>
              )}

              {/* AI Key Patterns */}
              {insightsData.aiInsights?.keyPatterns && insightsData.aiInsights.keyPatterns.length > 0 && (
                <>
                  {insightsData.aiInsights.keyPatterns.map((pattern, index) => (
                    <View key={`ai-pattern-${index}`} style={styles.insightItem}>
                      <View style={styles.insightIcon}>
                        <Icon name="lightbulb" size={14} color="#19b3e6" />
                      </View>
                      <Text style={styles.insightText}>{pattern}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* AI Emotional Insights */}
              {insightsData.aiInsights?.emotionalInsights && insightsData.aiInsights.emotionalInsights.length > 0 && (
                <>
                  {insightsData.aiInsights.emotionalInsights.map((insight, index) => (
                    <View key={`ai-emotional-${index}`} style={styles.insightItem}>
                      <View style={[styles.insightIcon, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
                        <Icon name="self_improvement" size={14} color="#34d399" />
                      </View>
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* AI Supportive Suggestions */}
              {insightsData.aiInsights?.supportiveSuggestions && insightsData.aiInsights.supportiveSuggestions.length > 0 && (
                <>
                  {insightsData.aiInsights.supportiveSuggestions.map((suggestion, index) => (
                    <View key={`ai-suggestion-${index}`} style={styles.insightItem}>
                      <View style={[styles.insightIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <Icon name="tips_and_updates" size={14} color="#3b82f6" />
                      </View>
                      <Text style={styles.insightText}>{suggestion}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Fallback to basic insights if AI insights not available */}
              {!insightsData.aiInsights && (
                <>
                  {insightsData.patterns?.slice(0, 3).map((pattern, index) => (
                    <View key={index} style={styles.insightItem}>
                      <View style={styles.insightIcon}>
                        <Icon name="lightbulb" size={14} color="#19b3e6" />
                      </View>
                      <Text style={styles.insightText}>
                        {pattern.description}
                      </Text>
                    </View>
                  ))}
                  {insightsData.streak > 0 && (
                    <View style={styles.insightItem}>
                      <View style={[styles.insightIcon, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
                        <Icon name="local_fire_department" size={14} color="#f97316" />
                      </View>
                      <Text style={styles.insightText}>
                        You've maintained a <Text style={styles.insightBold}>{insightsData.streak}-day tracking streak!</Text>
                      </Text>
                    </View>
                  )}
                  {insightsData.moodDistribution?.[0] && (
                    <View style={styles.insightItem}>
                      <View style={styles.insightIcon}>
                        <Icon name="self_improvement" size={14} color="#34d399" />
                      </View>
                      <Text style={styles.insightText}>
                        Your most common mood is <Text style={styles.insightBold}>{getMoodLabel(insightsData.moodDistribution[0].mood)}</Text> ({insightsData.moodDistribution[0].percentage}% of entries).
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}
          </View>
        </View>

        {/* Recent Entries */}
        <Text style={styles.sectionTitle}>RECENT ENTRIES</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#19b3e6" />
          </View>
        ) : moods.length > 0 ? (
          <View style={styles.entriesList}>
            {moods.slice(0, 20).map((entry) => {
              const { day, month } = formatDate(entry.entryDate);
              const preview = entry.notes
                ? entry.notes.length > 60
                  ? entry.notes.substring(0, 60) + '...'
                  : entry.notes
                : 'No notes';

              return (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryCard}
                  onPress={() => handleEntryPress(entry.id.toString())}
                  activeOpacity={0.95}
                >
                  <View style={styles.entryDate}>
                    <Text style={styles.entryMonth}>{month}</Text>
                    <Text style={styles.entryDay}>{day}</Text>
                  </View>
                  <View style={styles.entryContent}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryMoodRow}>
                        <Icon name={getMoodIcon(entry.mood)} size={18} color={getMoodColor(entry.mood)} />
                        <Text style={styles.entryMoodLabel}>{getMoodLabel(entry.mood)}</Text>
                      </View>
                      <View
                        style={[
                          styles.intensityBadge,
                          entry.intensity >= 7
                            ? { backgroundColor: 'rgba(25, 179, 230, 0.1)' }
                            : { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.intensityText,
                            entry.intensity >= 7 ? { color: '#19b3e6' } : { color: '#6b7280' },
                          ]}
                        >
                          {entry.intensity}/10
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
            <Text style={styles.emptyText}>No mood entries yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your mood today!</Text>
          </View>
        )}

        <View style={styles.endMarker}>
          <Text style={styles.endMarkerText}>End of history</Text>
        </View>
      </ScrollView>

      {/* Mood Entry Detail Modal */}
      <MoodEntryDetailModal
        visible={isDetailModalVisible}
        mood={selectedEntry}
        onClose={handleCloseModal}
      />
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
  calendarCard: {
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: '#1a2c32',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 4,
  },
  calendarNavButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDay: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calendarDayTextActive: {
    color: '#d1d5db',
  },
  calendarDayTextCurrent: {
    color: '#d1d5db',
  },
  calendarDayTextInactive: {
    color: '#4b5563',
  },
  moodDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    color: '#6b7280',
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
    color: '#19b3e6',
  },
  weeklyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  weeklyBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
  },
  graphContainer: {
    marginBottom: 20,
    height: 96,
    position: 'relative',
  },
  graphLabels: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  graphLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
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
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
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
  aiSummaryCard: {
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.2)',
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#19b3e6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiSummaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#e2e8f0',
    fontWeight: '400',
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
  entryMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryMoodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  intensityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  intensityText: {
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
  emptyGraph: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGraphText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
