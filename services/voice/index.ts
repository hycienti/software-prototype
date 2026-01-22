import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  ProcessVoiceMessageRequest,
  ProcessVoiceMessageResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
} from '@/types/api'

/**
 * Voice API Service
 */
export const voiceService = {
  /**
   * Process voice message: STT -> AI -> TTS
   */
  async processVoiceMessage(
    data: ProcessVoiceMessageRequest
  ): Promise<ProcessVoiceMessageResponse> {
    return apiClient.post<ProcessVoiceMessageResponse>(API_ENDPOINTS.VOICE.PROCESS, data)
  },

  /**
   * Convert text to speech
   */
  async textToSpeech(data: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    return apiClient.post<TextToSpeechResponse>(API_ENDPOINTS.VOICE.TTS, data)
  },
}

// Re-export types for convenience
export type {
  ProcessVoiceMessageRequest,
  ProcessVoiceMessageResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
}
