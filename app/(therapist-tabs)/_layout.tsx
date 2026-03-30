import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TherapistTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#19b3e6',
        tabBarInactiveTintColor: '#7a8a8e',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarStyle: {
          backgroundColor: '#0a1a1f',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          paddingBottom: 32,
          paddingTop: 12,
          height: 80,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: 'absolute',
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
