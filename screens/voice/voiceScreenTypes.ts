export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface VoiceScreenProps {
  onBack?: () => void;
  onKeyboardPress?: () => void;
  conversationId?: number | null;
}

export const STEP_LABELS: Record<string, string> = {
  processing: "I'm thinking...",
  transcribing: 'Transcribing...',
  thinking: 'Thinking...',
  speaking: 'Preparing response...',
};

/**
 * Returns status text for the voice screen based on state and optional progress step.
 */
export function getStatusText(voiceState: VoiceState, progressStep: string | null): string {
  switch (voiceState) {
    case 'listening':
      return "I'm listening...";
    case 'thinking':
      if (progressStep) {
        return STEP_LABELS[progressStep] ?? `${progressStep.charAt(0).toUpperCase()}${progressStep.slice(1)}...`;
      }
      return "I'm thinking...";
    case 'speaking':
      return "I'm speaking...";
    default:
      return "Tap to speak...";
  }
}
