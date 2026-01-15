import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const recommendations = [
  {
    id: '1',
    title: 'Guided Meditation',
    type: 'audio',
    duration: '10 min',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdhXoFjAGvjWBlNbnpfvQN4NIKDdixpnzC6GK7kafOjS64-myqwirzxlITirGFIvPwlJnWHVe8PDZg4CEIC2WyheIsUa-jNSyFFQteU8697bC5o00aLDWW2CEj1eKhMgoO6P4b-64SJxEYIFiACwdLa9I7vnuES1DD0aFzrzHb-r2b0gPMCNw8iG0rthnWq3GuK6_MIVJibpgQgfAOxHPCIzGIs3PxvXHMJKHEGLzGSgJuO723ViDnGtmf3z6uVsyVdeAWx16aap0',
  },
  {
    id: '2',
    title: 'Managing Anxiety',
    type: 'article',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh0WCdVEexgPgBnFKOsax6yG2bqIxrxb0fLtrt3wgKJQwgEdxE1mrrN84U1ZGtdYWmgjAyjUvDdzRci2bX7YZ4wDRaegVjE06JLdETlMCxtEOBzOB2gasjaKyoG5Z6u_4Evq5VActEFEwFdyAiK4CifO-7JWchu3q3u-SABnsHnCMuw9AsiVie5XRX16qD2nBiFlTzjtAsc0uNNxyYgBOt1aZ6rgsLAcj1G1vYyDucIXLECpnuKD51yvqeyWU5yqCuge-vvoCYDbw',
  },
  {
    id: '3',
    title: 'Box Breathing',
    type: 'video',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXzIYxK9o-pXxamDelLb4ZRuSVsAdysdUoR7eGR70VuA1Z9h1p1hOiBG7ZXgV7vTYMf8Ic96z8U-5mWpZAXbpHW7Wez7RuN6N1h7-EbnWVN6id2CKAw4wcOI_oIzhF-EFsNfuWew70h5HLg7yktTzt4XvwETiKCqhMAdcOfFiyNzfoGDUwpd2kfGe46X1y-jsRuLGVRVQOcFDgu7wiTBOC4zFa0NhA-Yr91Jylzb3HHqyJmC9JOq4vapThpK4FrC5kN782eRGKvEQ',
  },
];

interface HomeScreenProps {
  onChatPress?: () => void;
  onVoicePress?: () => void;
  onJournalPress?: () => void;
  onWellnessPress?: () => void;
  onProfilePress?: () => void;
  onRecommendationPress?: (id: string, type: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onChatPress,
  onVoicePress,
  onJournalPress,
  onWellnessPress,
  onProfilePress,
  onRecommendationPress,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
        <TouchableOpacity className="w-12 h-12 shrink-0 items-center justify-start">
          <Icon name="menu" size={32} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center">Haven</Text>
        <TouchableOpacity className="w-12 items-center justify-end">
          <Icon name="notifications" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full">
          <Text className="text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
            Hello, Alex.{'\n'}How are you feeling today?
          </Text>
        </View>

        <View className="flex-row gap-3 p-4">
          <TouchableOpacity
            onPress={onChatPress}
            className="relative overflow-hidden flex-col gap-3 rounded-xl justify-between p-4 flex-1 aspect-[4/5] shadow-sm active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(25, 179, 230, 0.1)',
            }}
          >
            <View className="bg-primary/20 backdrop-blur-sm rounded-full w-12 h-12 items-center justify-center self-start">
              <Icon name="chat_bubble" size={32} color="#19b3e6" />
            </View>
            <View>
              <Text className="text-white text-lg font-bold leading-tight">Chat with Haven</Text>
              <Text className="text-white/70 text-sm mt-1">Text Therapy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onVoicePress}
            className="relative overflow-hidden flex-col gap-3 rounded-xl justify-between p-4 flex-1 aspect-[4/5] shadow-sm active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(25, 179, 230, 0.1)',
            }}
          >
            <View className="bg-primary/20 backdrop-blur-sm rounded-full w-12 h-12 items-center justify-center self-start">
              <Icon name="mic" size={32} color="#19b3e6" />
            </View>
            <View>
              <Text className="text-white text-lg font-bold leading-tight">Start Voice Session</Text>
              <Text className="text-white/70 text-sm mt-1">Voice Therapy</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-col gap-3 px-4 pb-2">
          <TouchableOpacity
            onPress={onJournalPress}
            className="flex-row items-center p-4 rounded-2xl bg-white dark:bg-[#1a2c32] shadow-sm border border-transparent dark:border-white/5 active:scale-[0.98]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 items-center justify-center shrink-0">
              <Icon name="book_2" size={24} color="#f97316" />
            </View>
            <View className="flex-col items-start ml-4 flex-1">
              <Text className="text-neutral-900 dark:text-white font-bold text-base">
                Mood Journal
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                Log your daily thoughts
              </Text>
            </View>
            <Icon name="arrow_forward" size={24} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onWellnessPress}
            className="flex-row items-center p-4 rounded-2xl bg-white dark:bg-[#1a2c32] shadow-sm border border-transparent dark:border-white/5 active:scale-[0.98]"
          >
            <View className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 items-center justify-center shrink-0">
              <Icon name="self_improvement" size={24} color="#10b981" />
            </View>
            <View className="flex-col items-start ml-4 flex-1">
              <Text className="text-neutral-900 dark:text-white font-bold text-base">
                Wellness Exercises
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                Body and mind activities
              </Text>
            </View>
            <Icon name="arrow_forward" size={24} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onProfilePress}
            className="flex-row items-center p-4 rounded-2xl bg-white dark:bg-[#1a2c32] shadow-sm border border-transparent dark:border-white/5 active:scale-[0.98]"
          >
            <View className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 items-center justify-center shrink-0">
              <Icon name="person" size={24} color="#8b5cf6" />
            </View>
            <View className="flex-col items-start ml-4 flex-1">
              <Text className="text-neutral-900 dark:text-white font-bold text-base">
                Your Profile
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                Settings and preferences
              </Text>
            </View>
            <Icon name="arrow_forward" size={24} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        <View className="w-full">
          <Text className="text-lg font-bold leading-tight px-4 pb-3 pt-6">
            Recommended for You
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="w-full pb-8"
        >
          <View className="flex-row items-stretch p-4 gap-4 pt-0">
            {recommendations.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onRecommendationPress?.(item.id, item.type)}
                className="flex-col gap-3 rounded-lg w-60 shrink-0"
              >
                <View className="w-full aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                  {item.imageUri && (
                    <Image
                      source={{ uri: item.imageUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  )}
                  <View className="absolute inset-0 bg-black/30" />
                  {(item.type === 'audio' || item.type === 'video') && (
                    <View className="absolute inset-0 items-center justify-center">
                      <View className="bg-white/20 backdrop-blur-md rounded-full w-10 h-10 items-center justify-center">
                        <Icon name="play_arrow" size={24} color="#fff" />
                      </View>
                    </View>
                  )}
                </View>
                <View>
                  <Text className="text-neutral-900 dark:text-white text-base font-medium leading-normal">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Icon
                      name={item.type === 'audio' ? 'headphones' : item.type === 'video' ? 'videocam' : 'article'}
                      size={16}
                      color="#19b3e6"
                    />
                    <Text className="text-neutral-500 dark:text-[#93bac8] text-sm font-normal">
                      {item.duration || item.type}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};
