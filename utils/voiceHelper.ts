import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { AppState } from 'react-native'
import { useProcessVoiceMessage, useTextToSpeech } from '@/hooks/useVoice'

/**
 * Helper utilities for voice processing
 */

/**
 * Record audio and return recording object
 */
export async function recordAudio(): Promise<Audio.Recording> {
  try {
    // Request permissions
    const { status } = await Audio.requestPermissionsAsync()
    if (status !== 'granted') {
      throw new Error('Microphone permission not granted')
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

    // Create recording
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    )

    // Return recording object (caller should stop it)
    return recording
  } catch (error) {
    console.error('Error starting recording:', error)
    throw error
  }
}

/**
 * Stop recording and get base64 audio data
 */
export async function stopRecordingAndGetBase64(
  recording: Audio.Recording
): Promise<string> {
  try {
    await recording.stopAndUnloadAsync()
    const uri = recording.getURI()

    if (!uri) {
      throw new Error('No recording URI available')
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    // Clean up
    await FileSystem.deleteAsync(uri, { idempotent: true })

    return base64
  } catch (error) {
    console.error('Error stopping recording:', error)
    throw error
  }
}

/**
 * Play audio from base64 data with background audio support
 */
export async function playAudioFromBase64(
  base64Data: string,
  format: 'mp3' | 'wav' | 'm4a' = 'mp3'
): Promise<void> {
  try {
    // Configure audio mode for background playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    })

    // Create a temporary file
    const tempUri = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.${format}`
    await FileSystem.writeAsStringAsync(tempUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    })

    // Create and play sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: tempUri },
      { shouldPlay: true, isLooping: false }
    )

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Resume playback if app comes to foreground
        sound.getStatusAsync().then((status) => {
          if (status.isLoaded && !status.isPlaying && !status.didJustFinish) {
            sound.playAsync()
          }
        })
      }
    })

    // Clean up after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync()
        FileSystem.deleteAsync(tempUri, { idempotent: true })
        subscription.remove()
      }
    })

    await sound.playAsync()
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
