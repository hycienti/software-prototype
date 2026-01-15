import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';
import { Icon } from '@/components/ui/Icon';

const moods = [
  { id: 'happy', label: 'Happy', icon: 'sentiment_satisfied' },
  { id: 'calm', label: 'Calm', icon: 'spa' },
  { id: 'anxious', label: 'Anxious', icon: 'thunderstorm' },
  { id: 'sad', label: 'Sad', icon: 'water_drop' },
  { id: 'angry', label: 'Angry', icon: 'local_fire_department' },
];

interface MoodJournalScreenProps {
  onBack?: () => void;
  onSave?: () => void;
}

export const MoodJournalScreen: React.FC<MoodJournalScreenProps> = ({
  onBack,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedMood, setSelectedMood] = useState('happy');
  const [intensity, setIntensity] = useState(7);
  const [journalText, setJournalText] = useState('');

  // Get color based on intensity (cooler to hotter)
  const getIntensityColor = (value: number): string => {
    // Color stops from cool to hot:
    // 1: Cool blue (#19b3e6)
    // 3: Cyan (#34d399)
    // 5: Yellow-green (#84cc16)
    // 7: Yellow (#fbbf24)
    // 9: Orange (#f97316)
    // 10: Hot red (#ef4444)
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
    
    // Clamp value between 1 and 10
    const clamped = Math.max(1, Math.min(10, Math.round(value)));
    return colorStops[clamped - 1];
  };

  // Convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const intensityColor = getIntensityColor(intensity);
  const intensityBadgeBg = hexToRgba(intensityColor, 0.1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Backdrop Blur */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today, Oct 24</Text>
          <TouchableOpacity style={styles.historyButton} activeOpacity={0.7}>
            <Text style={styles.historyText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Prompt Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconContainer}>
              <Icon name="auto_awesome" size={14} color="#19b3e6" />
            </View>
            <Text style={styles.aiLabel}>Haven AI</Text>
          </View>
          <Text style={styles.aiPrompt}>
            What's one small thing you can control right now?
          </Text>
        </View>

        {/* Journal Input */}
        <View style={styles.journalContainer}>
          <TextInput
            style={styles.journalInput}
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Start writing your thoughts here..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Mood Section */}
        <View style={styles.moodSection}>
          <Text style={styles.moodTitle}>How are you feeling?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScrollContent}
            style={styles.moodScroll}
          >
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <TouchableOpacity
                  key={mood.id}
                  onPress={() => setSelectedMood(mood.id)}
                  style={[
                    styles.moodChip,
                    isSelected ? styles.moodChipActive : styles.moodChipInactive,
                  ]}
                  activeOpacity={0.95}
                >
                  <Icon
                    name={mood.icon}
                    size={20}
                    color={isSelected ? '#ffffff' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.moodChipText,
                      isSelected ? styles.moodChipTextActive : styles.moodChipTextInactive,
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Intensity Slider Card */}
        <View style={styles.intensityCard}>
          <View style={styles.intensityHeader}>
            <Text style={styles.intensityLabel}>Intensity</Text>
            <View style={[styles.intensityBadge, { backgroundColor: intensityBadgeBg }]}>
              <Text style={[styles.intensityValue, { color: intensityColor }]}>
                {intensity}/10
              </Text>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor={intensityColor}
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor={intensityColor}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Mild</Text>
            <Text style={styles.sliderLabelText}>Intense</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer with Gradient */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <LinearGradient
          colors={['#111d21', 'rgba(17, 29, 33, 0.8)', 'transparent']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          activeOpacity={0.98}
        >
          <Text style={styles.saveButtonText}>Save Entry</Text>
        </TouchableOpacity>
      </View>
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
  historyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#19b3e6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  aiCard: {
    marginBottom: 24,
    borderRadius: 25,
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
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(25, 179, 230, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#19b3e6',
  },
  aiPrompt: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: '#ffffff',
  },
  journalContainer: {
    marginBottom: 32,
    minHeight: 200,
  },
  journalInput: {
    width: '100%',
    minHeight: 200,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    color: '#e5e7eb',
    backgroundColor: 'transparent',
    padding: 0,
  },
  moodSection: {
    marginBottom: 24,
  },
  moodTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9ca3af',
    marginBottom: 16,
  },
  moodScroll: {
    marginHorizontal: -16,
  },
  moodScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  moodChip: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    flexShrink: 0,
  },
  moodChipActive: {
    backgroundColor: '#19b3e6',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  moodChipInactive: {
    backgroundColor: '#1a2c32',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.8)',
  },
  moodChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  moodChipTextActive: {
    color: '#ffffff',
  },
  moodChipTextInactive: {
    color: '#d1d5db',
  },
  intensityCard: {
    marginBottom: 32,
    borderRadius: 25,
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
  intensityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  intensityValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sliderContainer: {
    height: 24,
    width: '100%',
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  saveButton: {
    width: '100%',
    height: 56,
    borderRadius: 40,
    backgroundColor: '#19b3e6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
