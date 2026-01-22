import { useMutation } from '@tanstack/react-query'
import {
  voiceService,
  type ProcessVoiceMessageRequest,
  type ProcessVoiceMessageResponse,
  type TextToSpeechRequest,
  type TextToSpeechResponse,
} from '@/services/api/voice'

/**
 * React Query hooks for voice functionality
 */

/**
 * Hook to process voice message (STT + AI + TTS)
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
