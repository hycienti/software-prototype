/**
 * STT (Speech-to-Text) port for clean architecture.
 * Implement with whisper.rn RealtimeTranscriber or a mock for tests.
 */
export interface RealtimeSttPort {
  /** Start capturing and transcribing from the microphone. */
  startRealtimeTranscription(options: { language?: string }): Promise<void>
  /** Stop and return the full transcript collected so far. */
  stopRealtimeTranscription(): Promise<string>
}
