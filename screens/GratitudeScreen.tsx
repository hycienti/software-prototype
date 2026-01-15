import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface GratitudeScreenProps {
  onBack?: () => void;
  onSave?: () => void;
}

export const GratitudeScreen: React.FC<GratitudeScreenProps> = ({
  onBack,
  onSave,
}) => {
  const [gratitudes, setGratitudes] = useState(['', '', '']);
  const [streak, setStreak] = useState(12);

  const updateGratitude = (index: number, value: string) => {
    const newGratitudes = [...gratitudes];
    newGratitudes[index] = value;
    setGratitudes(newGratitudes);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="absolute inset-0 pointer-events-none z-0">
        <View className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[100px]" />
        <View className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      </View>

      <View className="relative z-10 flex-row items-center justify-between p-4 pb-2 sticky top-0 bg-background-light/80 dark:bg-background-dark/80">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10"
        >
          <Icon name="arrow_back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center pr-2">Gratitude Practice</Text>
        <View className="flex-row items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700/50">
          <Icon name="local_fire_department" size={20} color="#f59e0b" />
          <Text className="text-amber-800 dark:text-amber-200 text-sm font-bold">{streak}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pb-24 pt-2" showsVerticalScrollIndicator={false}>
        <View className="mb-8 mt-2">
          <Text className="text-3xl font-bold leading-tight tracking-tight mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            What went well today?
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
            Take a moment to capture three bright spots from your day.
          </Text>
        </View>

        <View className="flex-col gap-6">
          {[0, 1, 2].map((index) => (
            <View key={index} className="relative">
              <View className="absolute -left-3 top-0 h-full w-1 rounded-full bg-primary/50 opacity-0" />
              <View className="flex-col w-full">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-5 h-5 rounded-full bg-primary/20 items-center justify-center">
                    <Text className="text-primary text-xs font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                    Good thing
                  </Text>
                </View>
                <TextArea
                  value={gratitudes[index]}
                  onChangeText={(text) => updateGratitude(index, text)}
                  placeholder={`e.g., ${index === 0 ? 'I enjoyed my morning coffee without rushing...' : index === 1 ? 'I helped a colleague with a tough problem...' : 'The sunset was beautiful...'}`}
                  className="min-h-[100px]"
                  containerClassName="mb-0"
                />
              </View>
            </View>
          ))}

          <View className="mt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <Icon name="photo_camera" size={20} color="#19b3e6" />
              <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                Photo Gratitude{' '}
                <Text className="text-slate-400 text-xs font-normal">Optional</Text>
              </Text>
            </View>
            <TouchableOpacity className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 active:bg-slate-50 dark:active:bg-white/5 items-center justify-center gap-2">
              <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
                <Icon name="add_a_photo" size={24} color="#64748b" />
              </View>
              <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Add a photo memory
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-12 mb-6 items-center px-6">
          <Icon name="format_quote" size={48} color="rgba(245, 158, 11, 0.5)" />
          <Text className="text-slate-600 dark:text-slate-300 font-medium italic text-lg leading-relaxed text-center">
            "Gratitude turns what we have into enough."
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-sm mt-2 font-medium uppercase tracking-wider">
            — Aesop
          </Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 w-full p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 pt-10">
        <TouchableOpacity
          onPress={onSave}
          className="w-full bg-primary active:bg-primary/90 py-4 px-6 rounded-xl shadow-lg shadow-primary/25 flex-row items-center justify-center gap-2"
        >
          <Icon name="check_circle" size={20} color="#fff" />
          <Text className="text-white font-bold">Save Entry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
