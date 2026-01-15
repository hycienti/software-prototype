import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';

interface ProfileScreenProps {
  onBack?: () => void;
  onMenu?: () => void;
  onEditProfile?: () => void;
  onViewAllAchievements?: () => void;
  onAccountPrivacy?: () => void;
  onConnectedApps?: () => void;
  onLogOut?: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  isCompleted: boolean;
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Breath',
    description: 'Completed 1st session',
    icon: 'mindfulness',
    iconColor: '#19b3e6',
    iconBgColor: 'rgba(25, 179, 230, 0.2)',
    isCompleted: true,
  },
  {
    id: '2',
    title: '7-Day Streak',
    description: 'Consistency is key',
    icon: 'emoji_events',
    iconColor: '#34d399',
    iconBgColor: 'rgba(52, 211, 153, 0.2)',
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Night Owl',
    description: 'Complete 3 night sessions',
    icon: 'nightlight',
    iconColor: '#94a3b8',
    iconBgColor: 'rgba(255, 255, 255, 0.05)',
    isCompleted: false,
  },
  {
    id: '4',
    title: 'Zen Master',
    description: '1000 minutes total',
    icon: 'self_improvement',
    iconColor: '#94a3b8',
    iconBgColor: 'rgba(255, 255, 255, 0.05)',
    isCompleted: false,
  },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onMenu,
  onEditProfile,
  onViewAllAchievements,
  onAccountPrivacy,
  onConnectedApps,
  onLogOut,
}) => {
  return (
    <View style={styles.container}>
      {/* Background Glow Gradient */}
      <View style={styles.glowGradient} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={onMenu} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="more_horiz" size={24} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={['#19b3e6', '#34d399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileImageGradient}
            >
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqscPX0fDlri7z4SicWC2XxNcR4lyce8YfqnbwZl7O4wZK1YAkJj5uphuPw4V2nAE4oNiLM8JsyB7gGK2kngEYE6RmJsfQYIZxECljj2RL0A0fhulEEFIchqXQ-mbFfbxyN2FXs36OWfyYn3nxc_dP4ana1lCMNPJop3E88rtuXajDnvoF8LfRgIBtlRzEiDI46UfqpimaWeWGRUC628oeNYiyRzPeN51pg1BX9rjC1hpWxGM-tBfTNxUo5ocGQY9ZmOCZrb447bI',
                }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </LinearGradient>
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditProfile}
              activeOpacity={0.7}
            >
              <View style={styles.editButtonInner}>
                <Icon name="edit" size={16} color="#111d21" />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Alex Morgan</Text>
          <View style={styles.joinBadge}>
            <Icon name="calendar_month" size={14} color="#19b3e6" />
            <Text style={styles.joinText}>Joined Jan 2026</Text>
          </View>
        </View>

        {/* Your Journey Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR JOURNEY</Text>
          <View style={styles.journeyCard}>
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.journeyCardContent}>
            <View style={styles.journeyStat}>
              <Text style={styles.journeyValue}>24</Text>
              <Text style={styles.journeyLabel}>
                Total{'\n'}Sessions
              </Text>
            </View>
            <View style={styles.journeyDivider} />
            <View style={styles.journeyStat}>
              <Text style={[styles.journeyValue, { color: '#34d399' }]}>12</Text>
              <Text style={styles.journeyLabel}>
                Journal{'\n'}Entries
              </Text>
            </View>
            <View style={styles.journeyDivider} />
            <View style={styles.journeyStat}>
              <View style={styles.streakRow}>
                <Text style={[styles.journeyValue, { color: '#19b3e6' }]}>5</Text>
                <Icon name="local_fire_department" size={18} color="#19b3e6" />
              </View>
              <Text style={styles.journeyLabel}>
                Longest{'\n'}Streak
              </Text>
            </View>
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
            <TouchableOpacity onPress={onViewAllAchievements} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.isCompleted && styles.achievementCardLocked,
                ]}
                activeOpacity={0.95}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.iconBgColor },
                  ]}
                >
                  <Icon
                    name={achievement.icon}
                    size={24}
                    color={achievement.isCompleted ? achievement.iconColor : 'rgba(255, 255, 255, 0.3)'}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.isCompleted && styles.achievementTitleLocked,
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.achievementDescription,
                    !achievement.isCompleted && styles.achievementDescriptionLocked,
                  ]}
                >
                  {achievement.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={onAccountPrivacy}
              activeOpacity={0.95}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="lock" size={20} color="rgba(255, 255, 255, 0.8)" />
                </View>
                <Text style={styles.settingText}>Account Privacy</Text>
              </View>
              <Icon name="chevron_right" size={20} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={onConnectedApps}
              activeOpacity={0.95}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="monitor_heart" size={20} color="rgba(255, 255, 255, 0.8)" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingText}>Connected Apps</Text>
                  <Text style={styles.settingSubtext}>Apple Health Active</Text>
                </View>
              </View>
              <Icon name="chevron_right" size={20} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logOutButton}
              onPress={onLogOut}
              activeOpacity={0.95}
            >
              <Text style={styles.logOutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
    position: 'relative',
  },
  glowGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(25, 179, 230, 0.15)',
    opacity: 0.5,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    position: 'relative',
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageGradient: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    borderWidth: 4,
    borderColor: '#111d21',
  },
  editButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#111d21',
    borderRadius: 9999,
    padding: 4,
  },
  editButtonInner: {
    backgroundColor: '#19b3e6',
    borderRadius: 9999,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  joinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  joinText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
    marginLeft: 4,
  },
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 32, // rounded-2xl = 2rem = 32px
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    position: 'relative',
  },
  journeyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    width: '100%',
  },
  journeyStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  journeyValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
  },
  journeyLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 14,
  },
  journeyDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#19b3e6',
    marginRight: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a2c32',
    borderRadius: 24, // rounded-xl = 1.5rem = 24px
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  achievementCardLocked: {
    backgroundColor: 'rgba(26, 44, 50, 0.5)',
    opacity: 0.8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  achievementDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  achievementDescriptionLocked: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  settingsList: {
    flexDirection: 'column',
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24, // rounded-xl = 1.5rem = 24px
    backgroundColor: '#1a2c32',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingContent: {
    flexDirection: 'column',
    gap: 2,
  },
  settingText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  settingSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: '#34d399',
  },
  logOutButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 24, // rounded-xl = 1.5rem = 24px
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 8,
  },
  logOutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f87171',
  },
  bottomSpacer: {
    height: 32,
  },
});
