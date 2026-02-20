import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { sessionsService } from '@/services/sessions';
import type { SessionFeedbackRequest } from '@/types/api';

type SentimentOption = 'better' | 'same' | 'worse';

interface SessionFeedbackScreenProps {
  sessionId: number;
  onSubmitSuccess: () => void;
  onBack: () => void;
}

export function SessionFeedbackScreen({ sessionId, onSubmitSuccess, onBack }: SessionFeedbackScreenProps) {
  const [rating, setRating] = useState(0);
  const [sentiment, setSentiment] = useState<SentimentOption | null>(null);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: (payload: SessionFeedbackRequest) => sessionsService.submitFeedback(sessionId, payload),
    onSuccess: () => {
      onSubmitSuccess();
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message ?? 'Failed to submit feedback. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Rating required', 'Please select a rating from 1 to 5 stars.');
      return;
    }
    if (!sentiment) {
      Alert.alert('How are you feeling?', 'Please select how you feel after this session.');
      return;
    }
    const payload: SessionFeedbackRequest = {
      rating,
      sentimentAfter: sentiment,
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    };
    submitMutation.mutate(payload);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Feedback</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.prompt}>How would you rate this session?</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setRating(value)}
              style={styles.starButton}
              activeOpacity={0.8}
            >
              <Icon
                name={rating >= value ? 'star' : 'star_border'}
                size={40}
                color={rating >= value ? '#fbbf24' : '#6b7280'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.prompt}>How do you feel after this session?</Text>
        <View style={styles.sentimentRow}>
          {(['better', 'same', 'worse'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setSentiment(opt)}
              style={[styles.sentimentChip, sentiment === opt && styles.sentimentChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.sentimentText, sentiment === opt && styles.sentimentTextActive]}>
                {opt === 'better' ? 'Better' : opt === 'same' ? 'Same' : 'Worse'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.prompt}>Anything you’d like to add? (optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your thoughts..."
          placeholderTextColor="#6b7280"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          maxLength={2000}
        />

        <TouchableOpacity
          style={[styles.submitButton, (submitMutation.isPending || rating === 0 || !sentiment) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitMutation.isPending || rating === 0 || !sentiment}
          activeOpacity={0.8}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 41, 55, 0.5)',
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  prompt: {
    fontSize: 16,
    color: '#e5e7eb',
    marginBottom: 12,
    marginTop: 16,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  sentimentRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  sentimentChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  sentimentChipActive: {
    backgroundColor: 'rgba(25, 179, 230, 0.25)',
    borderColor: '#19b3e6',
  },
  sentimentText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  sentimentTextActive: {
    color: '#19b3e6',
    fontWeight: '600',
  },
  commentInput: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 14,
    color: '#e5e7eb',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  submitButton: {
    marginTop: 28,
    backgroundColor: '#19b3e6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
