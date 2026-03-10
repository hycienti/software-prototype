import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';

const PLAYBACK_VOLUME = 0.3;

const MUSIC_URLS: Record<string, string> = {
  rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  zen: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
};

interface UseBreathingAudioOptions {
  musicKey: string;
  enableMusic: boolean;
  isPaused: boolean;
}

interface UseBreathingAudioReturn {
  isMuted: boolean;
  toggleMute: () => void;
}

export function useBreathingAudio({
  musicKey,
  enableMusic,
  isPaused,
}: UseBreathingAudioOptions): UseBreathingAudioReturn {
  const [isMuted, setIsMuted] = useState(!enableMusic);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isDisposingRef = useRef(false);

  // -- Core helpers (ref-based, no stale closures) --

  const dispose = useCallback(async () => {
    isDisposingRef.current = true;
    const sound = soundRef.current;
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) await sound.stopAsync();
        await new Promise((r) => setTimeout(r, 50));
        await sound.unloadAsync();
      }
    } catch (_) {
      /* already unloaded */
    } finally {
      soundRef.current = null;
      isDisposingRef.current = false;
    }

    stopSpeech();
  }, []);

  // -- Load / unload based on musicKey + enableMusic --

  useEffect(() => {
    if (!enableMusic) {
      dispose();
      return;
    }

    let cancelled = false;

    (async () => {
      await dispose();
      if (cancelled) return;

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: MUSIC_URLS[musicKey] || MUSIC_URLS.rain },
          {
            shouldPlay: !isPaused,
            isLooping: true,
            volume: isMuted ? 0 : PLAYBACK_VOLUME,
          },
        );

        if (cancelled) {
          await sound.unloadAsync().catch(() => {});
          return;
        }

        soundRef.current = sound;
      } catch (error) {
        if (__DEV__) console.warn('useBreathingAudio: load failed', error);
      }
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, [musicKey, enableMusic]);

  // -- Volume-based mute (no destroy/reload) --

  const toggleMute = useCallback(async () => {
    setIsMuted((prev) => {
      const next = !prev;
      const sound = soundRef.current;
      if (sound) {
        sound.setVolumeAsync(next ? 0 : PLAYBACK_VOLUME).catch(() => {});
      }
      return next;
    });
  }, []);

  // -- Pause / resume reactivity --

  useEffect(() => {
    const sound = soundRef.current;
    if (!sound || !enableMusic) return;

    (async () => {
      try {
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) return;

        if (isPaused && status.isPlaying) {
          await sound.pauseAsync();
        } else if (!isPaused && !status.isPlaying) {
          await sound.playAsync();
        }
      } catch (_) {
        /* sound may have been disposed between check and action */
      }
    })();
  }, [isPaused, enableMusic]);

  // -- Cleanup on screen blur --

  useFocusEffect(
    useCallback(() => {
      return () => { dispose(); };
    }, [dispose]),
  );

  // -- Cleanup on unmount --

  useEffect(() => {
    return () => { dispose(); };
  }, [dispose]);

  return { isMuted, toggleMute };
}

function stopSpeech() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Speech = require('expo-speech');
    if (Speech?.stop) Speech.stop();
  } catch (_) {
    /* expo-speech not available */
  }
}
