import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#111d21';
const TEXT_MUTED = 'rgba(255,255,255,0.45)';

export default function TherapistSecurityScreen() {
  const insets = useSafeAreaInsets();

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
        <Text className="text-white text-lg font-bold flex-1 text-center mr-10">Security & login</Text>
      </View>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-white/90 text-base leading-6 mb-4">
          Haven therapists sign in with a one-time code sent to your email. No password is stored on
          this device.
        </Text>
        <Text className="text-base leading-6 mb-6" style={{ color: TEXT_MUTED }}>
          To use a different email, sign out from the Profile tab, then sign in again with the new
          address. Never forward your verification code to anyone.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
