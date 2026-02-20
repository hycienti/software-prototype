import { useMutation } from '@tanstack/react-query'
import {
  voiceService,
  type ProcessVoiceMessageRequest,
  type ProcessVoiceMessageResponse,
  type TextToSpeechRequest,
  type TextToSpeechResponse,
} from '@/services/voice'
import { waitForVoiceResult } from '@/services/voice/voicePusher'

/**
 * React Query hooks for voice functionality
 *
 * Async path (when userId is set): caller must subscribe via subscribeToVoiceResults
 * before sending; mutation only posts and waits for result via waitForVoiceResult.
 */

/**
 * Hook to process voice message (STT + AI + TTS) – sync
 */
export function useProcessVoiceMessage() {
  return useMutation({
    mutationFn: (data: ProcessVoiceMessageRequest) => voiceService.processVoiceMessage(data),
    onError: (error) => {
      console.error('Error processing voice message:', error)
    },
  })
}

/**
 * Hook to process voice message: uses async (Pusher streaming) when userId is set, otherwise sync.
 * When userId is set: POST with async: true → 202 + jobId → waitForVoiceResult(jobId) until
 * voice:result:complete (or voice:result) arrives on Pusher channel user-{userId}.
 * VoiceScreen must call subscribeToVoiceResults(userId) on mount so results are received.
 */
export function useProcessVoiceMessageAsync(userId: number | null) {
  return useMutation({
    mutationFn: async (data: ProcessVoiceMessageRequest): Promise<ProcessVoiceMessageResponse> => {
      if (userId != null) {
        const { jobId } = await voiceService.processVoiceMessageAsync(data)
        return waitForVoiceResult(jobId, { timeoutMs: 90_000 })
      }
      return voiceService.processVoiceMessage(data)
    },
    onError: (error) => {
      console.error('Error processing voice message:', error)
    },
  })
}

/**
 * Hook to convert text to speech
 */
export function useTextToSpeech() {
  return useMutation({
    mutationFn: (data: TextToSpeechRequest) => voiceService.textToSpeech(data),
    onError: (error) => {
      console.error('Error converting text to speech:', error)
    },
  })
}
