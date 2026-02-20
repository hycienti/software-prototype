import { Pusher } from '@pusher/pusher-websocket-react-native'
import type { ProcessVoiceMessageResponse } from '@/types/api'

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY || '640987342798234'
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || 'mt1'

type Pending = {
  resolve: (value: ProcessVoiceMessageResponse) => void
  reject: (error: Error) => void
}

let pusher: Pusher | null = null
let initPromise: Promise<void> | null = null
let currentUserChannel: string | null = null
const pendingByJobId = new Map<string, Pending>()

async function getPusher(): Promise<Pusher> {
  if (pusher) return pusher
  const p = Pusher.getInstance()
  if (!p) throw new Error('Pusher not available')
  pusher = p
  if (!initPromise) {
    initPromise = p.init({ apiKey: PUSHER_KEY, cluster: PUSHER_CLUSTER }).then(() => p.connect())
  }
  await initPromise
  return pusher
}

export async function subscribeToVoiceResults(userId: number): Promise<void> {
  const channelName = `user-${userId}`
  if (currentUserChannel === channelName) return
  if (currentUserChannel) {
    await pusher!.unsubscribe({ channelName: currentUserChannel })
    currentUserChannel = null
  }
  const p = await getPusher()
  await p.subscribe({
    channelName,
    onEvent: (event: { eventName: string; data: string }) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        const jobId = data?.jobId as string | undefined
        if (!jobId) return
        const pending = pendingByJobId.get(jobId)
        if (!pending) return
        pendingByJobId.delete(jobId)
        if (event.eventName === 'voice:result') {
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
        } else if (event.eventName === 'voice:error') {
          pending.reject(new Error(data?.message || 'Voice processing failed'))
        }
      } catch (err) {
        console.error('Voice Pusher event error', err)
      }
    },
  })
  currentUserChannel = channelName
}

export function waitForVoiceResult(jobId: string): Promise<ProcessVoiceMessageResponse> {
  return new Promise((resolve, reject) => {
    pendingByJobId.set(jobId, { resolve, reject })
  })
}
