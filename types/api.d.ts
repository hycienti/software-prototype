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
  stream?: boolean;
}

/** 200: full response; 202: streaming accepted, completion via Pusher/polling */
export interface SendMessageResponse {
  conversation?: Conversation;
  message?: Message;
  response?: Message;
  sentiment?: SentimentAnalysis;
  /** Present when backend returns 202 (streaming accepted) */
  conversationId?: number;
  userMessageId?: number;
  status?: 'streaming';
}

export type StreamStatus = 'pending' | 'complete' | 'error';

export interface StreamStatusResponse {
  status: StreamStatus;
  chunks?: string[];
  fullContent?: string;
  messageId?: number;
  sentiment?: SentimentAnalysis;
  error?: string;
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
  async?: boolean;
}

export interface VoiceAsyncAcceptedResponse {
  jobId: string;
  status: 'processing';
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
  mostCommonThemes: { theme: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
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
  moodDistribution: { mood: string; count: number; percentage: number }[];
  weeklyTrend: { week: string; averageIntensity: number; dominantMood: string }[];
  monthlyTrend: { month: string; averageIntensity: number; dominantMood: string }[];
  patterns: { pattern: string; description: string; confidence: number }[];
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

// ============================================================================
// Session Types (user-facing)
// ============================================================================

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface SessionTherapist {
  id: number;
  fullName: string | null;
  professionalTitle: string | null;
}

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface UserTakeaways {
  mainTopics: string[];
  actionItems: string[];
  keyReflection: string | null;
}

export interface Session {
  id: number;
  userId: number;
  therapistId: number;
  availabilitySlotId: number | null;
  scheduledAt: string;
  durationMinutes: number;
  status: SessionStatus;
  meetingId: string | null;
  sentiment: string | null;
  engagementLevel: number | null;
  clinicalNotes: string | null;
  followUpAt: string | null;
  summaryCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: SessionUser;
  therapist?: SessionTherapist;
  userTakeaways?: UserTakeaways;
}

export interface SessionListResponse {
  sessions: Session[];
  meta: { page: number; limit: number; total: number };
}

export interface SessionResponse {
  session: Session;
}

export interface BookSessionRequest {
  therapistId: number;
  scheduledAt: string;
  durationMinutes?: number;
}

export interface SessionFeedbackRequest {
  rating: number;
  sentimentAfter: 'better' | 'same' | 'worse';
  comment?: string;
}

export interface SessionFeedbackResponse {
  feedback: { id: number; sessionId: number; rating: number; sentimentAfter: string; comment: string | null };
}

// ============================================================================
// Therapist Types (user-facing, safe fields only)
// ============================================================================

export interface TherapistForUser {
  id: number;
  fullName: string | null;
  professionalTitle: string | null;
  specialties: string[];
  acceptingNewClients: boolean;
  about: string | null;
  profilePhotoUrl: string | null;
  rateCents: number | null;
  education: string | null;
  yearsOfExperience: number | null;
}

export interface TherapistListResponse {
  therapists: TherapistForUser[];
  meta: { page: number; limit: number; total: number };
}

export interface TherapistResponse {
  therapist: TherapistForUser;
}

// ============================================================================
// Therapist thread / messaging (user–therapist)
// ============================================================================

export interface TherapistThreadTherapist {
  id: number;
  fullName: string | null;
  professionalTitle: string | null;
}

export interface TherapistThreadMessage {
  id: number;
  threadId: number;
  senderType: 'user' | 'therapist';
  body: string;
  createdAt: string;
}

export interface TherapistThreadSummary {
  id: number;
  userId: number;
  therapistId: number;
  therapist: TherapistThreadTherapist | null;
  lastMessage: TherapistThreadMessage | null;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistThreadWithMessages {
  id: number;
  userId: number;
  therapistId: number;
  therapist: TherapistThreadTherapist | null;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistThreadListResponse {
  threads: TherapistThreadSummary[];
}

export interface TherapistThreadDetailResponse {
  thread: TherapistThreadWithMessages;
  messages: TherapistThreadMessage[];
  meta: { page: number; limit: number; total: number };
}

export interface SendTherapistMessageRequest {
  body: string;
}

export interface SendTherapistMessageResponse {
  message: TherapistThreadMessage;
}

// ============================================================================
// User payments (mock payment + book session)
// ============================================================================

export interface CreatePaymentRequest {
  therapistId: number;
  amountCents: number;
  currency?: string;
  scheduledAt: string;
  durationMinutes?: number;
}

export interface PaymentRecord {
  id: number;
  userId: number;
  amountCents: number;
  currency: string;
  status: string;
  sessionId: number | null;
  therapistId: number | null;
  createdAt: string;
  updatedAt: string | null;
  therapist?: { id: number; fullName: string | null; professionalTitle: string | null };
}

export interface CreatePaymentResponse {
  payment: PaymentRecord;
  session: {
    id: number;
    userId: number;
    therapistId: number;
    availabilitySlotId: number | null;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
  };
}

export interface PaymentListResponse {
  payments: PaymentRecord[];
  meta: { page: number; limit: number; total: number };
}
