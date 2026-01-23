/**
 * Zustand Store Configuration
 * Centralized state management for the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthToken } from '@/types/api';

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
// Auth Store (for auth state management)
// ============================================================================

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: AuthToken | null;
  isLoading: boolean;
  setAuth: (user: User, token: AuthToken) => Promise<void>;
  updateToken: (token: AuthToken) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,

      setAuth: async (user: User, token: AuthToken) => {
        try {
          // Store token in AsyncStorage for API client interceptor
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, token.value);
          
          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error setting auth:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateToken: async (token: AuthToken) => {
        try {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, token.value);
          set({ token });
        } catch (error) {
          console.error('Error updating token:', error);
          throw error;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      clearAuth: async () => {
        try {
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          await AsyncStorage.removeItem(AUTH_USER_KEY);
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error clearing auth:', error);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user and token, not loading state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
