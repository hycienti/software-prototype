/**
 * API Configuration and Endpoints
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333',
  API_VERSION: 'v1',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
    APPLE: '/auth/apple',
    PROFILE: '/auth/profile',
  },

  // Conversations
  CONVERSATIONS: {
    BASE: '/conversations',
    MESSAGE: '/conversations/message',
    HISTORY: '/conversations/history',
    STREAM: (id: number) => `/conversations/stream/${id}`,
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

  // WebSocket
  WEBSOCKET: {
    STREAMING: '/streaming',
  },
} as const;

/**
 * Get full API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
};

/**
 * Get WebSocket URL
 */
export const getWebSocketUrl = (path: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  return `${wsUrl}${path}`;
};
