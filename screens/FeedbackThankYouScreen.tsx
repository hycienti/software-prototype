import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';

interface FeedbackThankYouScreenProps {
  onReturnHome: () => void;
  onStartBreathing: () => void;
}

export function FeedbackThankYouScreen({ onReturnHome, onStartBreathing }: FeedbackThankYouScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon name="check_circle" size={64} color="#10b981" />
        </View>
        <Text style={styles.title}>Thank you</Text>
        <Text style={styles.subtitle}>Your feedback helps us improve your experience.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onReturnHome} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Return Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onStartBreathing} activeOpacity={0.8}>
          <Icon name="self_improvement" size={22} color="#19b3e6" />
          <Text style={styles.secondaryButtonText}>Start Breathing Exercise</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconWrap: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#19b3e6',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(25, 179, 230, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.4)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#19b3e6',
  },
});
