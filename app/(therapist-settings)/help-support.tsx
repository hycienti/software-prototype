import React from 'react';
import { View, ScrollView, Pressable, Text, Linking } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#111d21';
const PRIMARY = '#19b3e6';
const TEXT_MUTED = 'rgba(255,255,255,0.45)';

const FAQ = [
  {
    q: 'How do I update my availability?',
    a: 'Use the Schedule tab or open Practice settings → Availability to edit your slots. Changes sync to the server when you save.',
  },
  {
    q: 'When do I get paid?',
    a: 'Earnings and withdrawals are shown under Earnings. Payout timing depends on your linked payout method and processor cutoffs.',
  },
  {
    q: 'A client cannot join video',
    a: 'Confirm the session is still marked scheduled, then start the room from the dashboard or session flow. Ask the client to update the app and check camera permissions.',
  },
] as const;

export default function TherapistHelpSupportScreen() {
  const insets = useSafeAreaInsets();

  const openMail = () => {
    Linking.openURL('mailto:support@haven.app?subject=Haven%20Therapist%20support').catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }} edges={['top']}>
      <View className="flex-row items-center px-4 py-3 border-b border-white/5">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          hitSlop={12}
        >
          <MaterialIcons name="arrow-back-ios" size={22} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-bold flex-1 text-center mr-10">Help & support</Text>
      </View>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4">
          Common questions
        </Text>
        {FAQ.map((item) => (
          <View key={item.q} className="mb-6">
            <Text className="text-white font-semibold text-base mb-2">{item.q}</Text>
            <Text className="text-base leading-6" style={{ color: TEXT_MUTED }}>
              {item.a}
            </Text>
          </View>
        ))}

        <Pressable
          onPress={openMail}
          className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex-row items-center gap-3 active:opacity-90"
        >
          <MaterialIcons name="email" size={24} color={PRIMARY} />
          <View className="flex-1">
            <Text className="text-white font-bold">Email support</Text>
            <Text className="text-sm mt-0.5" style={{ color: TEXT_MUTED }}>
              support@haven.app
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={TEXT_MUTED} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
