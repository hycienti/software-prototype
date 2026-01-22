import { apiClient } from './client'

export interface ProcessVoiceMessageRequest {
  conversationId?: number
  audioData: string // Base64 encoded audio
  audioFormat?: 'mp3' | 'wav' | 'm4a' | 'ogg'
  language?: string
}

export interface ProcessVoiceMessageResponse {
  conversation: {
    id: number
    title: string | null
    mode: 'voice'
    createdAt: string
  }
  transcript: string
  response: {
    id: number
    content: string
    metadata?: Record<string, any>
  }
  audioData: string // Base64 encoded audio
  audioFormat: 'mp3'
  sentiment?: {
    sentiment: 'positive' | 'neutral' | 'negative'
    crisisIndicators: string[]
    confidence: number
  }
}

export interface TextToSpeechRequest {
  text: string
  voiceId?: string
  conversationId?: number
}

export interface TextToSpeechResponse {
  audioData: string // Base64 encoded audio
  audioFormat: 'mp3'
}

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
    return apiClient.post<ProcessVoiceMessageResponse>('/voice/process', data)
  },

  /**
   * Convert text to speech
   */
  async textToSpeech(data: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    return apiClient.post<TextToSpeechResponse>('/voice/tts', data)
  },
}
