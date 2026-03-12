# Whisper models for speech-to-text

To use client-side STT with whisper.rn, place the model files in the app's document directory (e.g. copy on first launch or download at runtime).

- **Whisper**: e.g. `ggml-tiny.en.bin` from [whisper.cpp Hugging Face](https://huggingface.co/ggerganov/whisper.cpp)
- **VAD (optional)**: e.g. `ggml-silero-v6.2.0.bin` for better speech detection

The app uses `getDocumentDirWhisperModelPaths()` and expects these filenames in `FileSystem.documentDirectory`. Ensure your first-run or onboarding flow copies or downloads the models there.
