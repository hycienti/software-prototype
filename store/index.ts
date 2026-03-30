/**
 * Zustand Store Configuration
 * Centralized state management for the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthToken } from '@/types/api';
import type { TherapistProfile } from '@/types/therapist';

// ============================================================================
// UI Store (for modals, alerts, etc.)
// ============================================================================

interface AlertModalState {
  visible: boolean;
  title: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
  buttons: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
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

export type UserRole = 'client' | 'therapist' | null;

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: AuthToken | null;
  role: UserRole;
  therapistProfile: TherapistProfile | null;
  isLoading: boolean;
  setAuth: (user: User, token: AuthToken) => Promise<void>;
  setTherapistAuth: (therapist: TherapistProfile, token: AuthToken) => Promise<void>;
  updateToken: (token: AuthToken) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateTherapistProfile: (data: Partial<TherapistProfile>) => void;
  clearAuth: () => Promise<void>;
  /** Remove only the therapist access token and therapist session state (used when that token is rejected). */
  clearTherapistSession: () => Promise<void>;
  /** Remove only the client access token and client session state. */
  clearClientSession: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

/** Legacy single key — migrated into split keys on first use. */
const LEGACY_AUTH_TOKEN_KEY = 'auth_token';
const AUTH_TOKEN_CLIENT_KEY = 'haven_auth_token_client';
const AUTH_TOKEN_THERAPIST_KEY = 'haven_auth_token_therapist';
const AUTH_USER_KEY = 'auth_user';

export { AUTH_TOKEN_CLIENT_KEY, AUTH_TOKEN_THERAPIST_KEY, LEGACY_AUTH_TOKEN_KEY };

let legacyAuthTokenMigrated = false;

async function migrateLegacyAuthTokenIfNeeded(): Promise<void> {
  if (legacyAuthTokenMigrated) return;
  legacyAuthTokenMigrated = true;
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
    if (!legacy) return;
    if (legacy.startsWith('oat_')) {
      const existing = await AsyncStorage.getItem(AUTH_TOKEN_THERAPIST_KEY);
      if (!existing) await AsyncStorage.setItem(AUTH_TOKEN_THERAPIST_KEY, legacy);
    } else if (legacy.startsWith('hvn_')) {
      const existing = await AsyncStorage.getItem(AUTH_TOKEN_CLIENT_KEY);
      if (!existing) await AsyncStorage.setItem(AUTH_TOKEN_CLIENT_KEY, legacy);
    }
    await AsyncStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  } catch (e) {
    console.warn('[auth] Legacy token migration failed', e);
  }
}

function normalizeApiV1Path(fullUrl: string): string {
  if (!fullUrl) return '';
  const idx = fullUrl.indexOf('/api/v1/');
  if (idx >= 0) {
    const rest = fullUrl.slice(idx + '/api/v1'.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  if (fullUrl.startsWith('/')) return fullUrl;
  return fullUrl;
}

function isPublicTherapistAuthPath(path: string): boolean {
  return (
    /\/therapist\/auth\/send-otp\b/.test(path) ||
    /\/therapist\/auth\/verify-otp\b/.test(path) ||
    /\/therapist\/auth\/onboard\b/.test(path) ||
    /\/therapist\/auth\/specialties\b/.test(path)
  );
}

function isTherapistPreferredPath(path: string): boolean {
  if (path.startsWith('/therapist/') && !isPublicTherapistAuthPath(path)) return true;
  if (path === '/sessions/test-room') return true;
  if (/\/sessions\/[^/]+\/create-room\b/.test(path)) return true;
  if (/\/sessions\/[^/]+\/summary\b/.test(path)) return true;
  return false;
}

function isClientPreferredPath(path: string): boolean {
  if (path.startsWith('/user/')) return true;
  if (path.startsWith('/conversations')) return true;
  if (path.startsWith('/gratitudes')) return true;
  if (path.startsWith('/moods')) return true;
  if (path.startsWith('/therapist-threads')) return true;
  if (path.startsWith('/payments')) return true;
  if (path.startsWith('/notifications')) return true;
  if (path.startsWith('/achievements')) return true;
  if (path.startsWith('/voice')) return true;
  if (path.startsWith('/auth/')) return true;
  if (path.startsWith('/therapists/') || path === '/therapists') return true;
  return false;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      role: null as UserRole,
      therapistProfile: null,
      isLoading: false,

      setAuth: async (user: User, token: AuthToken) => {
        try {
          await migrateLegacyAuthTokenIfNeeded();
          await AsyncStorage.setItem(AUTH_TOKEN_CLIENT_KEY, token.value);
          await AsyncStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);

          set({
            isAuthenticated: true,
            user,
            token,
            role: 'client',
            isLoading: false,
          });
        } catch (error) {
          console.error('Error setting auth:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      setTherapistAuth: async (therapist: TherapistProfile, token: AuthToken) => {
        try {
          await migrateLegacyAuthTokenIfNeeded();
          await AsyncStorage.setItem(AUTH_TOKEN_THERAPIST_KEY, token.value);
          await AsyncStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);

          set({
            isAuthenticated: true,
            user: null,
            therapistProfile: therapist,
            token,
            role: 'therapist',
            isLoading: false,
          });
        } catch (error) {
          console.error('Error setting therapist auth:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateToken: async (token: AuthToken) => {
        try {
          await migrateLegacyAuthTokenIfNeeded();
          const r = get().role;
          if (r === 'therapist') {
            await AsyncStorage.setItem(AUTH_TOKEN_THERAPIST_KEY, token.value);
          } else {
            await AsyncStorage.setItem(AUTH_TOKEN_CLIENT_KEY, token.value);
          }
          await AsyncStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
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

      updateTherapistProfile: (data: Partial<TherapistProfile>) => {
        const current = get().therapistProfile;
        if (current) {
          set({ therapistProfile: { ...current, ...data } });
        }
      },

      clearAuth: async () => {
        try {
          await AsyncStorage.multiRemove([
            AUTH_TOKEN_CLIENT_KEY,
            AUTH_TOKEN_THERAPIST_KEY,
            LEGACY_AUTH_TOKEN_KEY,
            AUTH_USER_KEY,
          ]);
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            role: null,
            therapistProfile: null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error clearing auth:', error);
        }
      },

      clearTherapistSession: async () => {
        try {
          await AsyncStorage.removeItem(AUTH_TOKEN_THERAPIST_KEY);
          if (get().role === 'therapist') {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              role: null,
              therapistProfile: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error clearing therapist session:', error);
        }
      },

      clearClientSession: async () => {
        try {
          await AsyncStorage.removeItem(AUTH_TOKEN_CLIENT_KEY);
          if (get().role === 'client') {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              role: null,
              therapistProfile: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error clearing client session:', error);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential auth state, not loading
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        role: state.role,
        therapistProfile: state.therapistProfile,
      }),
    }
  )
);

/**
 * Resolves which bearer token to send so therapist sessions are not overwritten by client login
 * and requests still work before Zustand has rehydrated.
 */
export async function getBearerTokenForApiRequest(
  fullRequestUrl: string,
  method?: string
): Promise<string | null> {
  await migrateLegacyAuthTokenIfNeeded();
  const role = useAuthStore.getState().role;
  const pickClient = () => AsyncStorage.getItem(AUTH_TOKEN_CLIENT_KEY);
  const pickTherapist = () => AsyncStorage.getItem(AUTH_TOKEN_THERAPIST_KEY);

  if (role === 'therapist') return pickTherapist();
  if (role === 'client') return pickClient();

  const path = normalizeApiV1Path(fullRequestUrl);
  const m = (method ?? 'GET').toUpperCase();
  if (isTherapistPreferredPath(path)) {
    return (await pickTherapist()) ?? (await pickClient());
  }
  if (isClientPreferredPath(path)) {
    return (await pickClient()) ?? (await pickTherapist());
  }
  if (path.startsWith('/sessions')) {
    if (m === 'POST' && path === '/sessions') {
      return (await pickClient()) ?? (await pickTherapist());
    }
    return (await pickTherapist()) ?? (await pickClient());
  }
  return (await pickClient()) ?? (await pickTherapist());
}

/** Clears only the session that matches the rejected bearer token (avoids wiping therapist when a stray client call 401s). */
export async function clearSessionForUnauthorizedRequest(authHeader: unknown): Promise<void> {
  if (typeof authHeader !== 'string' || !authHeader.toLowerCase().startsWith('bearer ')) {
    await useAuthStore.getState().clearAuth();
    return;
  }
  const raw = authHeader.slice(7).trim();
  if (raw.startsWith('oat_')) {
    await useAuthStore.getState().clearTherapistSession();
    return;
  }
  if (raw.startsWith('hvn_')) {
    await useAuthStore.getState().clearClientSession();
    return;
  }
  await useAuthStore.getState().clearAuth();
}
