import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store';
import { useUserProfile } from '@/hooks/useUser';
import { getFirstName, getGreeting } from '@/utils/user';
import { SideMenu } from '@/components/navigation/SideMenu';
import { useRouter } from 'expo-router';

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
  {
    id: '4',
    title: 'Gratitude Practice',
    type: 'gratitude',
    duration: 'Practice',
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXzIYxK9o-pXxamDelLb4ZRuSVsAdysdUoR7eGR70VuA1Z9h1p1hOiBG7ZXgV7vTYMf8Ic96z8U-5mWpZAXbpHW7Wez7RuN6N1h7-EbnWVN6id2CKAw4wcOI_oIzhF-EFsNfuWew70h5HLg7yktTzt4XvwETiKCqhMAdcOfFiyNzfoGDUwpd2kfGe46X1y-jsRuLGVRVQOcFDgu7wiTBOC4zFa0NhA-Yr91Jylzb3HHqyJmC9JOq4vapThpK4FrC5kN782eRGKvEQ',
  },
];

interface HomeScreenProps {
  onChatPress?: () => void;
  onVoicePress?: () => void;
  onJournalPress?: () => void;
  onWellnessPress?: () => void;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onRecommendationPress?: (id: string, type: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onChatPress,
  onVoicePress,
  onJournalPress,
  onWellnessPress,
  onProfilePress,
  onNotificationsPress,
  onRecommendationPress,
}) => {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { user: authUser, updateUser } = useAuthStore();
  const { data: userProfile } = useUserProfile();
  const lastSyncedProfileId = React.useRef<number | null>(null);

  // Update auth store when profile data is fetched (only once per profile update)
  React.useEffect(() => {
    if (userProfile && authUser && userProfile.id === authUser.id) {
      // Only sync if this is a new profile fetch (different ID or first time)
      if (lastSyncedProfileId.current !== userProfile.id) {
        // Only update if the data has actually changed
        const hasChanged = 
          userProfile.fullName !== authUser.fullName ||
          userProfile.email !== authUser.email ||
          userProfile.avatarUrl !== authUser.avatarUrl ||
          userProfile.emailVerified !== authUser.emailVerified;
        
        if (hasChanged) {
          updateUser(userProfile);
        }
        lastSyncedProfileId.current = userProfile.id;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id, userProfile?.fullName, userProfile?.email, userProfile?.avatarUrl, userProfile?.emailVerified]);

  // Use profile data if available, otherwise fall back to auth store user
  const user = userProfile || authUser;
  const firstName = getFirstName(user?.fullName);
  const greeting = getGreeting();

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Dark Gradient Background */}
      <View style={StyleSheet.absoluteFill} className="bg-background-dark">
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
        <View style={[styles.backgroundBlob1, { backgroundColor: 'rgba(25, 179, 230, 0.1)' }]} />
        <View style={[styles.backgroundBlob2, { backgroundColor: 'rgba(88, 28, 135, 0.15)' }]} />
        <View style={[styles.backgroundBlob3, { backgroundColor: 'rgba(79, 209, 197, 0.08)' }]} />
      </View>

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="menu" size={30} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haven</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onNotificationsPress}
          activeOpacity={0.7}
        >
          <Icon name="notifications" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Side Menu */}
      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onCrisisPress={() => {
          // TODO: Navigate to crisis resources
          console.log('Crisis Resources pressed');
        }}
        onTherapistPress={() => {
          router.push('/therapists');
        }}
        onWellnessPress={() => {
          onWellnessPress?.();
        }}
        onCommunityPress={() => {
          // TODO: Navigate to community forums
          console.log('Community Forums pressed');
        }}
        onHelpPress={() => {
          // TODO: Navigate to help & support
          console.log('Help & Support pressed');
        }}
        onAboutPress={() => {
          // TODO: Navigate to about page
          console.log('About Haven pressed');
        }}
      />

      <ScrollView className="relative z-10 flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full">
          <Text style={styles.greetingText}>
            {greeting}, {firstName}.{'\n'}How are you feeling today?
          </Text>
        </View>

        <View className="flex-row gap-3 p-4" style={{ gap: 12 }}>
          <TouchableOpacity onPress={onChatPress} style={styles.cardContainer} activeOpacity={0.98}>
            <ImageBackground
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0TwLPJpFyltvNxAuh1BsiBUyH-Ednt2kwON5bpeunYV-by92Z0v858XJUU8ZlmWUngH1YsUoZTciiTg8BW8lJ0IYIfxYyA-RAy9nlZHebz6K35xV3apvZMfr60wyefj9EVh_TMhbzI3zg68U6oH5lHQkHaGgm47Tt1CJA31HZ7GmRqObgXi3hrX7C_W8EZSJd4gMzE94KaqaRGY8nkmPbE0WlXNHdyqRcvdSmJleaEmBdZP97hDHc4oyTsKLqL7vcrmq_3-FCjBI',
              }}
              style={styles.cardBackground}
              resizeMode="cover">
              <LinearGradient
                colors={['rgba(25, 179, 230, 0.1)', 'rgba(17, 29, 33, 0.8)']}
                locations={[0, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardContent}>
                <BlurView intensity={20} tint="light" style={styles.iconContainer}>
                  <Icon name="chat_bubble" size={24} color="#19b3e6" />
                </BlurView>
                <View>
                  <Text style={styles.cardTitle}>Chat with Haven</Text>
                  <Text style={styles.cardSubtitle}>Text Therapy</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onVoicePress}
            style={styles.cardContainer}
            activeOpacity={0.98}>
            <ImageBackground
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8cfC6f-LljcQVvCnJ8V_MUx9KADPkXsVCfVN_4bA5mB-5LvavqE7ekpKlrmG1KsMujfz5d6um4pSlFRqD11YKQ6NSbiQXwjb0-oXCSB6C5B2KP0-lrAUvlMqVoiCUQ580Pf_c0p3MKL-IsDeWNzytIqPSjcd6zHzJSLXmvm-uaVMH_5htfhYC_1_hTavWJ6CUr1u2aV_2-MNxyiRBad2yiFYtyVaowyyVOgPpWG_ouHnbhUpUcLIrBqGdaP6qvP3hyTEUWC24zI4',
              }}
              style={styles.cardBackground}
              resizeMode="cover">
              <LinearGradient
                colors={['rgba(25, 179, 230, 0.1)', 'rgba(17, 29, 33, 0.8)']}
                locations={[0, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardContent}>
                <BlurView intensity={20} tint="light" style={styles.iconContainer}>
                  <Icon name="mic" size={24} color="#19b3e6" />
                </BlurView>
                <View>
                  <Text style={styles.cardTitle}>Start Voice Session</Text>
                  <Text style={styles.cardSubtitle}>Voice Therapy</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        <View className="flex-col gap-3 px-4 pb-2" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={onJournalPress}
            style={styles.actionButtonDark}
            activeOpacity={0.98}>
            <View style={styles.actionIconContainer}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <Icon name="book_2" size={24} color="#f97316" />
              </View>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Mood Journal</Text>
              <Text style={styles.actionSubtitle}>Log your daily thoughts</Text>
            </View>
            <Icon name="chevron_right" size={24} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onWellnessPress}
            style={styles.actionButtonDark}
            activeOpacity={0.98}>
            <View style={styles.actionIconContainer}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Icon name="self_improvement" size={24} color="#10b981" />
              </View>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Wellness Exercises</Text>
              <Text style={styles.actionSubtitle}>Body and mind activities</Text>
            </View>
            <Icon name="chevron_right" size={24} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onProfilePress}
            style={styles.actionButtonDark}
            activeOpacity={0.98}>
            <View style={styles.actionIconContainer}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Icon name="person" size={24} color="#8b5cf6" />
              </View>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Your Profile</Text>
              <Text style={styles.actionSubtitle}>Settings and preferences</Text>
            </View>
            <Icon name="chevron_right" size={24} color="#475569" />
          </TouchableOpacity>
        </View>

        <View className="w-full">
          <Text style={styles.recommendedTitle}>Recommended for You</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recommendationsScroll}>
          <View style={styles.recommendationsContainer}>
            {recommendations.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onRecommendationPress?.(item.id, item.type)}
                style={styles.recommendationCard}>
                <View style={styles.recommendationImageContainer}>
                  {item.imageUri && (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.recommendationImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.recommendationOverlay} />
                  {(item.type === 'audio' || item.type === 'video') && (
                    <View style={styles.playButtonContainer}>
                      <BlurView intensity={40} tint="light" style={styles.playButton}>
                        <Icon name="play_arrow" size={24} color="#fff" />
                      </BlurView>
                    </View>
                  )}
                </View>
                <View>
                  <Text style={styles.recommendationTitle}>{item.title}</Text>
                  <View style={styles.recommendationMeta}>
                    <Icon
                      name={
                        item.type === 'audio'
                          ? 'headphones'
                          : item.type === 'video'
                            ? 'videocam'
                            : item.type === 'gratitude'
                            ? 'favorite'
                            : 'article'
                      }
                      size={16}
                      color="#19b3e6"
                    />
                    <Text style={styles.recommendationDuration}>{item.duration}</Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 10,
  },
  headerTitle: {
    letterSpacing: -0.015 * 18, // tracking-[-0.015em] for text-lg (18px)
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
    textAlign: 'left',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundBlob1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.5,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: '20%',
    right: '-5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.5,
  },
  backgroundBlob3: {
    position: 'absolute',
    top: '40%',
    right: '10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.3,
  },
  cardContainer: {
    flex: 1,
    aspectRatio: 4 / 5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'space-between',
    padding: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: 'rgba(25, 179, 230, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.3)',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#ffffff',
    width: '100%',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonDark: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1a2c32',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(148, 163, 184, 0.85)',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.015 * 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 24,
    color: '#ffffff',
  },
  recommendationsScroll: {
    width: '100%',
    paddingBottom: 32,
  },
  recommendationsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 0,
  },
  recommendationCard: {
    flexDirection: 'column',
    gap: 12,
    borderRadius: 8,
    width: 240, // w-60 = 15rem = 240px
    flexShrink: 0,
  },
  recommendationImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
  },
  recommendationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recommendationDuration: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#93bac8',
  },
});
