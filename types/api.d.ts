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
