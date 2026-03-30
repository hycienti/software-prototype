import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Alert,
  Animated,
  Text,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  RTCView,
  MediaStream,
  register,
} from "@videosdk.live/react-native-sdk";
import { useAuthStore } from "@/store";
import { useTherapistSession, useTherapistCreateRoom } from "@/hooks/useTherapistApi";
import { getLastTestRoomCredentials, clearLastTestRoomCredentials } from "@/services/therapist/sessions";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const BG_ALT = "#0d1619";
const TEXT_MUTED = "rgba(255,255,255,0.4)";

function formatTimeDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Register VideoSDK once (required for native modules)
let registered = false;
function ensureRegistered() {
  if (!registered) {
    try {
      register();
      registered = true;
    } catch (_) {
      // may fail in Expo Go; use dev build for full VideoSDK
    }
  }
}

const PLACEHOLDER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAiQmHFoG09IqQ1DwrlmCSYSZJ5rmW8B5SIU-UiDZDNtFV_yx-DRlCSGL1n7WvDdEHFBsRZRwmW7s9ftvfJTaquOngyKMeIKhkq2RXC_DX6kRZ28KyO8jmaaI5Qze2pC7xLmJi-HhxNrCwc3JJLtTTWxgR37MFNWPN5IdhcgyHDCLVpIbGMKmAbdR-ptdi_MPH3dvA0jP2IxY0BxuRZWc5upxmC247SJAbeQjvRH2CVCsM-DLETWIyljuQjPsDm3P6V6odB5YqFfAM";

const FROSTED_STYLE = {
  backgroundColor: "rgba(20, 30, 35, 0.65)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.1)",
  overflow: "hidden" as const,
};

function ParticipantView({
  participantId,
  style,
  objectFit = "cover",
  mirror = false,
  zOrder = 0,
}: {
  participantId: string;
  style: object;
  objectFit?: "contain" | "cover";
  mirror?: boolean;
  zOrder?: number;
}) {
  const { webcamStream, webcamOn, isLocal, consumeWebcamStreams } = useParticipant(participantId);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (isLocal || consumedRef.current) return;
    consumeWebcamStreams?.();
    consumedRef.current = true;
  }, [isLocal, consumeWebcamStreams]);

  if (webcamOn && webcamStream) {
    return (
      <RTCView
        streamURL={new MediaStream([webcamStream.track]).toURL()}
        objectFit={objectFit}
        style={style}
        mirror={mirror}
        zOrder={zOrder}
      />
    );
  }

  return (
    <View style={[style, styles.placeholderVideo]}>
      <MaterialIcons name="person" size={48} color={TEXT_MUTED} />
    </View>
  );
}

function CallUI({
  clientDisplayName = "Sarah Jenkins",
  sessionId,
}: {
  clientDisplayName?: string;
  sessionId?: string | null;
}) {
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    toggleScreenShare,
    participants,
    localParticipant,
  } = useMeeting({
    onMeetingJoined: () => {
      intervalRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    },
    onMeetingLeft: () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.replace({
        pathname: "/(therapist-sessions)/session-summary" as any,
        params: sessionId ? { sessionId: String(sessionId) } : undefined,
      });
    },
    onError: (err: any) => Alert.alert("Call error", err?.message ?? "Something went wrong"),
  });

  const localId = localParticipant?.id;
  const participantsList = Array.from(participants?.entries() ?? []).filter(
    ([id]) => id !== localId
  );
  const firstRemoteId = participantsList[0]?.[0];
  const remoteDisplayName =
    firstRemoteId && participants.get(firstRemoteId)?.displayName
      ? String(participants.get(firstRemoteId)!.displayName)
      : clientDisplayName;

  useEffect(() => {
    join();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const handleLeave = useCallback(() => {
    try {
      if (typeof leave === "function") leave();
    } catch {
      // SDK may have already torn down
    }
    router.replace({
      pathname: "/(therapist-sessions)/session-summary" as any,
      params: sessionId ? { sessionId: String(sessionId) } : undefined,
    });
  }, [leave, sessionId]);

  const handleEndCall = useCallback(() => {
    Alert.alert("End session", "Are you sure you want to end this session?", [
      { text: "Cancel", style: "cancel" },
      { text: "End", style: "destructive", onPress: handleLeave },
    ]);
  }, [handleLeave]);

  return (
    <View className="flex-1" style={{ backgroundColor: BG, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32, paddingHorizontal: 16 }}>
      {/* Full-screen background: remote participant or placeholder */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {firstRemoteId ? (
          <ParticipantView
            participantId={firstRemoteId}
            style={StyleSheet.absoluteFill}
            objectFit="cover"
            mirror={false}
            zOrder={0}
          />
        ) : (
          <Image
            source={{ uri: PLACEHOLDER_IMAGE }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
          style={StyleSheet.absoluteFill}
          locations={[0, 0.5, 1]}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={Platform.OS === "ios" ? 80 : 120} tint="dark" style={[styles.frostedPill, styles.shadowLg]}>
          <Animated.View style={[styles.recDot, { opacity: pulseAnim }]} />
          <View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Session with</Text>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }} numberOfLines={1}>{remoteDisplayName}</Text>
          </View>
          <View style={styles.pillDivider} />
          <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "500", fontSize: 13, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>
            {formatTimeDuration(elapsed)}
          </Text>
        </BlurView>

        {/* PiP */}
        <View style={[styles.pip, styles.shadow2xl]}>
          {localId ? (
            <ParticipantView
              participantId={localId}
              style={styles.pipVideo}
              objectFit="cover"
              mirror={true}
              zOrder={1}
            />
          ) : (
            <View style={[styles.pipVideo, styles.placeholderVideo]}>
              <MaterialIcons name="person" size={40} color={TEXT_MUTED} />
            </View>
          )}
          <View style={styles.pipLabel}>
            <View style={styles.greenDot} />
            <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "500", fontSize: 11 }}>You</Text>
          </View>
        </View>
      </View>

      {/* Main: sidebar */}
      <View style={styles.main} pointerEvents="box-none">
        <View style={styles.sidebarWrap} pointerEvents="box-none">
          <BlurView intensity={Platform.OS === "ios" ? 40 : 80} tint="dark" style={styles.sidebarToggleBlur}>
            <Pressable style={({ pressed }) => [styles.sidebarToggle, pressed && styles.sidebarTogglePressed]}>
              <MaterialIcons name="space-dashboard" size={20} color="white" />
            </Pressable>
          </BlurView>
          <BlurView intensity={Platform.OS === "ios" ? 60 : 100} tint="dark" style={styles.sidebarPanel}>
            <View style={styles.sidebarInner}>
              <View style={styles.insightsSection}>
                <View style={styles.sidebarHeaderRow}>
                  <MaterialIcons name="smart-toy" size={20} color={PRIMARY} />
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>AI Live Insights</Text>
                </View>
                <View style={styles.insightBlock}>
                  <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Emotional Shift</Text>
                  <View style={styles.insightRow}>
                    <Text style={{ color: "white", fontSize: 11 }}>Anxiety peaking</Text>
                    <MaterialIcons name="trending-up" size={14} color="#facc15" />
                  </View>
                </View>
                <View style={styles.insightBlock}>
                  <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Key Themes</Text>
                  <View style={styles.themeChips}>
                    <View style={styles.themeChip}>
                      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 11 }}>Work stress</Text>
                    </View>
                    <View style={styles.themeChip}>
                      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 11 }}>Sleep</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.notesSection}>
                <View style={styles.notesHeader}>
                  <View style={styles.notesHeaderRow}>
                    <MaterialIcons name="edit-note" size={18} color={TEXT_MUTED} />
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>Quick Notes</Text>
                  </View>
                  <Pressable hitSlop={12}>
                    <MaterialIcons name="add" size={20} color={PRIMARY} />
                  </Pressable>
                </View>
                <ScrollView style={styles.notesScroll} contentContainerStyle={styles.notesScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, lineHeight: 18 }}>
                    Client mentioned difficulty sleeping over the weekend. Suggesting grounding techniques for pre-sleep routine.
                  </Text>
                  <View style={styles.noteDivider} />
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontStyle: "italic" }}>Tap to add new note...</Text>
                </ScrollView>
              </View>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Footer controls */}
      <View style={styles.footer}>
        <BlurView intensity={Platform.OS === "ios" ? 80 : 120} tint="dark" style={[styles.controlsPill, styles.shadow2xl]}>
          <Pressable
            style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
            onPress={() => {
              toggleMic();
              setMicOn((p) => !p);
            }}
          >
            <MaterialIcons name={micOn ? "mic" : "mic-off"} size={24} color="white" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
            onPress={() => toggleWebcam()}
          >
            <MaterialIcons name="videocam" size={24} color="white" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
            onPress={() => toggleScreenShare()}
          >
            <MaterialIcons name="present-to-all" size={24} color="white" />
          </Pressable>
          <View style={styles.controlsDivider} />
          <Pressable
            style={({ pressed }) => [styles.endBtn, styles.endBtnShadow, pressed && styles.endBtnPressed]}
            onPress={handleEndCall}
          >
            <MaterialIcons name="call-end" size={24} color="white" />
          </Pressable>
        </BlurView>
      </View>
    </View>
  );
}

export default function VideoSessionScreen() {
  const params = useLocalSearchParams<{
    sessionId?: string;
    meetingId?: string;
    token?: string;
    clientName?: string;
  }>();
  const token = useAuthStore((s) => s.token);
  const authToken = token;
  const sessionId = params.sessionId ?? null;
  const { session } = useTherapistSession(sessionId);
  const {
    createRoomAsync,
    loading: roomLoading,
    error: roomError,
  } = useTherapistCreateRoom(sessionId);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>((params.clientName as string) || "Sarah Jenkins");
  const [error, setError] = useState<string | null>(null);

  const meetingIdParam = params.meetingId as string | undefined;
  const videoTokenParam = params.token as string | undefined;
  useEffect(() => {
    if (meetingIdParam) setMeetingId(meetingIdParam);
    if (videoTokenParam) setVideoToken(videoTokenParam);
  }, [meetingIdParam, videoTokenParam]);

  useEffect(() => {
    ensureRegistered();
  }, []);

  useEffect(() => {
    if (session?.user?.fullName) {
      setClientName(session.user.fullName || "Client");
    }
  }, [session]);

  const createRoomOnceRef = useRef(false);
  useEffect(() => {
    createRoomOnceRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (meetingIdParam || !sessionId || !authToken || createRoomOnceRef.current) return;
    createRoomOnceRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const data = await createRoomAsync();
        if (!cancelled && data?.meetingId && data?.token) {
          setMeetingId(data.meetingId);
          setVideoToken(data.token);
        }
      } catch {
        if (!cancelled) {
          setError("Could not create the video room. Try again or check the session is still scheduled.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, authToken, meetingIdParam, createRoomAsync]);

  useEffect(() => {
    if (roomError) setError(roomError);
  }, [roomError]);

  useEffect(() => {
    if (sessionId && !authToken) {
      setError("Sign in to start the session.");
    }
  }, [sessionId, authToken]);

  const createRoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!sessionId || !authToken || !roomLoading) return;
    createRoomTimeoutRef.current = setTimeout(() => {
      setError("Creating room timed out. Check your connection and try again.");
    }, 20000);
    return () => {
      if (createRoomTimeoutRef.current) {
        clearTimeout(createRoomTimeoutRef.current);
        createRoomTimeoutRef.current = null;
      }
    };
  }, [sessionId, authToken, roomLoading]);
  useEffect(() => {
    if (meetingId && createRoomTimeoutRef.current) {
      clearTimeout(createRoomTimeoutRef.current);
      createRoomTimeoutRef.current = null;
    }
  }, [meetingId]);

  useEffect(() => {
    if (sessionId || authToken) return;
    if (!meetingIdParam) {
      setError("Open a video session from the dashboard (Join Video Call or Test video call).");
      return;
    }
    const creds = getLastTestRoomCredentials(meetingIdParam);
    if (!creds?.token) {
      setError('Session expired or invalid. Use "Test video call" from the dashboard again.');
      return;
    }
    clearLastTestRoomCredentials();
    setMeetingId(creds.meetingId);
    setVideoToken(creds.token);
  }, [sessionId, authToken, meetingIdParam]);

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: BG }}>
        <LinearGradient colors={[BG, BG_ALT]} style={StyleSheet.absoluteFill} />
        <View className="flex-1 justify-center items-center p-6">
          <MaterialIcons name="error-outline" size={48} color={TEXT_MUTED} />
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18, marginTop: 12 }}>Cannot start session</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center", fontSize: 14 }}>{error}</Text>
          <Pressable
            className="mt-6 py-3 px-6 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onPress={() => router.back()}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!meetingId) {
    return (
      <View className="flex-1" style={{ backgroundColor: BG }}>
        <LinearGradient colors={[BG, BG_ALT]} style={StyleSheet.absoluteFill} />
        <View className="flex-1 justify-center items-center p-6">
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Starting session...</Text>
        </View>
      </View>
    );
  }

  const finalToken = videoToken ?? videoTokenParam ?? "";
  if (!finalToken) {
    return (
      <View className="flex-1" style={{ backgroundColor: BG }}>
        <LinearGradient colors={[BG, BG_ALT]} style={StyleSheet.absoluteFill} />
        <View className="flex-1 justify-center items-center p-6">
          <MaterialIcons name="error-outline" size={48} color={TEXT_MUTED} />
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18, marginTop: 12 }}>Cannot start session</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center", fontSize: 14 }}>
            Missing video token. Open from the dashboard (Join or Test video call).
          </Text>
          <Pressable
            className="mt-6 py-3 px-6 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onPress={() => router.back()}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId: meetingIdParam || meetingId!,
        micEnabled: true,
        webcamEnabled: true,
        name: "Therapist",
        mode: "SEND_AND_RECV",
      }}
      token={videoTokenParam || finalToken}
    >
      <CallUI clientDisplayName={clientName} sessionId={sessionId} />
    </MeetingProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  frostedPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    gap: 12,
    ...FROSTED_STYLE,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  pillDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  pip: {
    width: 112,
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  shadowLg: {
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  shadow2xl: {
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24 },
      android: { elevation: 16 },
    }),
  },
  main: {
    flex: 1,
    position: "relative",
  },
  sidebarWrap: {
    position: "absolute",
    top: 16,
    right: 0,
    bottom: 16,
    width: 256,
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  sidebarToggleBlur: {
    alignSelf: "flex-end",
    marginRight: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  sidebarToggle: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarTogglePressed: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  sidebarPanel: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderRightWidth: 0,
    paddingBottom: 0,
    ...FROSTED_STYLE,
  },
  sidebarInner: {
    flex: 1,
    minHeight: 0,
  },
  insightsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  sidebarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  endBtnShadow: {
    ...Platform.select({
      ios: { shadowColor: "#ef4444", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  pipVideo: {
    width: "100%",
    height: "100%",
  },
  placeholderVideo: {
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  pipLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  insightBlock: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  themeChip: {
    backgroundColor: "rgba(25, 179, 230, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(25, 179, 230, 0.2)",
  },
  notesSection: {
    flex: 1,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  notesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notesScroll: {
    flex: 1,
    maxHeight: 140,
  },
  notesScrollContent: {
    paddingBottom: 8,
  },
  noteDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 20,
  },
  controlsPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9999,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: [{ scale: 0.95 }],
  },
  controlsDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  endBtn: {
    width: 56,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef4444",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  endBtnPressed: {
    backgroundColor: "#dc2626",
    transform: [{ scale: 0.95 }],
  },
});
