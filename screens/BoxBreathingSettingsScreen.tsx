import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import Slider from '@react-native-community/slider';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat } from 'react-native-reanimated';
import { useBoxBreathingSettings } from '@/store/BoxBreathingSettingsContext';

interface BoxBreathingSettingsScreenProps {
  onBack?: () => void;
  onDone?: () => void;
  onReset?: () => void;
}

const musicOptions = [
  { id: 'rain' as const, label: 'Rain', icon: 'water_drop', color: '#19b3e6' },
  { id: 'forest' as const, label: 'Forest', icon: 'forest', color: '#94a3b8' },
  { id: 'zen' as const, label: 'Zen', icon: 'self_improvement', color: '#94a3b8' },
];

export const BoxBreathingSettingsScreen: React.FC<BoxBreathingSettingsScreenProps> = ({
  onBack,
  onDone,
  onReset,
}) => {
  const { settings, updateSettings, resetSettings } = useBoxBreathingSettings();
  const [inhaleDuration, setInhaleDuration] = useState(settings.inhaleDuration);
  const [holdDuration, setHoldDuration] = useState(settings.holdDuration);
  const [exhaleDuration, setExhaleDuration] = useState(settings.exhaleDuration);
  const [hapticFeedback, setHapticFeedback] = useState(settings.hapticFeedback);
  const [voiceGuidance, setVoiceGuidance] = useState(settings.voiceGuidance);
  const [enableMusic, setEnableMusic] = useState(settings.enableMusic);
  const [selectedMusic, setSelectedMusic] = useState(settings.selectedMusic);

  // Sync local state with context when settings change externally
  useEffect(() => {
    setInhaleDuration(settings.inhaleDuration);
    setHoldDuration(settings.holdDuration);
    setExhaleDuration(settings.exhaleDuration);
    setHapticFeedback(settings.hapticFeedback);
    setVoiceGuidance(settings.voiceGuidance);
    setEnableMusic(settings.enableMusic);
    setSelectedMusic(settings.selectedMusic);
  }, [settings]);

  const handleDone = () => {
    updateSettings({
      inhaleDuration,
      holdDuration,
      exhaleDuration,
      hapticFeedback,
      voiceGuidance,
      enableMusic,
      selectedMusic,
    });
    onDone?.();
  };

  const handleReset = () => {
    resetSettings();
    onReset?.();
  };

  // Pulse animation for selected music dot
  const pulseScale = useSharedValue(1);
  
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.3, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const ToggleSwitch: React.FC<{ value: boolean; onValueChange: (value: boolean) => void }> = ({
    value,
    onValueChange,
  }) => {
    const translateX = useSharedValue(value ? 24 : 4);

    React.useEffect(() => {
      translateX.value = withTiming(value ? 24 : 4, { duration: 200 });
    }, [value]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <TouchableOpacity
        style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            animatedStyle,
            !value && { backgroundColor: 'rgba(255, 255, 255, 0.4)' },
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Blobs */}
      <View style={[styles.blob1, { backgroundColor: 'rgba(25, 179, 230, 0.2)' }]} />
      <View style={[styles.blob2, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]} />

      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="arrow_back_ios_new" size={24} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={handleDone} style={styles.doneButton} activeOpacity={0.7}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Feature Header */}
        <View style={styles.featureHeader}>
          <View style={styles.featureIcon}>
            <LinearGradient
              colors={['rgba(25, 179, 230, 0.2)', 'rgba(52, 211, 153, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Icon name="air" size={24} color="#19b3e6" />
          </View>
          <View>
            <Text style={styles.featureTitle}>Box Breathing</Text>
            <Text style={styles.featureSubtitle}>Customize your rhythm</Text>
          </View>
        </View>

        {/* Rhythm Duration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RHYTHM DURATION</Text>
          <View style={styles.glassCard}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassCardContentWithPadding}>
            {/* Inhale Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <View style={styles.sliderLabelRow}>
                  <Icon name="arrow_upward" size={18} color="#19b3e6" />
                  <Text style={styles.sliderLabel}>Inhale</Text>
                </View>
                <Text style={styles.sliderValue}>
                  {inhaleDuration}
                  <Text style={styles.sliderUnit}>s</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={inhaleDuration}
                onValueChange={setInhaleDuration}
                minimumTrackTintColor="#19b3e6"
                maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                thumbTintColor="#ffffff"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>1s</Text>
                <Text style={styles.sliderLabelText}>5s</Text>
                <Text style={styles.sliderLabelText}>10s</Text>
              </View>
            </View>

            {/* Hold Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <View style={styles.sliderLabelRow}>
                  <Icon name="pause" size={18} color="#19b3e6" />
                  <Text style={styles.sliderLabel}>Hold</Text>
                </View>
                <Text style={styles.sliderValue}>
                  {holdDuration}
                  <Text style={styles.sliderUnit}>s</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={holdDuration}
                onValueChange={setHoldDuration}
                minimumTrackTintColor="#19b3e6"
                maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                thumbTintColor="#ffffff"
              />
            </View>

            {/* Exhale Slider */}
            <View style={[styles.sliderContainer, styles.sliderContainerLast]}>
              <View style={styles.sliderHeader}>
                <View style={styles.sliderLabelRow}>
                  <Icon name="arrow_downward" size={18} color="#19b3e6" />
                  <Text style={styles.sliderLabel}>Exhale</Text>
                </View>
                <Text style={styles.sliderValue}>
                  {exhaleDuration}
                  <Text style={styles.sliderUnit}>s</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={exhaleDuration}
                onValueChange={setExhaleDuration}
                minimumTrackTintColor="#19b3e6"
                maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                thumbTintColor="#ffffff"
              />
            </View>
            </View>
          </View>
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCE</Text>
          <View style={styles.glassCard}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassCardContentExperience}>
            {/* Haptic Feedback */}
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIcon}>
                  <Icon name="vibration" size={18} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <Text style={styles.toggleLabel}>Haptic Feedback</Text>
              </View>
              <ToggleSwitch value={hapticFeedback} onValueChange={setHapticFeedback} />
            </View>

            <View style={styles.divider} />

            {/* Voice Guidance */}
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIcon}>
                  <Icon name="record_voice_over" size={18} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <Text style={styles.toggleLabel}>Voice Guidance</Text>
              </View>
              <ToggleSwitch value={voiceGuidance} onValueChange={setVoiceGuidance} />
            </View>
            </View>
          </View>
        </View>

        {/* Background Music Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BACKGROUND MUSIC</Text>
          <View style={styles.glassCard}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassCardContentMusic}>
            {/* Enable Music Toggle */}
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIcon}>
                  <Icon name="music_note" size={18} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <Text style={styles.toggleLabel}>Enable Music</Text>
              </View>
              <ToggleSwitch value={enableMusic} onValueChange={setEnableMusic} />
            </View>

            {/* Music Options */}
            <View style={styles.musicGrid}>
              {musicOptions.map((option) => {
                const isSelected = selectedMusic === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.musicButton,
                      isSelected ? styles.musicButtonSelected : styles.musicButtonUnselected,
                    ]}
                    onPress={() => setSelectedMusic(option.id)}
                    activeOpacity={0.95}
                  >
                    {isSelected && (
                      <Animated.View style={[styles.musicSelectedDot, pulseStyle]}>
                        <View style={styles.musicSelectedDotInner} />
                      </Animated.View>
                    )}
                    <Icon
                      name={option.icon}
                      size={24}
                      color={isSelected ? '#19b3e6' : 'rgba(255, 255, 255, 0.4)'}
                    />
                    <Text
                      style={[
                        styles.musicButtonText,
                        isSelected ? styles.musicButtonTextSelected : styles.musicButtonTextUnselected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            </View>
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.resetContainer}>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
    position: 'relative',
  },
  blob1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '50%',
    height: '50%',
    borderRadius: 9999,
    opacity: 0.4,
    filter: 'blur(120px)',
  },
  blob2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '60%',
    height: '60%',
    borderRadius: 9999,
    opacity: 0.3,
    filter: 'blur(100px)',
  },
  header: {
    position: 'relative',
    zIndex: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'rgba(17, 29, 33, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#19b3e6',
  },
  scrollView: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12, // rounded-xl = 24px, but using 12px for smaller icon
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  featureSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(26, 44, 50, 0.4)',
    borderRadius: 28, // rounded-2xl = 1.75rem = 28px
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  glassCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  glassCardContentWithPadding: {
    position: 'relative',
    zIndex: 1,
    padding: 24, // p-6 = 1.5rem = 24px
  },
  glassCardContentExperience: {
    position: 'relative',
    zIndex: 1,
    // No padding - items have their own padding
  },
  glassCardContentMusic: {
    position: 'relative',
    zIndex: 1,
    padding: 16, // p-4 = 1rem = 16px
  },
  sliderContainer: {
    marginBottom: 32, // space-y-8 = 2rem = 32px
  },
  sliderContainerLast: {
    marginBottom: 0,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  sliderUnit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 2,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  sliderLabelText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.2)',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16, // p-4 = 1rem = 16px
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleOn: {
    backgroundColor: '#34d399',
  },
  toggleOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleThumb: {
    position: 'absolute',
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 0,
  },
  musicGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20, // space-y-5 = 1.25rem = 20px
  },
  musicButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 24, // rounded-xl = 1.5rem = 24px
    position: 'relative',
  },
  musicButtonSelected: {
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.5)',
  },
  musicButtonUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  musicSelectedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#19b3e6',
  },
  musicSelectedDotInner: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#19b3e6',
  },
  musicButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  musicButtonTextSelected: {
    color: '#19b3e6',
  },
  musicButtonTextUnselected: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  resetContainer: {
    paddingTop: 16,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  bottomSpacer: {
    height: 32,
  },
});
