/**
 * Resolve Whisper and VAD model paths for whisper.rn.
 * Models must exist at these paths (copy to document dir on first launch or bundle in assets and copy).
 * Download from https://huggingface.co/ggerganov/whisper.cpp (e.g. ggml-tiny.en.bin).
 * VAD: https://huggingface.co/ggerganov/whisper.cpp (silero_vad).
 */
import * as FileSystem from 'expo-file-system/legacy'

const WHISPER_MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin'
const VAD_MODEL_URL = 'https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v6.2.0.bin'

export interface WhisperModelPaths {
  whisper: string
  vad?: string
}

/**
 * Returns paths under app document directory.
 * Ensure models exist there (e.g. copy from bundled assets on first launch or download at runtime).
 */
export function getDocumentDirWhisperModelPaths(): WhisperModelPaths {
  const dir = FileSystem.documentDirectory ?? ''
  return {
    whisper: `${dir}ggml-tiny.en.bin`,
    vad: `${dir}ggml-silero-v6.2.0.bin`,
  }
}

const NETWORK_ERROR_MESSAGE =
  'Could not download the speech recognition model. Please check your internet connection and try again. On an emulator, ensure it has network access.'

/**
 * Ensures Whisper and VAD model files exist in the document directory.
 * Downloads from Hugging Face if missing. Call before starting transcription on first use.
 */
export async function ensureWhisperModelsReady(): Promise<WhisperModelPaths> {
  const paths = getDocumentDirWhisperModelPaths()

  const whisperInfo = await FileSystem.getInfoAsync(paths.whisper)
  if (!whisperInfo.exists || (whisperInfo.size ?? 0) < 1_000_000) {
    try {
      await FileSystem.downloadAsync(WHISPER_MODEL_URL, paths.whisper)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (/resolve host|hostname|network|ENOTFOUND|ETIMEDOUT|econnrefused/i.test(msg)) {
        throw new Error(NETWORK_ERROR_MESSAGE)
      }
      throw err
    }
  }

  if (paths.vad) {
    try {
      const vadInfo = await FileSystem.getInfoAsync(paths.vad)
      if (!vadInfo.exists || (vadInfo.size ?? 0) < 10_000) {
        await FileSystem.downloadAsync(VAD_MODEL_URL, paths.vad)
      }
    } catch {
      // VAD is optional; RealtimeTranscriber works without it
      return { whisper: paths.whisper }
    }
  }

  return paths
}
