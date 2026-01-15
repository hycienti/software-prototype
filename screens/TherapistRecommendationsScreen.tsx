import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TherapistCard } from '@/components/therapist/TherapistCard';
import { cn } from '@/utils/cn';

const therapists = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'PhD, LMFT',
    price: 150,
    rating: 4.9,
    reviewCount: 120,
    specialties: ['Anxiety', 'Trauma'],
    avatarUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn_TvEfSMpB6gjR4ppdBAaCoveY2Y_tRQ1DY-QNy9y2dai0oMg7hjKt-XrGsITz-G098gkPEQgoCoV-ME-vpRT56gdxzh-QIMVDNr91joDsNrrVpOnWIfaqdO1aiQZxhd8ug5Twd4jDwu-Q4CXw3pF1jb8XfX8vTk-kZbbdCTfFlf7uMR_nH5Zq5od942dyfdqmdkIQut83w5ZrYM8rEfp5u2mJmEcr7cwaqiu1ZqSOe4Qxrpa4ToT3ug-F2IwlyFKYR8cdJJh00k',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Mark Davis',
    title: 'PsyD',
    price: 135,
    rating: 4.8,
    reviewCount: 85,
    specialties: ['Depression', 'CBT'],
    avatarUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdLYzCmay6IPuVoL52_zDRzF55AtULNGfFrLowhGWSqo9qrOagT7fGuW5KgPw2zkCX7vTI4wyUxvwo7WvYfNAOFUs3nQ0Iw0V_RHZsqUJkM5sGjx3GmcA3bm7WjyWuWBnHFfpOpgn7rHerD68N8HqtKAKY1X_1n6CEbRweEMxl4eyMmJb79Ksq-k81_2n4X9bD9b08PHLzxAUFs4Xp8CVwgzOb_PoP5Pt0pkBJYI8JsMBVSXQGkl5hSkGD7-i-ECIlT-bw8HjtiGo',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    title: 'LCSW',
    price: 110,
    rating: 5.0,
    reviewCount: 42,
    specialties: ['Family Therapy', 'Stress'],
    avatarUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6bQadR5HHHd23oYikDpM6gWXaItEod5oPMLWUTqBCtNFTc4z-SB8IDwzM3b933FbvO7A-OxUJzQRqpkirxpdkqZbLtpjN_Ie5kbnYEFpDJTnUfCRfZvZyhgaIAR1OCWEGcDcYYHdqiUy_G3Sm3exnHxpYY3cD6Qt9pEDmheuiPN8lv5T5jwU8DUqNZD0ECSbXYFBVrIa04kZ8o9eJ5HJKMJwvOqHv1RSRUrJzUjY701oY5th1HEfJkEZQKKKgvqPpRQtGIQMHStw',
    isOnline: false,
  },
];

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
          {therapists.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              {...therapist}
              onPress={() => onTherapistPress?.(therapist.id)}
            />
          ))}
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
