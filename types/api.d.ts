/**
 * API Type Definitions
 * Centralized type definitions for all API services
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiError {
  message: string;
  status: number;
  data: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

export interface Conversation {
  id: number;
  title: string | null;
  mode: 'text' | 'voice';
  messageCount?: number;
  lastMessageAt: string | null;
  createdAt: string;
  messages?: Message[];
}

export interface SendMessageRequest {
  conversationId?: number;
  message: string;
  mode?: 'text' | 'voice';
}

export interface SendMessageResponse {
  conversation: Conversation;
  message: Message;
  response: Message;
  sentiment?: SentimentAnalysis;
}

export interface ConversationHistoryResponse {
  conversations: (Conversation & { messages: Message[] })[];
  pagination: PaginationResponse;
}

export interface ConversationResponse {
  conversation: Conversation;
  messages: Message[];
  pagination?: PaginationResponse;
}

// ============================================================================
// Sentiment Analysis Types
// ============================================================================

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  crisisIndicators: string[];
  confidence: number;
}

// ============================================================================
// Voice Types
// ============================================================================

export interface ProcessVoiceMessageRequest {
  conversationId?: number;
  audioData: string; // Base64 encoded audio
  audioFormat?: 'mp3' | 'wav' | 'm4a' | 'ogg';
  language?: string;
}

export interface ProcessVoiceMessageResponse {
  conversation: {
    id: number;
    title: string | null;
    mode: 'voice';
    createdAt: string;
  };
  transcript: string;
  response: {
    id: number;
    content: string;
    metadata?: Record<string, any>;
  };
  audioData: string; // Base64 encoded audio
  audioFormat: 'mp3';
  sentiment?: SentimentAnalysis;
}

export interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  conversationId?: number;
}

export interface TextToSpeechResponse {
  audioData: string; // Base64 encoded audio
  audioFormat: 'mp3';
}

// ============================================================================
// Streaming Types
// ============================================================================

export interface StreamingMessageEvent {
  type: 'start' | 'chunk' | 'complete' | 'error';
  conversationId?: number;
  messageId?: number;
  content?: string;
  sentiment?: SentimentAnalysis;
  message?: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface User {
  id: number;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

// Gratitude Types
export interface Gratitude {
  id: number;
  entries: string[];
  photoUrl: string | null;
  entryDate: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateGratitudeRequest {
  entries: string[];
  photoUrl?: string;
  entryDate?: string;
  metadata?: Record<string, any>;
}

export interface UpdateGratitudeRequest {
  entries?: string[];
  photoUrl?: string;
  metadata?: Record<string, any>;
}

export interface GratitudeResponse {
  gratitude: Gratitude;
}

export interface GratitudeListResponse {
  data: Gratitude[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface GratitudeStreakResponse {
  streak: number;
  lastEntryDate: string | null;
}

export interface GratitudeInsights {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  entriesThisMonth: number;
  entriesLastMonth: number;
  mostCommonThemes: Array<{ theme: string; count: number }>;
  monthlyTrend: Array<{ month: string; count: number }>;
  aiInsights?: {
    weeklySummary: string;
    keyPatterns: string[];
    growthObservations: string[];
    gentleSuggestions: string[];
  };
}

export interface GratitudeQuote {
  text: string;
  author: string;
}

// Achievement Types
export interface Achievement {
  id: number;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  iconColor: string | null;
  iconBgColor: string | null;
  threshold: number | null;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface AchievementListResponse {
  data: Achievement[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export interface AchievementResponse {
  achievement: Achievement;
}

// Mood Types
export type MoodType = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry';

export interface Mood {
  id: number;
  mood: MoodType;
  intensity: number;
  notes: string | null;
  photoUrl: string | null;
  entryDate: string;
  tags: string[] | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateMoodRequest {
  mood: MoodType;
  intensity: number;
  notes?: string;
  photoUrl?: string;
  entryDate?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateMoodRequest {
  mood?: MoodType;
  intensity?: number;
  notes?: string;
  photoUrl?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MoodResponse {
  mood: Mood;
}

export interface MoodListResponse {
  data: Mood[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface MoodStreakResponse {
  streak: number;
  lastEntryDate: string | null;
}

export interface MoodInsights {
  totalEntries: number;
  averageIntensity: number;
  moodDistribution: Array<{ mood: string; count: number; percentage: number }>;
  weeklyTrend: Array<{ week: string; averageIntensity: number; dominantMood: string }>;
  monthlyTrend: Array<{ month: string; averageIntensity: number; dominantMood: string }>;
  patterns: Array<{ pattern: string; description: string; confidence: number }>;
  streak: number;
  aiInsights?: {
    weeklySummary: string;
    keyPatterns: string[];
    emotionalInsights: string[];
    supportiveSuggestions: string[];
  };
}

export interface AuthToken {
  type: 'bearer';
  value: string;
  expiresAt: string | null;
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number; // seconds
}

export interface VerifyOtpRequest {
  email: string;
  code: string; // 6-digit code
}

export interface VerifyOtpResponse {
  requiresSignup: boolean;
  email?: string;
  user?: User;
  token?: AuthToken;
  message?: string;
}

export interface CompleteSignupRequest {
  email: string;
  fullName: string;
}

export interface CompleteSignupResponse {
  user: User;
  token: AuthToken;
}

export interface RefreshTokenResponse {
  token: AuthToken;
}

export interface LogoutResponse {
  message: string;
}
