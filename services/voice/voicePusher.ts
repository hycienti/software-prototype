/**
 * Voice results via Pusher: when the app sends a voice message with async: true,
 * the backend returns 202 + jobId and streams the result (transcript, response text, TTS audio)
 * over Pusher events (voice:result:start, voice:response:chunk, voice:audio:chunk, voice:result:complete).
 * This module subscribes to user-{userId} and resolves waitForVoiceResult(jobId) when the result arrives.
 * Results that arrive before waitForVoiceResult is called are buffered to fix the race and avoid timeouts.
 */
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
/** Results that arrived before waitForVoiceResult(jobId) was called (fixes race). */
const completedResultsByJobId = new Map<string, ProcessVoiceMessageResponse>()

type ChunkedVoiceBuffer = {
  jobId: string
  conversationId: number
  transcript: string
  response: ProcessVoiceMessageResponse['response']
  audioFormat: string
  sentiment?: ProcessVoiceMessageResponse['sentiment']
  totalAudioChunks: number
  totalResponseChunks: number
  chunks: Map<number, string>
  responseChunks: Map<number, string>
}
const chunkedBufferByJobId = new Map<string, ChunkedVoiceBuffer>()

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

  channel.bind('voice:result:start', (data: Record<string, unknown>) => {
    try {
      const jobId = data?.jobId as string | undefined
      if (!jobId) return
      const rawResponse = (data.response as { id?: number; content?: string; metadata?: Record<string, unknown> }) ?? {}
      const totalAudioChunks = (data.totalAudioChunks as number) ?? (data.totalChunks as number) ?? 0
      const totalResponseChunks = (data.totalResponseChunks as number) ?? 0
      chunkedBufferByJobId.set(jobId, {
        jobId,
        conversationId: data.conversationId as number,
        transcript: (data.transcript as string) ?? '',
        response: {
          id: rawResponse.id ?? 0,
          content: (rawResponse.content as string) ?? '',
          metadata: rawResponse.metadata,
        },
        audioFormat: (data.audioFormat as string) ?? 'mp3',
        sentiment: data.sentiment as ProcessVoiceMessageResponse['sentiment'] | undefined,
        totalAudioChunks,
        totalResponseChunks,
        chunks: new Map(),
        responseChunks: new Map(),
      })
    } catch (err) {
      console.error('Voice Pusher voice:result:start error', err)
    }
  })

  channel.bind('voice:response:chunk', (data: Record<string, unknown>) => {
    try {
      const jobId = data?.jobId as string | undefined
      if (!jobId) return
      const buf = chunkedBufferByJobId.get(jobId)
      if (!buf) return
      const index = (data.index as number) ?? 0
      const chunk = (data.chunk as string) ?? ''
      buf.responseChunks.set(index, chunk)
    } catch (err) {
      console.error('Voice Pusher voice:response:chunk error', err)
    }
  })

  channel.bind('voice:audio:chunk', (data: Record<string, unknown>) => {
    try {
      const jobId = data?.jobId as string | undefined
      if (!jobId) return
      const buf = chunkedBufferByJobId.get(jobId)
      if (!buf) return
      const index = (data.index as number) ?? 0
      const chunk = (data.chunk as string) ?? ''
      buf.chunks.set(index, chunk)
    } catch (err) {
      console.error('Voice Pusher voice:audio:chunk error', err)
    }
  })

  channel.bind('voice:result:complete', (data: Record<string, unknown>) => {
    try {
      const jobId = data?.jobId as string | undefined
      if (!jobId) return
      const buf = chunkedBufferByJobId.get(jobId)
      chunkedBufferByJobId.delete(jobId)
      if (!buf) return
      const responseContent = Array.from(buf.responseChunks.keys())
        .sort((a, b) => a - b)
        .map((i) => buf.responseChunks.get(i) ?? '')
        .join('')
      const audioData = Array.from(buf.chunks.keys())
        .sort((a, b) => a - b)
        .map((i) => buf.chunks.get(i) ?? '')
        .join('')
      const response: ProcessVoiceMessageResponse = {
        conversation: {
          id: buf.conversationId,
          title: null,
          mode: 'voice',
          createdAt: new Date().toISOString(),
        },
        transcript: buf.transcript,
        response: { ...buf.response, content: responseContent },
        audioData,
        audioFormat: 'mp3',
        sentiment: buf.sentiment,
      }
      const pending = pendingByJobId.get(jobId)
      if (pending) {
        pendingByJobId.delete(jobId)
        pending.resolve(response)
      } else {
        completedResultsByJobId.set(jobId, response)
      }
    } catch (err) {
      console.error('Voice Pusher voice:result:complete error', err)
    }
  })

  channel.bind('voice:result', (data: Record<string, unknown>) => {
    try {
      const jobId = data?.jobId as string | undefined
      if (!jobId) return
      const payload = data as {
        jobId: string
        conversationId: number
        transcript: string
        response: ProcessVoiceMessageResponse['response']
        audioData?: string
        audioFormat: string
        sentiment?: ProcessVoiceMessageResponse['sentiment']
      }
      if (payload.audioData !== undefined) {
        const response: ProcessVoiceMessageResponse = {
          conversation: {
            id: payload.conversationId,
            title: null,
            mode: 'voice',
            createdAt: new Date().toISOString(),
          },
          transcript: payload.transcript,
          response: payload.response,
          audioData: payload.audioData,
          audioFormat: 'mp3',
          sentiment: payload.sentiment,
        }
        const pending = pendingByJobId.get(jobId)
        if (pending) {
          pendingByJobId.delete(jobId)
          pending.resolve(response)
        } else {
          completedResultsByJobId.set(jobId, response)
        }
      }
    } catch (err) {
      console.error('Voice Pusher event error', err)
    }
  })
  channel.bind('voice:error', (data: Record<string, unknown> & { message?: string }) => {
    const jobId = data?.jobId as string | undefined
    if (!jobId) return
    chunkedBufferByJobId.delete(jobId)
    completedResultsByJobId.delete(jobId)
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
  const cached = completedResultsByJobId.get(jobId)
  if (cached) {
    completedResultsByJobId.delete(jobId)
    return Promise.resolve(cached)
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_WAIT_TIMEOUT_MS
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const pending = pendingByJobId.get(jobId)
      if (pending) {
        pendingByJobId.delete(jobId)
        chunkedBufferByJobId.delete(jobId)
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
