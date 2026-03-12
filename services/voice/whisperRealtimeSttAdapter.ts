/**
 * Whisper.rn RealtimeTranscriber adapter implementing RealtimeSttPort.
 * Requires whisper and VAD model paths (e.g. from assets or document directory).
 */
import { initWhisper } from 'whisper.rn'
import { initWhisperVad } from 'whisper.rn'
// Use src path when Metro does not resolve package exports (see whisper.rn README)
import { RealtimeTranscriber } from 'whisper.rn/src/realtime-transcription'
import { AudioPcmStreamAdapter } from 'whisper.rn/src/realtime-transcription/adapters/AudioPcmStreamAdapter'
import RNFS from 'react-native-fs'
import type { RealtimeSttPort } from './sttPort'

const DEFAULT_LANGUAGE = 'en'

/** Filesystem adapter for RealtimeTranscriber (WavFileWriterFs interface). */
const rnfsAdapter = {
  writeFile: (filePath: string, data: string, encoding: string) =>
    RNFS.writeFile(filePath, data, encoding as 'utf8' | 'base64'),
  appendFile: (filePath: string, data: string, encoding: string) =>
    RNFS.appendFile(filePath, data, encoding as 'utf8' | 'base64'),
  readFile: (filePath: string, encoding: string) =>
    RNFS.readFile(filePath, encoding as 'utf8' | 'base64'),
  exists: (filePath: string) => RNFS.exists(filePath),
  unlink: (filePath: string) => RNFS.unlink(filePath),
}

export interface WhisperRealtimeSttAdapterConfig {
  /** Returns paths to whisper ggml model and (optional) VAD model. */
  getModelPaths: () => Promise<{ whisper: string; vad?: string }>
}

let whisperContext: Awaited<ReturnType<typeof initWhisper>> | null = null
let vadContext: Awaited<ReturnType<typeof initWhisperVad>> | null = null
let transcriber: RealtimeTranscriber | null = null

export function createWhisperRealtimeSttAdapter(
  config: WhisperRealtimeSttAdapterConfig
): RealtimeSttPort {
  const segments: string[] = []
  let currentLanguage = DEFAULT_LANGUAGE

  async function ensureInitialized() {
    if (transcriber != null) return
    const { whisper: whisperPath, vad: vadPath } = await config.getModelPaths()
    whisperContext = await initWhisper({ filePath: whisperPath })
    if (vadPath) {
      vadContext = await initWhisperVad({
        filePath: vadPath,
        nThreads: 2,
      })
    }
    const audioStream = new AudioPcmStreamAdapter()
    transcriber = new RealtimeTranscriber(
      {
        whisperContext,
        vadContext: vadContext ?? undefined,
        audioStream,
        fs: rnfsAdapter,
      },
      {
        audioSliceSec: 30,
        vadPreset: 'default',
        autoSliceOnSpeechEnd: true,
        transcribeOptions: { language: currentLanguage },
      },
      {
        onTranscribe: (event) => {
          const text = event.data?.result?.trim()
          if (text) segments.push(text)
        },
        onError: (err) => {
          if (__DEV__) console.warn('[WhisperRealtimeStt] onError', err)
        },
      }
    )
  }

  return {
    async startRealtimeTranscription(options: { language?: string }) {
      currentLanguage = options.language ?? DEFAULT_LANGUAGE
      segments.length = 0
      await ensureInitialized()
      if (transcriber) {
        await transcriber.start()
      }
    },

    async stopRealtimeTranscription(): Promise<string> {
      if (transcriber) {
        await transcriber.stop()
      }
      const transcript = segments.join(' ').trim()
      segments.length = 0
      return transcript
    },
  }
}

/** Release Whisper/VAD contexts (e.g. on app background). Call when done with STT. */
export async function releaseWhisperSttResources(): Promise<void> {
  transcriber = null
  if (vadContext) {
    const { releaseAllWhisperVad } = await import('whisper.rn')
    await releaseAllWhisperVad()
    vadContext = null
  }
  whisperContext = null
}
