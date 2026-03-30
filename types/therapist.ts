/**
 * Therapist-side type definitions
 * Types for the therapist portal features (dashboard, clients, wallet, etc.)
 */

// ============================================================================
// Therapist Profile & Auth
// ============================================================================

export type TherapistProfile = {
  id: number
  email: string
  fullName: string | null
  professionalTitle: string | null
  licenseUrl: string | null
  identityUrl: string | null
  specialties: string[] | null
  emailVerified: boolean
  acceptingNewClients?: boolean
  personalMeetingLink?: string | null
  availabilitySlots?: unknown[]
  lastLoginAt?: string | null
  createdAt?: string
}

export type TherapistVerifyOtpResponse = {
  therapist?: TherapistProfile
  token?: { type: string; value: string; expiresAt?: string }
  requiresOnboarding?: boolean
  email?: string
  emailVerified?: boolean
  message?: string
}

export type TherapistOnboardResponse = {
  therapist: TherapistProfile
  token: { type: string; value: string; expiresAt?: string }
}

export type TherapistOnboardPayload = {
  email: string
  fullName: string
  professionalTitle: string
  specialties: string[]
  licenseUrl?: string
  identityUrl?: string
}

export type DocumentUploadResponse = {
  licenseUrl?: string
  identityUrl?: string
  therapist?: TherapistProfile
}

/** Asset shape from expo-document-picker result.assets[0] */
export type PickedFile = {
  uri: string
  name: string
  size?: number
  mimeType?: string
}

/** Stored document reference during onboarding */
export type StoredDocument = {
  uri: string
  name: string
  size?: number
  mimeType?: string
  uploadedUrl?: string
}

// ============================================================================
// Dashboard
// ============================================================================

export type DashboardStats = {
  sessionsToday: number
  newRequests: number
  monthlyRevenue: string
  monthlyRevenueCents?: number
  balance: string
  balanceCents?: number
}

// ============================================================================
// Clients
// ============================================================================

export type ClientItem = {
  userId: number
  fullName: string | null
  email: string
  avatarUrl?: string | null
  lastSessionAt: string
  nextSessionAt: string | null
  sessionCount: number
}

export type ClientsListParams = {
  page?: number
  limit?: number
  search?: string
}

// ============================================================================
// Sessions (therapist-side)
// ============================================================================

export type TherapistSessionSummary = {
  id: number
  userId: number
  therapistId: number
  availabilitySlotId?: number | null
  scheduledAt: string
  durationMinutes: number
  status: string
  meetingId?: string | null
  sentiment?: string | null
  engagementLevel?: number | null
  clinicalNotes?: string | null
  followUpAt?: string | null
  summaryCompletedAt?: string | null
  user?: { id: number; fullName: string | null; email: string; avatarUrl?: string | null }
  therapist?: { id: number; fullName: string | null; professionalTitle: string | null }
}

export type SessionsListParams = {
  page?: number
  limit?: number
  status?: 'scheduled' | 'completed' | 'cancelled'
}

export type SessionSummaryPatchPayload = {
  sentiment?: string
  engagementLevel?: number
  clinicalNotes: string
  followUpAt?: string
}

// ============================================================================
// Pagination
// ============================================================================

export type ListMeta = {
  page: number
  limit: number
  total: number
}

// ============================================================================
// Wallet & Financial
// ============================================================================

export type WalletTransaction = {
  id: number
  amountCents: number
  amount: string
  type: string
  description: string | null
  sessionId: number | null
  createdAt: string
}

export type WalletWithdrawal = {
  id: number
  amountCents: number
  amount: string
  status: string
  requestedAt: string
  completedAt: string | null
}

export type WalletResponse = {
  balanceCents: number
  balance: string
  recentTransactions: WalletTransaction[]
  recentWithdrawals: WalletWithdrawal[]
  transactionsMeta?: ListMeta
  withdrawalsMeta?: ListMeta
}

export type WalletListParams = {
  transactionsPage?: number
  transactionsLimit?: number
  withdrawalsPage?: number
  withdrawalsLimit?: number
}

export type WithdrawResponse = {
  withdrawal?: { id: number }
  message?: string
  newBalanceCents?: number
  newBalance?: string
}

// ============================================================================
// Availability
// ============================================================================

/** Recurring slot: same time window on selected days of week (0 = Sun … 6 = Sat). */
export type RecurringAvailabilitySlot = {
  id?: string
  type?: 'recurring'
  label?: string
  days: number[]
  startTime: string
  endTime: string
}

/** One-off slot: specific date (YYYY-MM-DD). */
export type OneOffAvailabilitySlot = {
  id?: string
  type: 'one_off'
  label?: string
  date: string
  startTime: string
  endTime: string
}

export type AvailabilitySlot = RecurringAvailabilitySlot | OneOffAvailabilitySlot

export type AvailabilityResponse = {
  acceptingNewClients: boolean
  personalMeetingLink: string | null
  availabilitySlots: AvailabilitySlot[]
}

export type AvailabilityUpdatePayload = {
  acceptingNewClients?: boolean
  personalMeetingLink?: string
  availabilitySlots?: AvailabilitySlot[]
}

// ============================================================================
// Notifications
// ============================================================================

export type NotificationItem = {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  data?: unknown
  createdAt: string
}

export type NotificationsListParams = {
  page?: number
  limit?: number
  isRead?: boolean
}

// ============================================================================
// Threads (therapist-to-client messaging)
// ============================================================================

export type ThreadUser = {
  id: number
  fullName: string | null
  avatarUrl: string | null
}

export type ThreadMessage = {
  id: number
  threadId: number
  senderType: 'user' | 'therapist'
  body: string
  voiceUrl?: string | null
  attachmentUrls?: string[] | null
  createdAt: string
}

export type ThreadSummary = {
  id: number
  userId: number
  therapistId: number
  sessionId?: number
  session?: { id: number; scheduledAt: string; status: string }
  user: ThreadUser | null
  lastMessage: ThreadMessage | null
  createdAt: string
  updatedAt: string
}

export type ThreadWithMessages = {
  id: number
  userId: number
  therapistId: number
  sessionId?: number
  session?: { id: number; scheduledAt: string; status: string }
  user: ThreadUser | null
  createdAt: string
  updatedAt: string
}

export type ThreadListResponse = {
  threads: ThreadSummary[]
}

export type ThreadDetailResponse = {
  thread: ThreadWithMessages
  messages: ThreadMessage[]
  meta: ListMeta
}

export type SendThreadMessageRequest = {
  body?: string
  voiceUrl?: string | null
  attachmentUrls?: string[] | null
}

export type SendThreadMessageResponse = {
  message: ThreadMessage
}

// ============================================================================
// Type Guards
// ============================================================================

export function isRecurringSlot(slot: AvailabilitySlot): slot is RecurringAvailabilitySlot {
  return 'days' in slot && Array.isArray(slot.days)
}

export function isOneOffSlot(slot: AvailabilitySlot): slot is OneOffAvailabilitySlot {
  return slot.type === 'one_off' && 'date' in slot
}
