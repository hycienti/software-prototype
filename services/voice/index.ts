import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  ProcessVoiceMessageRequest,
  ProcessVoiceMessageResponse,
  VoiceAsyncAcceptedResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
} from '@/types/api'

type ApiSuccess<T> = { success: true; data: T }

function unwrap<T>(res: ApiSuccess<T> | T): T {
  if (typeof res === 'object' && res !== null && 'success' in res && (res as ApiSuccess<T>).success)
    return (res as ApiSuccess<T>).data
  return res as T
}

/**
 * Voice API Service
 */
export const voiceService = {
  /**
   * Process voice message: STT -> AI -> TTS (sync)
   */
  async processVoiceMessage(
    data: ProcessVoiceMessageRequest
  ): Promise<ProcessVoiceMessageResponse> {
    const res = await apiClient.post<
      ApiSuccess<ProcessVoiceMessageResponse> | ProcessVoiceMessageResponse
    >(API_ENDPOINTS.VOICE.PROCESS, data)
    return unwrap(res)
  },

  /**
   * Start async voice processing; result is delivered via Pusher (voice:result / voice:error on user-{userId})
   */
  async processVoiceMessageAsync(
    data: ProcessVoiceMessageRequest
  ): Promise<VoiceAsyncAcceptedResponse> {
    const res = await apiClient.post<
      ApiSuccess<VoiceAsyncAcceptedResponse> | VoiceAsyncAcceptedResponse
    >(API_ENDPOINTS.VOICE.PROCESS, { ...data, async: true })
    return unwrap(res)
  },

  /**
   * Convert text to speech
   */
  async textToSpeech(data: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    const res = await apiClient.post<
      ApiSuccess<TextToSpeechResponse> | TextToSpeechResponse
    >(API_ENDPOINTS.VOICE.TTS, data)
    return unwrap(res)
  },
}

// Re-export types for convenience
export type {
  ProcessVoiceMessageRequest,
  ProcessVoiceMessageResponse,
  VoiceAsyncAcceptedResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
}
