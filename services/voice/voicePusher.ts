import Pusher from 'pusher-js'
import type { ProcessVoiceMessageResponse } from '@/types/api'

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY || '640987342798234'
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'mt1'

const DEFAULT_WAIT_TIMEOUT_MS = 90_000

type Pending = {
  resolve: (value: ProcessVoiceMessageResponse) => void
  reject: (error: Error) => void
}

let pusher: Pusher | null = null
let currentUserChannel: string | null = null
let progressCallback: ((step: string) => void) | null = null
const pendingByJobId = new Map<string, Pending>()

function getPusher(): Pusher {
  if (pusher) return pusher
  pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    enabledTransports: ['ws', 'wss'],
  })
  pusher.connect()
  return pusher
}

export interface SubscribeToVoiceResultsOptions {
  onProgress?: (step: string) => void
}

export async function subscribeToVoiceResults(
  userId: number,
  options: SubscribeToVoiceResultsOptions = {}
): Promise<void> {
  const channelName = `user-${userId}`
  if (currentUserChannel === channelName) {
    progressCallback = options.onProgress ?? null
    return
  }
  if (currentUserChannel && pusher) {
    pusher.unsubscribe(currentUserChannel)
    currentUserChannel = null
  }
  progressCallback = options.onProgress ?? null
  const p = getPusher()
  const channel = p.subscribe(channelName)
  channel.bind('voice:progress', (data: Record<string, unknown> & { step?: string }) => {
    const step = data?.step
    if (typeof step === 'string' && progressCallback) progressCallback(step)
  })
  channel.bind('voice:result', (data: Record<string, unknown>) => {
    try {
      const jobId = data?.jobId as string | undefined
      if (!jobId) return
      const pending = pendingByJobId.get(jobId)
      if (!pending) return
      pendingByJobId.delete(jobId)
      const payload = data as {
        jobId: string
        conversationId: number
        transcript: string
        response: ProcessVoiceMessageResponse['response']
        audioData: string
        audioFormat: string
        sentiment?: ProcessVoiceMessageResponse['sentiment']
      }
      pending.resolve({
        conversation: {
          id: payload.conversationId,
          title: null,
          mode: 'voice',
          createdAt: new Date().toISOString(),
        },
        transcript: payload.transcript,
        response: payload.response,
        audioData: payload.audioData,
        audioFormat: payload.audioFormat,
        sentiment: payload.sentiment,
      })
    } catch (err) {
      console.error('Voice Pusher event error', err)
    }
  })
  channel.bind('voice:error', (data: Record<string, unknown> & { message?: string }) => {
    const jobId = data?.jobId as string | undefined
    if (!jobId) return
    const pending = pendingByJobId.get(jobId)
    if (pending) {
      pendingByJobId.delete(jobId)
      pending.reject(new Error(String(data?.message || 'Voice processing failed')))
    }
  })
  currentUserChannel = channelName
}

/**
 * Unsubscribe from voice results for a user. Call on voice screen unmount.
 */
export function unsubscribeFromVoiceResults(userId: number): void {
  const channelName = `user-${userId}`
  if (currentUserChannel !== channelName) return
  if (pusher) {
    pusher.unsubscribe(channelName)
  }
  currentUserChannel = null
  progressCallback = null
}

export interface WaitForVoiceResultOptions {
  timeoutMs?: number
}

export function waitForVoiceResult(
  jobId: string,
  options: WaitForVoiceResultOptions = {}
): Promise<ProcessVoiceMessageResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WAIT_TIMEOUT_MS
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const pending = pendingByJobId.get(jobId)
      if (pending) {
        pendingByJobId.delete(jobId)
        pending.reject(new Error('Voice response timed out. Please try again.'))
      }
    }, timeoutMs)
    pendingByJobId.set(jobId, {
      resolve: (value) => {
        clearTimeout(timeoutId)
        resolve(value)
      },
      reject: (err) => {
        clearTimeout(timeoutId)
        reject(err)
      },
    })
  })
}
