/**
 * Zustand Store Configuration
 * Centralized state management for the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// UI Store (for modals, alerts, etc.)
// ============================================================================

interface AlertModalState {
  visible: boolean;
  title: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

interface UIStore {
  // Alert Modal
  alertModal: AlertModalState;
  showAlert: (config: {
    title: string;
    message: string;
    type?: AlertModalState['type'];
    buttons?: AlertModalState['buttons'];
  }) => void;
  hideAlert: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  alertModal: {
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK' }],
  },
  showAlert: (config) =>
    set({
      alertModal: {
        visible: true,
        title: config.title,
        message: config.message,
        type: config.type || 'info',
        buttons: config.buttons || [{ text: 'OK' }],
      },
    }),
  hideAlert: () =>
    set((state) => ({
      alertModal: {
        ...state.alertModal,
        visible: false,
      },
    })),
}));

// ============================================================================
// Conversation Store (optional - can be used alongside Context)
// ============================================================================

interface ConversationStore {
  currentConversationId: number | null;
  setCurrentConversationId: (id: number | null) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      currentConversationId: null,
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
    }),
    {
      name: 'conversation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================================
// Auth Store (optional - for auth state management)
// ============================================================================

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  setAuth: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      setAuth: (token) => set({ isAuthenticated: !!token, token }),
      clearAuth: () => set({ isAuthenticated: false, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
