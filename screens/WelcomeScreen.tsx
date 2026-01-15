import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export const WelcomeScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="relative h-full w-full flex-col">
        <View className="absolute top-0 left-0 w-full h-[70%] overflow-hidden z-0">
          <View
            className="absolute inset-0 h-full w-full"
            style={{
              backgroundColor: '#111d21',
            }}
          />
          <View className="absolute inset-0 bg-gradient-to-b from-mint/30 via-primary/20 to-slate-900/50" />
          <View className="absolute inset-0 bg-black/10" />
        </View>

        <View className="absolute top-0 left-0 w-full h-[70%] z-10 flex-col items-center justify-center pb-12">
          <View className="relative h-28 w-28 overflow-hidden rounded-3xl shadow-2xl mb-6">
            <View
              className="absolute inset-0"
              style={{
                backgroundColor: '#1a2c32',
              }}
            />
            <View className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
          </View>
          <View className="flex-col items-center space-y-2 px-6">
            <Text className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
              Haven
            </Text>
            <Text className="text-lg font-medium leading-relaxed tracking-tight text-white/95 drop-shadow-md">
              Your safe space for mental health
            </Text>
          </View>
        </View>

        <View className="absolute bottom-0 left-0 w-full h-[35%] z-20 flex-col items-center">
          <View className="w-full h-full bg-white/85 dark:bg-[#111d21]/90 backdrop-blur-2xl border-t border-white/50 dark:border-white/10 rounded-t-3xl shadow-2xl flex-col px-6 pt-8 pb-safe">
            <View className="mx-auto mb-8 h-1 w-12 rounded-full bg-slate-300/80 dark:bg-slate-600/50" />
            <View className="flex-col w-full gap-4">
              <TouchableOpacity className="group relative flex-row h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white text-slate-900 shadow-sm border border-slate-200/80 active:scale-[0.98]">
                <Text className="text-[17px] font-semibold tracking-tight">Continue with Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity className="group relative flex-row h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#243e47] text-white shadow-lg border border-white/10 active:scale-[0.98]">
                <Text className="text-[17px] font-semibold tracking-tight">Continue with Google</Text>
              </TouchableOpacity>
            </View>
            <Text className="mt-auto mb-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              By continuing, you agree to our{' '}
              <Text className="underline">Terms</Text> & <Text className="underline">Privacy Policy</Text>.
            </Text>
            <View className="h-4 w-full" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
