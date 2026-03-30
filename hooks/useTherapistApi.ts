/**
 * Therapist portal React Query hooks
 * All requests go through services/therapist/*; auth token is handled by Axios interceptor.
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store'
import * as therapistAuthService from '@/services/therapist/auth'
import * as dashboardService from '@/services/therapist/dashboard'
import * as clientsService from '@/services/therapist/clients'
import * as availabilityService from '@/services/therapist/availability'
import * as sessionsService from '@/services/therapist/sessions'
import * as walletService from '@/services/therapist/wallet'
import * as notificationsService from '@/services/therapist/notifications'
import * as threadsService from '@/services/therapist/threads'
import type {
  SessionsListParams,
  ClientsListParams,
  NotificationsListParams,
  WalletListParams,
  AvailabilityUpdatePayload,
  SessionSummaryPatchPayload,
  SendThreadMessageRequest,
  PickedFile,
} from '@/types/therapist'

// Re-export param types for consumers
export type {
  SessionsListParams,
  ClientsListParams,
  NotificationsListParams,
  WalletListParams,
}

function useIsTherapistAuth() {
  const { isAuthenticated, role } = useAuthStore()
  return isAuthenticated && role === 'therapist'
}

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

// --- Query keys
export const therapistQueryKeys = {
  dashboard: ['therapist', 'dashboard'] as const,
  sessions: (params?: SessionsListParams) => ['therapist', 'sessions', params ?? {}] as const,
  session: (id: string | number) => ['therapist', 'session', id] as const,
  clients: (params?: ClientsListParams) => ['therapist', 'clients', params ?? {}] as const,
  wallet: (params?: WalletListParams) => ['therapist', 'wallet', params ?? {}] as const,
  me: ['therapist', 'me'] as const,
  availability: ['therapist', 'availability'] as const,
  notifications: (params?: NotificationsListParams) => ['therapist', 'notifications', params ?? {}] as const,
  specialties: ['therapist', 'specialties'] as const,
  threads: {
    list: ['therapist', 'threads', 'list'] as const,
    thread: (id: string | number) => ['therapist', 'threads', 'thread', id] as const,
    threadByUser: (userId: number) => ['therapist', 'threads', 'byUser', userId] as const,
    threadBySession: (sessionId: number) => ['therapist', 'threads', 'bySession', sessionId] as const,
  },
}

// --- Dashboard
export function useTherapistDashboard() {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: [...therapistQueryKeys.dashboard],
    queryFn: () => dashboardService.getDashboard(),
    enabled,
  })
  return {
    data: q.data ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchDashboard: q.refetch,
  }
}

// --- Sessions
export function useTherapistSessions(params?: SessionsListParams) {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: therapistQueryKeys.sessions(params),
    queryFn: () => sessionsService.getSessions(params),
    enabled,
  })
  return {
    sessions: q.data?.sessions ?? [],
    meta: q.data?.meta ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchSessions: q.refetch,
  }
}

export function useTherapistSession(sessionId: string | number | null) {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: therapistQueryKeys.session(sessionId ?? ''),
    queryFn: () => sessionsService.getSession(sessionId!),
    enabled: enabled && sessionId != null,
  })
  return {
    session: q.data ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchSession: q.refetch,
  }
}

export function useTherapistCreateRoom(sessionId: string | number | null) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => {
      if (sessionId == null) throw new Error('Session ID required')
      return sessionsService.createRoom(sessionId)
    },
    onSuccess: () => {
      if (sessionId != null) {
        queryClient.invalidateQueries({ queryKey: therapistQueryKeys.session(sessionId) })
      }
    },
  })
  return {
    createRoom: mutation.mutate,
    meetingId: mutation.data?.meetingId ?? null,
    videoToken: mutation.data?.token ?? null,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}

export function useTherapistCreateTestRoom() {
  const mutation = useMutation({
    mutationFn: () => sessionsService.createTestRoom(),
  })
  return {
    createTestRoom: mutation.mutateAsync,
    meetingId: mutation.data?.meetingId ?? null,
    videoToken: mutation.data?.token ?? null,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}

export function useTherapistPatchSessionSummary(sessionId: string | number | null) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: SessionSummaryPatchPayload) => {
      if (sessionId == null) throw new Error('Session ID required')
      return sessionsService.patchSessionSummary(sessionId, payload)
    },
    onSuccess: () => {
      if (sessionId != null) {
        queryClient.invalidateQueries({ queryKey: therapistQueryKeys.session(sessionId) })
        queryClient.invalidateQueries({ queryKey: ['therapist', 'sessions'] })
      }
    },
  })
  return {
    patchSummary: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}

// --- Clients
export function useTherapistClients(params?: ClientsListParams) {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: therapistQueryKeys.clients(params),
    queryFn: () => clientsService.getClients(params),
    enabled,
  })
  return {
    clients: q.data?.clients ?? [],
    meta: q.data?.meta ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchClients: q.refetch,
  }
}

// --- Wallet
export function useTherapistWallet(params?: WalletListParams) {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: therapistQueryKeys.wallet(params),
    queryFn: () => walletService.getWallet(params),
    enabled,
  })
  return {
    data: q.data ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchWallet: q.refetch,
  }
}

export function useTherapistWithdraw() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (amountCents: number) => walletService.withdraw(amountCents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'wallet'] })
    },
  })
  return {
    withdraw: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
    data: mutation.data,
  }
}

// --- Therapist me (profile)
export function useTherapistMe() {
  const enabled = useIsTherapistAuth()
  const { updateTherapistProfile } = useAuthStore()
  const q = useQuery({
    queryKey: [...therapistQueryKeys.me],
    queryFn: () => therapistAuthService.getMe(),
    enabled,
  })
  useEffect(() => {
    if (q.data) updateTherapistProfile(q.data)
  }, [q.data, updateTherapistProfile])
  return {
    therapist: q.data ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchMe: q.refetch,
  }
}

// --- Availability
export function useTherapistAvailability() {
  const enabled = useIsTherapistAuth()
  const queryClient = useQueryClient()
  const q = useQuery({
    queryKey: [...therapistQueryKeys.availability],
    queryFn: () => availabilityService.getAvailability(),
    enabled,
  })
  const updateMutation = useMutation({
    mutationFn: (payload: AvailabilityUpdatePayload) =>
      availabilityService.updateAvailability(payload),
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(therapistQueryKeys.availability, data)
    },
  })
  return {
    data: q.data ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchAvailability: q.refetch,
    updateAvailability: updateMutation.mutateAsync,
    updateLoading: updateMutation.isPending,
    updateError: updateMutation.error ? errMessage(updateMutation.error) : null,
  }
}

// --- Notifications
export function useTherapistNotifications(params?: NotificationsListParams) {
  const enabled = useIsTherapistAuth()
  const queryClient = useQueryClient()
  const q = useQuery({
    queryKey: therapistQueryKeys.notifications(params),
    queryFn: () => notificationsService.getNotifications(params),
    enabled,
  })
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['therapist', 'notifications'] }),
  })
  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsService.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['therapist', 'notifications'] }),
  })
  const removeMutation = useMutation({
    mutationFn: (id: number) => notificationsService.removeNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['therapist', 'notifications'] }),
  })
  return {
    notifications: q.data?.notifications ?? [],
    meta: q.data?.meta ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchNotifications: q.refetch,
    markAllRead: () => markAllReadMutation.mutate(),
    markRead: (id: number) => markReadMutation.mutate(id),
    removeNotification: (id: number) => removeMutation.mutate(id),
  }
}

// --- Auth (no auth required for send-otp, verify-otp, onboard, specialties)
export function useTherapistSendOtp() {
  const mutation = useMutation({
    mutationFn: (email: string) => therapistAuthService.sendOtp(email),
  })
  return {
    sendOtp: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}

export function useTherapistVerifyOtp() {
  const mutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      therapistAuthService.verifyOtp(email, code),
  })
  return {
    verifyOtp: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
    data: mutation.data,
  }
}

export function useTherapistOnboard() {
  const mutation = useMutation({
    mutationFn: (payload: {
      email: string
      fullName: string
      professionalTitle: string
      specialties: string[]
      licenseUrl?: string
      identityUrl?: string
    }) => therapistAuthService.onboard(payload),
  })
  return {
    onboard: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
    data: mutation.data,
  }
}

export function useTherapistSpecialties() {
  const q = useQuery({
    queryKey: [...therapistQueryKeys.specialties],
    queryFn: () => therapistAuthService.getSpecialties(),
  })
  return {
    specialties: q.data ?? [],
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    refetch: q.refetch,
  }
}

export function useUpdateTherapistMe() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: {
      fullName?: string
      professionalTitle?: string
      licenseUrl?: string | null
      identityUrl?: string | null
    }) => therapistAuthService.updateMe(payload),
    onSuccess: (therapist) => {
      queryClient.setQueryData(therapistQueryKeys.me, therapist)
    },
  })
  return {
    updateMe: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}

// --- Threads (therapist–client chat)
export function useTherapistThreads() {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: therapistQueryKeys.threads.list,
    queryFn: () => threadsService.listThreads(),
    enabled,
  })
  return {
    threads: q.data?.threads ?? [],
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchThreads: q.refetch,
  }
}

export function useTherapistThread(threadId: number | null, params?: { page?: number; limit?: number }) {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: [...therapistQueryKeys.threads.thread(threadId ?? 0), params ?? {}],
    queryFn: () => threadsService.getThread(threadId!, params),
    enabled: enabled && threadId != null,
  })
  return {
    data: q.data ?? null,
    thread: q.data?.thread ?? null,
    messages: q.data?.messages ?? [],
    meta: q.data?.meta ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchThread: q.refetch,
  }
}

export function useTherapistThreadByUser(userId: number | null, params?: { page?: number; limit?: number }) {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: [...therapistQueryKeys.threads.threadByUser(userId ?? 0), params ?? {}],
    queryFn: () => threadsService.getOrCreateThreadByUser(userId!, params),
    enabled: enabled && userId != null,
  })
  return {
    data: q.data ?? null,
    thread: q.data?.thread ?? null,
    messages: q.data?.messages ?? [],
    meta: q.data?.meta ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchThread: q.refetch,
  }
}

export function useTherapistThreadBySession(sessionId: number | null, params?: { page?: number; limit?: number }) {
  const enabled = useIsTherapistAuth()
  const q = useQuery({
    queryKey: [...therapistQueryKeys.threads.threadBySession(sessionId ?? 0), params ?? {}],
    queryFn: () => threadsService.getOrCreateThreadBySession(sessionId!, params),
    enabled: enabled && sessionId != null && sessionId > 0,
  })
  return {
    data: q.data ?? null,
    thread: q.data?.thread ?? null,
    messages: q.data?.messages ?? [],
    meta: q.data?.meta ?? null,
    loading: q.isLoading,
    error: q.error ? errMessage(q.error) : null,
    fetchThread: q.refetch,
  }
}

export function useTherapistSendThreadMessage(threadId: number | null) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: SendThreadMessageRequest) => {
      if (threadId == null) throw new Error('Thread ID required')
      return threadsService.sendMessage(threadId, payload)
    },
    onSuccess: () => {
      if (threadId != null) {
        queryClient.invalidateQueries({ queryKey: therapistQueryKeys.threads.thread(threadId) })
        queryClient.invalidateQueries({ queryKey: therapistQueryKeys.threads.list })
        queryClient.invalidateQueries({ queryKey: ['therapist', 'threads'] })
      }
    },
  })
  return {
    sendMessage: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}

export function useTherapistUploadThreadFile() {
  const mutation = useMutation({
    mutationFn: ({ threadId, file }: { threadId: number; file: { uri: string; name?: string; type?: string } }) =>
      threadsService.uploadFile(threadId, file),
  })
  return {
    upload: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}

export function useTherapistUploadDocument() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ type, file }: { type: 'license' | 'identity'; file: PickedFile }) =>
      therapistAuthService.uploadDocument(type, file),
    onSuccess: (data) => {
      if (data.therapist) {
        queryClient.setQueryData(therapistQueryKeys.me, data.therapist)
      } else {
        queryClient.invalidateQueries({ queryKey: [...therapistQueryKeys.me] })
      }
    },
  })
  return {
    uploadDocument: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? errMessage(mutation.error) : null,
  }
}
