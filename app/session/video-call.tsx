import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Alias for older links. Therapist video lives at (therapist-sessions)/video-session.
 */
export default function SessionVideoCallAlias() {
  const p = useLocalSearchParams<{
    sessionId?: string;
    meetingId?: string;
    token?: string;
    clientName?: string;
  }>();

  return (
    <Redirect
      href={
        {
          pathname: '/(therapist-sessions)/video-session',
          params: {
            ...(p.sessionId ? { sessionId: String(p.sessionId) } : {}),
            ...(p.meetingId ? { meetingId: String(p.meetingId) } : {}),
            ...(p.token ? { token: String(p.token) } : {}),
            ...(p.clientName ? { clientName: String(p.clientName) } : {}),
          },
        } as any
      }
    />
  );
}
