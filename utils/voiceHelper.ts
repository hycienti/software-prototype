import * as Speech from 'expo-speech'
import * as FileSystem from 'expo-file-system/legacy'
import { useProcessVoiceMessage } from '@/hooks/useVoice'
import { playFromUri, setAudioModeAsync } from '@/services/audio'

/**
 * Voice helpers using expo-audio for TTS playback.
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

export interface AudioPlayback {
  done: Promise<void>;
  stop: () => void;
}

/**
 * Play audio from base64 data (e.g. TTS response). Tries expo-audio first,
 * falls back to expo-av. Returns a handle with `done` (resolves on finish)
 * and `stop()` to interrupt playback externally.
 */
export async function playAudioFromBase64(
  base64Data: string,
  format: 'mp3' | 'wav' | 'm4a' = 'mp3'
): Promise<AudioPlayback> {
  if (
    !base64Data ||
    typeof base64Data !== 'string' ||
    base64Data.length < 100
  ) {
    const msg = 'playAudioFromBase64: invalid or too short base64 data'
    console.warn(msg, { length: base64Data?.length ?? 0 })
    throw new Error(msg)
  }

  const tempUri = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.${format}`
  await FileSystem.writeAsStringAsync(tempUri, base64Data, {
    encoding: 'base64',
  })

  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    })
  } catch (modeError) {
    console.warn('playAudioFromBase64: setAudioModeAsync failed', modeError)
  }

  const cleanupFile = () =>
    FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => {})

  const playback = await playFromUri(tempUri)
  return {
    done: playback.done.then(cleanupFile),
    stop: () => {
      playback.stop()
      cleanupFile()
    },
  }
}

/**
 * Hook wrapper for voice message processing.
 * TTS is done client-side with expo-speech.
 */
export function useVoiceProcessing() {
  const processVoiceMutation = useProcessVoiceMessage()

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

  const speakText = (text: string) => {
    if (!text?.trim()) return
    Speech.speak(text.trim(), {})
  }

  return {
    processVoiceMessage,
    speakText,
    isLoading: processVoiceMutation.isPending,
    error: processVoiceMutation.error,
  }
}
