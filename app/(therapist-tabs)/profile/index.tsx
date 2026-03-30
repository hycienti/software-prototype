import { useState } from 'react';
import { View, ScrollView, Image, Pressable, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { therapistTabBarClearance } from '@/constants/therapistTabBar';
import { useTherapistMe } from '@/hooks/useTherapistApi';
import { useAuthStore } from '@/store';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCSr08RHg05FeqJ9BkTJ8q5y33VD0yLJvUisyTwekF085w7LMGIHmrREUecaISu-Zg-6hhLjMWr-ReFYmE_q8RZeEVOfe72BCZpDZfVINjGWuu3Kqlw7ie_OQO9KbLkqXm2WIhqLK19hayZs98-ROsh1jIhhxntR819CCqNoh8hbjgq4J2lkz_UEikk_Rjm4M5R_2BT-q7dYUanaYwGTVWY1GS8n_2XNi84c3AdMhW3rd4gEYWXYZWUwAlslndNxQILwUnAHOJKusM';

const hubCards = [
  {
    title: 'Professional Profile',
    subtitle: 'Bio, credentials, and verification',
    icon: 'person' as const,
    href: '/(therapist-settings)/professional-profile',
  },
  {
    title: 'Practice Settings',
    subtitle: 'Rates, specialties, and payout setup',
    icon: 'tune' as const,
    href: '/(therapist-settings)/settings',
  },
  {
    title: 'Availability',
    subtitle: 'Recurring and one-off session windows',
    icon: 'event-available' as const,
    href: '/(therapist-settings)/availability',
  },
  {
    title: 'Payment & Payouts',
    subtitle: 'Balance and withdrawal history',
    icon: 'account-balance-wallet' as const,
    href: '/(therapist-tabs)/wallet',
  },
  {
    title: 'Notifications',
    subtitle: 'Session and account alerts',
    icon: 'notifications' as const,
    href: '/(therapist-settings)/notifications',
  },
  {
    title: 'Security & Login',
    subtitle: 'OTP sign-in and privacy',
    icon: 'lock' as const,
    href: '/(therapist-settings)/security',
  },
  {
    title: 'Help & Support',
    subtitle: 'FAQs and contact support',
    icon: 'help' as const,
    href: '/(therapist-settings)/help-support',
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { clearAuth } = useAuthStore();
  const { therapist, loading } = useTherapistMe();
  const [pressing, setPressing] = useState<string | null>(null);

  const displayName = therapist?.fullName ?? 'Dr. Sarah Johnson';
  const subtitle = therapist?.professionalTitle ?? 'Clinical Psychologist';

  if (loading && !therapist) {
    return (
      <View className="flex-1 bg-[#111d21] justify-center items-center">
        <ActivityIndicator size="large" color="#19b3e6" />
        <Text className="text-white/40 mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#111d21]">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: therapistTabBarClearance(insets.bottom, 12),
            maxWidth: 480,
            alignSelf: 'center',
            width: '100%',
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile hero card */}
          <View className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/8 mb-8 px-6 py-6">
            <View className="items-center">
              <View className="relative">
                <Image
                  source={{ uri: DEFAULT_AVATAR }}
                  className="w-28 h-28 rounded-full border-[3px] border-[#111d21]"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                />
                <View className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-emerald-500 border-2 border-[#111d21] rounded-full" />
              </View>
              <Text className="text-2xl font-extrabold tracking-tight text-white mt-4 text-center">
                {displayName}
              </Text>
              <Text className="text-white/50 font-medium mt-1 text-center text-sm">
                {subtitle}
              </Text>
            </View>
          </View>

          <Text className="text-xs font-bold uppercase tracking-wider text-white/30 mb-3 px-1">
            Account
          </Text>
          <View className="gap-3">
            {hubCards.map((card) => (
              <Pressable
                key={card.title}
                onPress={() => router.push(card.href as any)}
                onPressIn={() => setPressing(card.title)}
                onPressOut={() => setPressing(null)}
                style={{ opacity: pressing === card.title ? 0.9 : 1 }}
              >
                <View className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/8 px-5 py-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="h-12 w-12 rounded-full bg-white/5 border border-white/10 items-center justify-center">
                        <MaterialIcons name={card.icon} size={24} color="#19b3e6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold leading-tight">{card.title}</Text>
                        <Text className="text-white/40 mt-0.5 text-xs">{card.subtitle}</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#7a8a8e" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Log out */}
          <View className="mt-10">
            <Pressable
              onPress={async () => {
                await clearAuth();
                router.replace('/(auth)/therapist-welcome' as any);
              }}
              onPressIn={() => setPressing('logout')}
              onPressOut={() => setPressing(null)}
              style={{ opacity: pressing === 'logout' ? 0.9 : 1 }}
            >
              <View className="rounded-[2rem] overflow-hidden border border-red-500/20 bg-red-500/5">
                <View className="flex-row items-center justify-center gap-2 py-4">
                  <MaterialIcons name="logout" size={20} color="#ef4444" />
                  <Text className="text-red-400 font-bold">Log Out</Text>
                </View>
              </View>
            </Pressable>
          </View>

          <Text className="text-center text-white/20 mt-8 text-[10px] tracking-widest uppercase">
            Version 2.4.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
