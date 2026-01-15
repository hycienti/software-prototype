import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Icon } from '@/components/ui/Icon';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const moods = [
  { id: 'happy', label: 'Happy', icon: 'sentiment_satisfied' },
  { id: 'calm', label: 'Calm', icon: 'spa' },
  { id: 'anxious', label: 'Anxious', icon: 'thunderstorm' },
  { id: 'sad', label: 'Sad', icon: 'water_drop' },
  { id: 'angry', label: 'Angry', icon: 'local_fire_department' },
];

interface MoodJournalScreenProps {
  onBack?: () => void;
  onSave?: () => void;
}

export const MoodJournalScreen: React.FC<MoodJournalScreenProps> = ({
  onBack,
  onSave,
}) => {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [intensity, setIntensity] = useState(7);
  const [journalText, setJournalText] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light/80 dark:bg-background-dark/80 px-4 py-3">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800"
        >
          <Icon name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text className="text-base font-bold">Today, Oct 24</Text>
        <TouchableOpacity className="px-2">
          <Text className="text-sm font-semibold text-primary">History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pb-24 pt-2" showsVerticalScrollIndicator={false}>
        <Card className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
              <Icon name="auto_awesome" size={14} color="#19b3e6" />
            </View>
            <Text className="text-xs font-bold uppercase tracking-wide text-primary">
              Haven AI
            </Text>
          </View>
          <Text className="text-xl font-bold leading-snug text-gray-900 dark:text-white">
            What's one small thing you can control right now?
          </Text>
        </Card>

        <View className="mb-8 flex-1">
          <TextArea
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Start writing your thoughts here..."
            className="min-h-[200px] text-lg"
            containerClassName="mb-0"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            How are you feeling?
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 px-4 pb-2"
          >
            <View className="flex-row gap-3">
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  onPress={() => setSelectedMood(mood.id)}
                  className={cn(
                    'h-10 shrink-0 flex-row items-center gap-2 rounded-full px-4 py-1.5',
                    selectedMood === mood.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700'
                  )}
                >
                  <Icon
                    name={mood.icon}
                    size={20}
                    color={selectedMood === mood.id ? '#fff' : '#6b7280'}
                  />
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      selectedMood === mood.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                    )}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <Card className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Intensity
            </Text>
            <View className="bg-primary/10 px-2 py-0.5 rounded-md">
              <Text className="text-sm font-bold text-primary">{intensity}/10</Text>
            </View>
          </View>
          <View className="h-6 items-center w-full">
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor="#19b3e6"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#19b3e6"
            />
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">Mild</Text>
            <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">Intense</Text>
          </View>
        </Card>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 mx-auto w-full bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 pb-6 pt-4 px-4">
        <Button className="w-full" onPress={onSave}>
          Save Entry
        </Button>
      </View>
    </SafeAreaView>
  );
};
