import { useMutation } from '@tanstack/react-query'
import {
  voiceService,
  type ProcessVoiceMessageRequest,
  type ProcessVoiceMessageResponse,
  type TextToSpeechRequest,
  type TextToSpeechResponse,
} from '@/services/voice'
import { subscribeToVoiceResults, waitForVoiceResult } from '@/services/voice/voicePusher'

/**
 * React Query hooks for voice functionality
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
 * Hook to process voice message: uses async (Pusher) when userId is set, otherwise sync.
 */
export function useProcessVoiceMessageAsync(userId: number | null) {
  return useMutation({
    mutationFn: async (data: ProcessVoiceMessageRequest): Promise<ProcessVoiceMessageResponse> => {
      if (userId != null) {
        const { jobId } = await voiceService.processVoiceMessageAsync(data)
        await subscribeToVoiceResults(userId)
        return waitForVoiceResult(jobId)
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
