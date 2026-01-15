import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
}

export const TherapistRecommendationsScreen: React.FC<TherapistRecommendationsScreenProps> = ({
  onTherapistPress,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1">
        <View className="pt-4 pb-2 items-center">
          <View className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-[#345965]" />
        </View>
        <ScrollView
          className="flex-1 px-5 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-2 mb-6 items-center">
            <Text className="text-gray-900 dark:text-white text-2xl font-bold leading-tight px-2 text-center">
              Based on our talk, I think a specialist could help.
            </Text>
            <Text className="text-gray-500 dark:text-[#93bac8] text-sm mt-2 font-medium">
              Here are 3 recommendations from Haven.
            </Text>
          </View>
          <View className="flex-col gap-4">
            {therapists.map((therapist) => (
              <TherapistCard
                key={therapist.id}
                {...therapist}
                onPress={() => onTherapistPress?.(therapist.id)}
              />
            ))}
          </View>
          <View className="h-8" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
