import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import * as FileSystem from 'expo-file-system/legacy'
import { Audio } from 'expo-av'
import { useProcessVoiceMessage, useTextToSpeech } from '@/hooks/useVoice'

/**
 * Voice helpers using expo-audio with expo-av fallback for TTS playback.
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

  // Try expo-audio first
  try {
    const player = createAudioPlayer(tempUri, {})
    let stopped = false

    const done = new Promise<void>((resolve) => {
      const sub = player.addListener(
        'playbackStatusUpdate',
        (status: { didJustFinish?: boolean }) => {
          if (status.didJustFinish && !stopped) {
            stopped = true
            sub.remove()
            player.remove()
            cleanupFile()
            resolve()
          }
        }
      )
    })

    player.play()

    const stop = () => {
      if (stopped) return
      stopped = true
      try {
        player.remove()
      } catch (_) { /* already disposed */ }
      cleanupFile()
    }

    return { done, stop }
  } catch (expoAudioError) {
    if (__DEV__) {
      console.warn('playAudioFromBase64: expo-audio failed, using expo-av fallback', expoAudioError)
    }
  }

  // Fallback: expo-av
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  })

  const { sound } = await Audio.Sound.createAsync(
    { uri: tempUri },
    { shouldPlay: true }
  )

  let stopped = false

  const done = new Promise<void>((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish && !status.isLooping && !stopped) {
        stopped = true
        sound.unloadAsync().then(() => {
          cleanupFile()
          resolve()
        }).catch(() => {
          cleanupFile()
          resolve()
        })
      }
    })
  })

  const stop = () => {
    if (stopped) return
    stopped = true
    sound.stopAsync()
      .then(() => sound.unloadAsync())
      .catch(() => {})
      .finally(() => cleanupFile())
  }

  return { done, stop }
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
