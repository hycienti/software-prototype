import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

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
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const isDisposingRef = useRef(false);

  const dispose = useCallback(async () => {
    isDisposingRef.current = true;
    const player = playerRef.current;
    if (!player) {
      isDisposingRef.current = false;
      return;
    }
    try {
      player.pause();
      player.remove();
    } catch {
      /* already disposed */
    } finally {
      playerRef.current = null;
      isDisposingRef.current = false;
    }
    stopSpeech();
  }, []);

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
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: 'duckOthers',
        });

        const uri = MUSIC_URLS[musicKey] || MUSIC_URLS.rain;
        const player = createAudioPlayer(uri, {});

        if (cancelled) {
          player.remove();
          return;
        }

        player.loop = true;
        player.volume = isMuted ? 0 : PLAYBACK_VOLUME;
        playerRef.current = player;

        if (!isPaused) {
          player.play();
        }
      } catch (error) {
        if (__DEV__) console.warn('useBreathingAudio: load failed', error);
      }
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, [musicKey, enableMusic, dispose]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const player = playerRef.current;
      if (player) {
        player.volume = next ? 0 : PLAYBACK_VOLUME;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !enableMusic) return;

    if (isPaused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPaused, enableMusic]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispose();
      };
    }, [dispose])
  );

  useEffect(() => {
    return () => {
      dispose();
    };
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
  } catch {
    /* expo-speech not available */
  }
}
