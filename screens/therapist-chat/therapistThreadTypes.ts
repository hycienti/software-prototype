export interface DirectMessageTherapistScreenProps {
  therapistId: number;
  sessionId?: number;
  therapistName?: string | null;
  onBack: () => void;
  /** When provided, the header video button navigates to the session video call (same as My Therapists "Join session"). */
  onVideoPress?: () => void;
}
