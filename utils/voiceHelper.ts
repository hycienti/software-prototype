import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import * as FileSystem from 'expo-file-system/legacy'
import { useProcessVoiceMessage, useTextToSpeech } from '@/hooks/useVoice'

/**
 * Voice helpers using expo-audio (expo-av is deprecated).
 * Recording is done in the screen via useAudioRecorder; use getBase64FromRecordingUri(uri) after stop.
 */

/**
 * Read a recording file from uri as base64 and delete the file. Call after audioRecorder.stop().
 */
export async function getBase64FromRecordingUri(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    })
    await FileSystem.deleteAsync(uri, { idempotent: true })
    return base64
  } catch (error) {
    console.error('Error reading recording as base64:', error)
    throw error
  }
}

/**
 * Play audio from base64 data (e.g. TTS response). Uses expo-audio.
 */
export async function playAudioFromBase64(
  base64Data: string,
  format: 'mp3' | 'wav' | 'm4a' = 'mp3'
): Promise<void> {
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    })

    const tempUri = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.${format}`
    await FileSystem.writeAsStringAsync(tempUri, base64Data, {
      encoding: 'base64',
    })

    const player = createAudioPlayer(tempUri, {})
    player.play()

    return new Promise<void>((resolve) => {
      const sub = player.addListener('playbackStatusUpdate', (status: { didJustFinish?: boolean }) => {
        if (status.didJustFinish) {
          sub.remove()
          player.remove()
          FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => {})
          resolve()
        }
      })
    })
  } catch (error) {
    console.error('Error playing audio:', error)
    throw error
  }
}

/**
 * Hook wrapper for voice message processing
 */
export function useVoiceProcessing() {
  const processVoiceMutation = useProcessVoiceMessage()
  const ttsMutation = useTextToSpeech()

  const processVoiceMessage = async (
    audioBase64: string,
    conversationId?: number,
    audioFormat: 'mp3' | 'wav' | 'm4a' | 'ogg' = 'mp3'
  ) => {
    return processVoiceMutation.mutateAsync({
      conversationId,
      audioData: audioBase64,
      audioFormat,
      language: 'en',
    })
  }

  const speakText = async (text: string, conversationId?: number) => {
    const response = await ttsMutation.mutateAsync({
      text,
      conversationId,
    })
    return response.audioData
  }

  return {
    processVoiceMessage,
    speakText,
    isLoading: processVoiceMutation.isPending || ttsMutation.isPending,
    error: processVoiceMutation.error || ttsMutation.error,
  }
}
