import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  
  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];
    
    if (localhost) {
      return `http://${localhost}:3333`;
    }
  }

  return 'http://localhost:3333';
};


const validateEnvironment = () => {
  const warnings: string[] = []
  const errors: string[] = []

  const apiUrl = getBaseUrl()
  
  if (!process.env.EXPO_PUBLIC_API_URL && apiUrl === 'http://localhost:3333') {
     warnings.push(
      'EXPO_PUBLIC_API_URL is not set. Using default: http://localhost:3333'
    )
  }

  
  if (warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:', warnings)
  }
  
  console.log(`✅ Using API URL: ${apiUrl}`);
}

if (__DEV__) {
  validateEnvironment()
}

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  API_VERSION: 'v1',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {

  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    COMPLETE_SIGNUP: '/auth/complete-signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // User
  USER: {
    ME: '/user/me',
    UPDATE: '/user/me',
    DELETE: '/user/me',
  },

  // Gratitude
  GRATITUDE: {
    BASE: '/gratitudes',
    UPLOAD_PHOTO: '/gratitudes/upload-photo',
    STREAK: '/gratitudes/streak',
    INSIGHTS: '/gratitudes/insights',
    RANDOM_QUOTE: '/gratitudes/quotes/random',
    BY_ID: (id: number) => `/gratitudes/${id}`,
  },

  // Achievements
  ACHIEVEMENTS: {
    BASE: '/achievements',
    BY_ID: (id: number) => `/achievements/${id}`,
  },

  // Mood
  MOOD: {
    BASE: '/moods',
    STREAK: '/moods/streak',
    INSIGHTS: '/moods/insights',
    BY_ID: (id: number) => `/moods/${id}`,
  },

  // Conversations
  CONVERSATIONS: {
    BASE: '/conversations',
    MESSAGE: '/conversations/message',
    HISTORY: '/conversations/history',
    STREAM_STATUS: '/conversations/stream/status',
    BY_ID: (id: number) => `/conversations/${id}`,
    DELETE: (id: number) => `/conversations/${id}`,
  },

  // Voice
  VOICE: {
    BASE: '/voice',
    PROCESS: '/voice/process',
    TTS: '/voice/tts',
    STT: '/voice/stt',
  },

  // Sessions (user)
  SESSIONS: {
    BASE: '/sessions',
    BY_ID: (id: number) => `/sessions/${id}`,
    FEEDBACK: (id: number) => `/sessions/${id}/feedback`,
    JOIN_ROOM: (id: number) => `/sessions/${id}/join-room`,
  },

  // User-facing therapists (list and detail)
  THERAPISTS: {
    BASE: '/therapists',
    BY_ID: (id: number) => `/therapists/${id}`,
    BOOKABLE_SLOTS: (id: number) => `/therapists/${id}/bookable-slots`,
  },

  // Therapist–user messaging
  THERAPIST_THREADS: {
    BASE: '/therapist-threads',
    UPLOAD: '/therapist-threads/upload',
    BY_ID: (id: number) => `/therapist-threads/${id}`,
    MESSAGES: (threadId: number) => `/therapist-threads/${threadId}/messages`,
  },

  // User payments (mock payment + book session, list)
  PAYMENTS: {
    BASE: '/payments',
  },
} as const;

/**
 * Get full API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
};
