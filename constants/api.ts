/**
 * API Configuration and Endpoints
 */

/**
 * Validate environment configuration
 * Logs warnings for missing optional configs and errors for critical missing configs
 */
const validateEnvironment = () => {
  const warnings: string[] = []
  const errors: string[] = []

  // API URL validation
  const apiUrl = process.env.EXPO_PUBLIC_API_URL
  if (!apiUrl) {
    warnings.push(
      'EXPO_PUBLIC_API_URL is not set. Using default: http://localhost:3333'
    )
  } else {
    try {
      new URL(apiUrl)
    } catch {
      errors.push(`EXPO_PUBLIC_API_URL is invalid: ${apiUrl}`)
    }
  }

  // Email service validation (optional but recommended)
  // Note: RESEND_API_KEY is configured on the backend

  // Log warnings and errors
  if (warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:', warnings)
  }
  if (errors.length > 0) {
    console.error('❌ Environment Configuration Errors:', errors)
    throw new Error(
      `Environment configuration errors detected:\n${errors.join('\n')}`
    )
  }

  if (warnings.length === 0 && errors.length === 0) {
    console.log('✅ Environment configuration validated successfully')
  }
}

// Validate on module load (only in development)
if (__DEV__) {
  validateEnvironment()
}

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333',
  API_VERSION: 'v1',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    COMPLETE_SIGNUP: '/auth/complete-signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
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
