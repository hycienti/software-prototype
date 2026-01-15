import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface NotificationsScreenProps {
  onBack?: () => void;
  onSettings?: () => void;
  onNotificationPress?: (id: string) => void;
  onClearAll?: () => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  isUnread?: boolean;
  section: 'today' | 'yesterday';
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'New Insight',
    description: "Your mood is trending up! You've maintained a positive streak for 3 days.",
    time: 'NOW',
    icon: 'trending_up',
    iconColor: '#34d399',
    iconBgColor: 'rgba(52, 211, 153, 0.1)',
    isUnread: true,
    section: 'today',
  },
  {
    id: '2',
    title: 'Haven',
    description: "It's time for your evening journal. How was your day?",
    time: '2h ago',
    icon: 'edit_note',
    iconColor: '#19b3e6',
    iconBgColor: 'rgba(25, 179, 230, 0.1)',
    section: 'today',
  },
  {
    id: '3',
    title: 'Reminder',
    description: 'You have a consultation with Dr. Sarah tomorrow at 10:00 AM.',
    time: '4h ago',
    icon: 'videocam',
    iconColor: '#a78bfa',
    iconBgColor: 'rgba(167, 139, 250, 0.1)',
    section: 'today',
  },
  {
    id: '4',
    title: 'Goal Achieved',
    description: 'You completed your weekly mindfulness goal. Great job!',
    time: '1d ago',
    icon: 'self_improvement',
    iconColor: '#fb923c',
    iconBgColor: 'rgba(251, 146, 60, 0.1)',
    section: 'yesterday',
  },
  {
    id: '5',
    title: 'App Update',
    description: 'Haven has been updated to version 2.1. See what\'s new.',
    time: '1d ago',
    icon: 'security_update_good',
    iconColor: '#94a3b8',
    iconBgColor: 'rgba(148, 163, 184, 0.1)',
    section: 'yesterday',
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onSettings,
  onNotificationPress,
  onClearAll,
}) => {
  // Pulse animation for unread indicator
  const pulseScale = useSharedValue(1);
  
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const todayNotifications = notifications.filter((n) => n.section === 'today');
  const yesterdayNotifications = notifications.filter((n) => n.section === 'yesterday');

  return (
    <View style={styles.container}>
      {/* Background Glow Gradient */}
      <View style={styles.glowGradient} />

      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="arrow_back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={onSettings} style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          {todayNotifications.length > 0 && (
            <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.notificationsList}>
          {todayNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationCard}
              onPress={() => onNotificationPress?.(notification.id)}
              activeOpacity={0.95}
            >
              {notification.isUnread && (
                <Animated.View style={[styles.unreadIndicator, pulseStyle]}>
                  <View style={styles.unreadDot} />
                </Animated.View>
              )}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: notification.iconBgColor },
                ]}
              >
                <Icon name={notification.icon} size={24} color={notification.iconColor} />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                <Text style={styles.notificationDescription}>{notification.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Yesterday Section */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>YESTERDAY</Text>
        </View>

        <View style={styles.notificationsList}>
          {yesterdayNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, styles.notificationCardRead]}
              onPress={() => onNotificationPress?.(notification.id)}
              activeOpacity={0.95}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: notification.iconBgColor },
                ]}
              >
                <Icon name={notification.icon} size={24} color={notification.iconColor} />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                <Text style={styles.notificationDescription}>{notification.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Gradient Fade */}
      <LinearGradient
        colors={['transparent', 'rgba(17, 29, 33, 0.8)', '#111d21']}
        locations={[0, 0.5, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
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
    height: 400,
    backgroundColor: 'rgba(25, 179, 230, 0.15)',
    opacity: 0.5,
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(17, 29, 33, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#19b3e6',
  },
  notificationsList: {
    flexDirection: 'column',
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  notificationCardRead: {
    opacity: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#19b3e6',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12, // rounded-xl = 0.75rem = 12px
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  notificationTime: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#94a3b8',
    marginLeft: 8,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#cbd5e1',
  },
  bottomSpacer: {
    height: 80,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    zIndex: 5,
    pointerEvents: 'none',
  },
});
