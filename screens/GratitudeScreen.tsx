import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';

interface GratitudeScreenProps {
  onBack?: () => void;
  onSave?: () => void;
  onHistory?: () => void;
}

export const GratitudeScreen: React.FC<GratitudeScreenProps> = ({
  onBack,
  onSave,
  onHistory,
}) => {
  const insets = useSafeAreaInsets();
  const [gratitudes, setGratitudes] = useState(['', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [streak] = useState(12);

  const updateGratitude = (index: number, value: string) => {
    const newGratitudes = [...gratitudes];
    newGratitudes[index] = value;
    setGratitudes(newGratitudes);
  };

  const placeholders = [
    'e.g., I enjoyed my morning coffee without rushing...',
    'e.g., I helped a colleague with a tough problem...',
    'e.g., The sunset was beautiful...',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient with Blobs */}
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
        <View style={[styles.blob1, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]} />
        <View style={[styles.blob2, { backgroundColor: 'rgba(25, 179, 230, 0.1)' }]} />
      </View>

      {/* Header with Backdrop Blur */}
      <View style={styles.header}>
        {/* <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} /> */}
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="arrow_back" size={24} color="#cbd5e1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gratitude Practice</Text>
          <TouchableOpacity
            style={styles.streakBadge}
            onPress={onHistory}
            activeOpacity={0.7}
          >
            <Icon name="local_fire_department" size={20} color="#f59e0b" />
            <Text style={styles.streakText}>{streak}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero Text */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>What went well today?</Text>
          <Text style={styles.heroSubtitle}>
            Take a moment to capture three bright spots from your day.
          </Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.inputGroup}>
              {/* Focus Indicator */}
              {focusedIndex === index && <View style={styles.focusIndicator} />}
              <View style={styles.inputWrapper}>
                <View style={styles.inputLabel}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.labelText}>Good thing</Text>
                </View>
                <TextInput
                  style={[styles.textInput, focusedIndex === index && styles.textInputFocused]}
                  value={gratitudes[index]}
                  onChangeText={(text) => updateGratitude(index, text)}
                  placeholder={placeholders[index]}
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                />
              </View>
            </View>
          ))}

          {/* Photo Upload Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoLabel}>
              <Icon name="photo_camera" size={20} color="#19b3e6" />
              <Text style={styles.photoLabelText}>
                Photo Gratitude <Text style={styles.photoLabelOptional}>Optional</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.photoButton} activeOpacity={0.95}>
              <View style={styles.photoButtonIcon}>
                <Icon name="add_a_photo" size={24} color="#64748b" />
              </View>
              <Text style={styles.photoButtonText}>Add a photo memory</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quote Section */}
        <View style={styles.quoteSection}>
          <Icon name="format_quote" size={48} color="rgba(245, 158, 11, 0.5)" />
          <Text style={styles.quoteText}>"Gratitude turns what we have into enough."</Text>
          <Text style={styles.quoteAuthor}>— Aesop</Text>
        </View>
        {/* Bottom Action Bar with Gradient */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* <LinearGradient
          colors={['#111d21', 'rgba(17, 29, 33, 0.8)', 'transparent']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        /> */}
          <TouchableOpacity style={styles.saveButton} onPress={onSave} activeOpacity={0.98}>
            <Icon name="check_circle" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
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
  blob1: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.1,
  },
  blob2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.1,
  },
  header: {
    position: 'relative',
    zIndex: 50,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.2,
    color: '#ffffff',
    textAlign: 'center',
    paddingRight: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  heroSection: {
    marginBottom: 32,
    marginTop: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.5,
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#94a3b8',
  },
  inputsContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  inputGroup: {
    position: 'relative',
  },
  focusIndicator: {
    position: 'absolute',
    left: -12,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(25, 179, 230, 0.5)',
  },
  inputWrapper: {
    flexDirection: 'column',
    width: '100%',
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(25, 179, 230, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.3)',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#19b3e6',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  textInput: {
    width: '100%',
    minHeight: 100,
    fontSize: 16,
    fontWeight: '400',
    color: '#e2e8f0',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.8)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  textInputFocused: {
    borderColor: '#19b3e6',
    borderWidth: 1.5,
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  photoSection: {
    marginTop: 8,
  },
  photoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  photoLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  photoLabelOptional: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94a3b8',
  },
  photoButton: {
    width: '100%',
    height: 128,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(55, 65, 81, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  quoteSection: {
    marginTop: 48,
    marginBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  quoteText: {
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 28,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingHorizontal: 16,
    overflow: 'hidden',
    zIndex: 40,
  },
  saveButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#19b3e6',
    borderRadius: 24, // rounded-xl = 1.5rem = 24px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
