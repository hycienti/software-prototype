import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { TherapistCard } from '@/components/therapist/TherapistCard';
import { therapistsService } from '@/services/therapists';
import { formatTherapistDisplayName } from '@/utils/user';

interface TherapistRecommendationsScreenProps {
  onTherapistPress?: (id: string) => void;
  visible?: boolean;
  onClose?: () => void;
}

export const TherapistRecommendationsScreen: React.FC<TherapistRecommendationsScreenProps> = ({
  onTherapistPress,
  visible = true,
  onClose,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['therapists', 'recommendations'],
    queryFn: () => therapistsService.list({ limit: 20 }),
  });

  const therapists = data?.therapists ?? [];

  return (
    <View style={styles.container}>
      {/* Dark Gradient Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.4)',
            'rgba(15, 23, 42, 0.25)',
            'rgba(17, 29, 33, 0.15)',
            'rgba(17, 29, 33, 0.05)',
            'transparent',
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View 
          style={[
            styles.backgroundBlob1,
            { backgroundColor: 'rgba(25, 179, 230, 0.08)' }
          ]} 
        />
        <View 
          style={[
            styles.backgroundBlob2,
            { backgroundColor: 'rgba(88, 28, 135, 0.12)' }
          ]} 
        />
      </View>

      {/* Drag Handle */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Text */}
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Based on our talk, I think a specialist could help.
          </Text>
          <Text style={styles.subtitle}>
            Here are 3 recommendations from Haven.
          </Text>
        </View>

        {/* Cards List */}
        <View style={styles.cardsContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#19b3e6" style={{ paddingVertical: 24 }} />
          ) : (
            therapists.map((t) => (
              <TherapistCard
                key={t.id}
                name={formatTherapistDisplayName(t.fullName) || `Therapist #${t.id}`}
                title={t.professionalTitle ?? ''}
                specialties={t.specialties ?? []}
                avatarUri={t.profilePhotoUrl ?? undefined}
                price={t.rateCents != null ? t.rateCents / 100 : undefined}
                onPress={() => onTherapistPress?.(String(t.id))}
              />
            ))
          )}
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
  dragHandleContainer: {
    width: '100%',
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  dragHandle: {
    height: 6,
    width: 48,
    borderRadius: 3,
    backgroundColor: '#345965',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerText: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#93bac8',
    marginTop: 8,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  bottomSpacer: {
    height: 32,
  },
  backgroundBlob1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.4,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: '20%',
    right: '-5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.4,
  },
});
