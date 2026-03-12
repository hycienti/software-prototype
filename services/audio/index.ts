import { createAudioPlayer, setAudioModeAsync as expoSetAudioModeAsync } from 'expo-audio'

/**
 * Audio playback abstraction using expo-audio.
 * Use this instead of importing expo-audio directly in UI or feature code.
 */

export interface AudioPlayback {
  done: Promise<void>
  stop: () => void
}

/**
 * Play audio from a file URI. Returns a handle with `done` (resolves when playback finishes)
 * and `stop()` to interrupt playback.
 */
export async function playFromUri(uri: string): Promise<AudioPlayback> {
  const player = createAudioPlayer(uri, {})
  let stopped = false

  const done = new Promise<void>((resolve) => {
    const sub = player.addListener(
      'playbackStatusUpdate',
      (status: { didJustFinish?: boolean }) => {
        if (status.didJustFinish && !stopped) {
          stopped = true
          sub.remove()
          player.remove()
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
    } catch {
      /* already disposed */
    }
  }

  return { done, stop }
}

/** Re-export for callers that need to configure audio session (e.g. recording, background). */
export { expoSetAudioModeAsync as setAudioModeAsync }
