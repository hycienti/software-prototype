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
  let pendingTranscribeResolve: (() => void) | null = null

  async function ensureInitialized() {
    // Load models once (expensive)
    if (!whisperContext) {
      const { whisper: whisperPath, vad: vadPath } = await config.getModelPaths()
      whisperContext = await initWhisper({ filePath: whisperPath })
      if (vadPath) {
        vadContext = await initWhisperVad({
          filePath: vadPath,
          nThreads: 2,
        })
      }
    }
    // Create fresh transcriber + audio stream each session to avoid stale
    // dataCallback after AudioPcmStreamAdapter.initialize() calls release()
    if (!transcriber) {
      const audioStream = new AudioPcmStreamAdapter()
      transcriber = new RealtimeTranscriber(
        {
          whisperContext,
          vadContext: vadContext ?? undefined,
          audioStream,
          fs: rnfsAdapter,
        },
        {
          audioSliceSec: 5,
          vadPreset: 'default',
          autoSliceOnSpeechEnd: true,
          transcribeOptions: { language: currentLanguage },
        },
        {
          onTranscribe: (event) => {
            const text = event.data?.result?.trim()
            if (text) segments.push(text)
            // Resolve pending flush promise when a real transcription completes
            if (event.type === 'transcribe' || event.type === 'error') {
              pendingTranscribeResolve?.()
              pendingTranscribeResolve = null
            }
          },
          onError: (err) => {
            if (__DEV__) console.warn('[WhisperRealtimeStt] onError', err)
            pendingTranscribeResolve?.()
            pendingTranscribeResolve = null
          },
        }
      )
    }
  }

  return {
    async startRealtimeTranscription(options: { language?: string }) {
      currentLanguage = options.language ?? DEFAULT_LANGUAGE
      segments.length = 0
      await ensureInitialized()
      if (transcriber) {
        try {
          await transcriber.start()
        } catch (err: unknown) {
          if (err instanceof Error && err.message.includes('already active')) {
            await transcriber.stop()
            transcriber = null
            await ensureInitialized()
            await transcriber!.start()
          } else {
            throw err
          }
        }
      }
    },

    async stopRealtimeTranscription(): Promise<string> {
      if (transcriber) {
        // Force-flush any buffered audio into a final slice and wait for
        // its transcription while isActive is still true.  nextSlice()
        // fires transcription asynchronously, so we wait for the
        // onTranscribe callback (with a safety timeout).
        const finalTranscription = new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 3000)
          pendingTranscribeResolve = () => {
            clearTimeout(timeout)
            resolve()
          }
        })
        await transcriber.nextSlice()
        await finalTranscription

        await transcriber.stop()
        transcriber = null
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
