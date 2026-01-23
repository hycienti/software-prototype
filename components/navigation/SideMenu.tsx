import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/Icon';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = 300;

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onCrisisPress?: () => void;
  onTherapistPress?: () => void;
  onWellnessPress?: () => void;
  onCommunityPress?: () => void;
  onHelpPress?: () => void;
  onAboutPress?: () => void;
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'crisis';
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, variant = 'default' }) => {
  const [isPressed, setIsPressed] = useState(false);

  if (variant === 'crisis') {
    return (
      <TouchableOpacity
        style={styles.crisisItem}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.95}
      >
        <Icon name={icon} size={20} color="#f87171" />
        <Text style={styles.crisisItemText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.menuItem, isPressed && styles.menuItemPressed]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.95}
    >
      <Icon
        name={icon}
        size={20}
        color={isPressed ? '#19b3e6' : 'rgba(255, 255, 255, 0.5)'}
      />
      <Text style={[styles.menuItemText, isPressed && styles.menuItemTextPressed]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  onCrisisPress,
  onTherapistPress,
  onWellnessPress,
  onCommunityPress,
  onHelpPress,
  onAboutPress,
}) => {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-MENU_WIDTH);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withSpring(-MENU_WIDTH, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const menuStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(17, 29, 33, 0.6)' }]} />
          <BlurView intensity={2} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* Backdrop Touch Handler */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Side Menu */}
        <Animated.View
          style={[
            styles.menu,
            menuStyle,
            { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          {/* Background with blur */}
          <View style={[StyleSheet.absoluteFill, styles.menuBackground]} />
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 46, 53, 0.95)' }]} />
          <View style={[StyleSheet.absoluteFill, styles.borderRight]} />

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#19b3e6', '#34d399']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoIcon}
                >
                  <Icon name="spa" size={20} color="#111d21" />
                </LinearGradient>
                <Text style={styles.logoText}>Haven</Text>
              </View>
              <Text style={styles.tagline}>AI Therapy Companion</Text>
            </View>

            {/* Navigation */}
            <View style={styles.nav}>
              <MenuItem
                icon="emergency"
                label="Crisis Resources"
                onPress={() => {
                  onClose();
                  onCrisisPress?.();
                }}
                variant="crisis"
              />

              <MenuItem
                icon="psychology"
                label="Therapist Directory"
                onPress={() => {
                  onClose();
                  onTherapistPress?.();
                }}
              />

              <MenuItem
                icon="self_improvement"
                label="Wellness Library"
                onPress={() => {
                  onClose();
                  onWellnessPress?.();
                }}
              />

              <MenuItem
                icon="forum"
                label="Community Forums"
                onPress={() => {
                  onClose();
                  onCommunityPress?.();
                }}
              />

              {/* Divider */}
              <View style={styles.divider} />

              <MenuItem
                icon="help"
                label="Help & Support"
                onPress={() => {
                  onClose();
                  onHelpPress?.();
                }}
              />

              <MenuItem
                icon="info"
                label="About Haven"
                onPress={() => {
                  onClose();
                  onAboutPress?.();
                }}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.verifiedBadge}>
                <Icon name="verified_user" size={18} color="#34d399" />
                <Text style={styles.verifiedText}>Safe Space Verified</Text>
              </View>
              <Text style={styles.versionText}>App Version 2.4.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  menuBackground: {
    backgroundColor: 'rgba(15, 46, 53, 0.95)',
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 40,
    paddingLeft: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(25, 179, 230, 0.6)',
    letterSpacing: 0.5,
    paddingLeft: 44,
    textTransform: 'uppercase',
  },
  nav: {
    flex: 1,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.2,
  },
  menuItemTextPressed: {
    color: '#ffffff',
  },
  crisisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.1)',
    marginBottom: 8,
  },
  crisisItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#f87171',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 8,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingLeft: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(52, 211, 153, 0.9)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.2)',
    paddingLeft: 2,
  },
});
