import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  THERAPIST_TAB_BAR_FLOAT_GAP,
  THERAPIST_TAB_BAR_HEIGHT,
  THERAPIST_TAB_BAR_LEFT_PCT,
  THERAPIST_TAB_BAR_WIDTH_PCT,
} from '@/constants/therapistTabBar';

export default function TherapistTabLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset =
    Math.max(insets.bottom, THERAPIST_TAB_BAR_FLOAT_GAP) + THERAPIST_TAB_BAR_FLOAT_GAP;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#19b3e6',
        tabBarInactiveTintColor: '#7a8a8e',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.4,
          marginBottom: Platform.OS === 'ios' ? 2 : 0,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          marginLeft: THERAPIST_TAB_BAR_LEFT_PCT,
          marginRight: THERAPIST_TAB_BAR_LEFT_PCT,
          width: THERAPIST_TAB_BAR_WIDTH_PCT,
          bottom: bottomOffset,
          height: THERAPIST_TAB_BAR_HEIGHT,
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: 'rgba(10, 26, 31, 0.94)',
          borderRadius: 40,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.12)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 20,
        },
      }}>
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients/index"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat-bubble" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule/index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet/index"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-balance-wallet" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
