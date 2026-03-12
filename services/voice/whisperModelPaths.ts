/**
 * Resolve Whisper and VAD model paths for whisper.rn.
 * Models must exist at these paths (copy to document dir on first launch or bundle in assets and copy).
 * Download from https://huggingface.co/ggerganov/whisper.cpp (e.g. ggml-tiny.en.bin).
 * VAD: https://huggingface.co/ggerganov/whisper.cpp (silero_vad).
 */
import * as FileSystem from 'expo-file-system'

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
