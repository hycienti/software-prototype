import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const recommendations = [
  {
    id: '1',
    title: 'Guided Meditation',
    type: 'audio',
    duration: '10 min audio',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdhXoFjAGvjWBlNbnpfvQN4NIKDdixpnzC6GK7kafOjS64-myqwirzxlITirGFIvPwlJnWHVe8PDZg4CEIC2WyheIsUa-jNSyFFQteU8697bC5o00aLDWW2CEj1eKhMgoO6P4b-64SJxEYIFiACwdLa9I7vnuES1DD0aFzrzHb-r2b0gPMCNw8iG0rthnWq3GuK6_MIVJibpgQgfAOxHPCIzGIs3PxvXHMJKHEGLzGSgJuO723ViDnGtmf3z6uVsyVdeAWx16aap0',
  },
  {
    id: '2',
    title: 'Managing Anxiety',
    type: 'article',
    duration: 'Article',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh0WCdVEexgPgBnFKOsax6yG2bqIxrxb0fLtrt3wgKJQwgEdxE1mrrN84U1ZGtdYWmgjAyjUvDdzRci2bX7YZ4wDRaegVjE06JLdETlMCxtEOBzOB2gasjaKyoG5Z6u_4Evq5VActEFEwFdyAiK4CifO-7JWchu3q3u-SABnsHnCMuw9AsiVie5XRX16qD2nBiFlTzjtAsc0uNNxyYgBOt1aZ6rgsLAcj1G1vYyDucIXLECpnuKD51yvqeyWU5yqCuge-vvoCYDbw',
  },
  {
    id: '3',
    title: 'Box Breathing',
    type: 'video',
    duration: 'Video',
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
        <TouchableOpacity className="w-12 h-12 shrink-0 items-center justify-start">
          <Icon name="menu" size={30} color={isDark ? '#ffffff' : '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} className="text-lg font-bold flex-1 text-center text-neutral-900 dark:text-white">
          Haven
        </Text>
        <TouchableOpacity className="w-12 h-12 items-center justify-end">
          <Icon name="notifications" size={24} color={isDark ? '#ffffff' : '#111827'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full">
          <Text className="text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5 text-neutral-900 dark:text-white">
            Hello, Alex.{'\n'}How are you feeling today?
          </Text>
        </View>

        <View className="flex-row gap-3 p-4">
          <TouchableOpacity
            onPress={onChatPress}
            style={styles.cardContainer}
            activeOpacity={0.98}
          >
            <ImageBackground
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0TwLPJpFyltvNxAuh1BsiBUyH-Ednt2kwON5bpeunYV-by92Z0v858XJUU8ZlmWUngH1YsUoZTciiTg8BW8lJ0IYIfxYyA-RAy9nlZHebz6K35xV3apvZMfr60wyefj9EVh_TMhbzI3zg68U6oH5lHQkHaGgm47Tt1CJA31HZ7GmRqObgXi3hrX7C_W8EZSJd4gMzE94KaqaRGY8nkmPbE0WlXNHdyqRcvdSmJleaEmBdZP97hDHc4oyTsKLqL7vcrmq_3-FCjBI' }}
              style={styles.cardBackground}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  'rgba(25, 179, 230, 0.1)',
                  'rgba(17, 29, 33, 0.8)',
                ]}
                locations={[0, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View className="flex-col gap-3 justify-between p-4 flex-1">
                <View className="bg-primary/20 backdrop-blur-sm rounded-full w-12 h-12 items-center justify-center self-start">
                  <Icon name="chat_bubble" size={24} color="#19b3e6" />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold leading-tight w-full">Chat with Haven</Text>
                  <Text className="text-white/70 text-sm mt-1">Text Therapy</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onVoicePress}
            style={styles.cardContainer}
            activeOpacity={0.98}
          >
            <ImageBackground
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8cfC6f-LljcQVvCnJ8V_MUx9KADPkXsVCfVN_4bA5mB-5LvavqE7ekpKlrmG1KsMujfz5d6um4pSlFRqD11YKQ6NSbiQXwjb0-oXCSB6C5B2KP0-lrAUvlMqVoiCUQ580Pf_c0p3MKL-IsDeWNzytIqPSjcd6zHzJSLXmvm-uaVMH_5htfhYC_1_hTavWJ6CUr1u2aV_2-MNxyiRBad2yiFYtyVaowyyVOgPpWG_ouHnbhUpUcLIrBqGdaP6qvP3hyTEUWC24zI4' }}
              style={styles.cardBackground}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  'rgba(25, 179, 230, 0.1)',
                  'rgba(17, 29, 33, 0.8)',
                ]}
                locations={[0, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View className="flex-col gap-3 justify-between p-4 flex-1">
                <View className="bg-primary/20 backdrop-blur-sm rounded-full w-12 h-12 items-center justify-center self-start">
                  <Icon name="mic" size={24} color="#19b3e6" />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold leading-tight w-full">Start Voice Session</Text>
                  <Text className="text-white/70 text-sm mt-1">Voice Therapy</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        <View className="flex-col gap-3 px-4 pb-2">
          <TouchableOpacity
            onPress={onJournalPress}
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            activeOpacity={0.98}
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
            <Icon name="chevron_right" size={24} color={isDark ? '#475569' : '#d1d5db'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onWellnessPress}
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            activeOpacity={0.98}
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
            <Icon name="chevron_right" size={24} color={isDark ? '#475569' : '#d1d5db'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onProfilePress}
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            activeOpacity={0.98}
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
            <Icon name="chevron_right" size={24} color={isDark ? '#475569' : '#d1d5db'} />
          </TouchableOpacity>
        </View>

        <View className="w-full">
          <Text className="text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6 text-neutral-900 dark:text-white">
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
                className="flex h-full flex-col gap-3 rounded-lg w-60 shrink-0"
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
                    <Text className="text-neutral-500 dark:text-[#93bac8] text-sm font-normal leading-normal">
                      {item.duration}
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

const styles = StyleSheet.create({
  headerTitle: {
    letterSpacing: -0.015 * 18, // tracking-[-0.015em] for text-lg (18px)
  },
  cardContainer: {
    flex: 1,
    aspectRatio: 4 / 5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonDark: {
    backgroundColor: '#1a2c32',
    shadowOpacity: 0,
    elevation: 0,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});
