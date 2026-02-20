import Pusher from 'pusher-js'
import type { ProcessVoiceMessageResponse } from '@/types/api'

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY || '640987342798234'
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'mt1'

type Pending = {
  resolve: (value: ProcessVoiceMessageResponse) => void
  reject: (error: Error) => void
}

let pusher: Pusher | null = null
let currentUserChannel: string | null = null
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

export async function subscribeToVoiceResults(userId: number): Promise<void> {
  const channelName = `user-${userId}`
  if (currentUserChannel === channelName) return
  if (currentUserChannel && pusher) {
    pusher.unsubscribe(currentUserChannel)
    currentUserChannel = null
  }
  const p = getPusher()
  const channel = p.subscribe(channelName)
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

export function waitForVoiceResult(jobId: string): Promise<ProcessVoiceMessageResponse> {
  return new Promise((resolve, reject) => {
    pendingByJobId.set(jobId, { resolve, reject })
  })
}
