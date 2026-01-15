import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BoxBreathingSettings {
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  hapticFeedback: boolean;
  voiceGuidance: boolean;
  enableMusic: boolean;
  selectedMusic: 'rain' | 'forest' | 'zen';
}

const DEFAULT_SETTINGS: BoxBreathingSettings = {
  inhaleDuration: 4,
  holdDuration: 4,
  exhaleDuration: 6,
  hapticFeedback: true,
  voiceGuidance: false,
  enableMusic: true,
  selectedMusic: 'rain',
};

const SETTINGS_STORAGE_KEY = '@box_breathing_settings';

interface BoxBreathingSettingsContextType {
  settings: BoxBreathingSettings;
  updateSettings: (newSettings: Partial<BoxBreathingSettings>) => void;
  resetSettings: () => void;
}

const BoxBreathingSettingsContext = createContext<BoxBreathingSettingsContextType | undefined>(
  undefined
);

export const BoxBreathingSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BoxBreathingSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<BoxBreathingSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <BoxBreathingSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </BoxBreathingSettingsContext.Provider>
  );
};

export const useBoxBreathingSettings = () => {
  const context = useContext(BoxBreathingSettingsContext);
  if (!context) {
    throw new Error('useBoxBreathingSettings must be used within BoxBreathingSettingsProvider');
  }
  return context;
};
