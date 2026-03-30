import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTherapistSession, useTherapistPatchSessionSummary } from "@/hooks/useTherapistApi";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";

const SENTIMENTS = [
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
] as const;

function formatSessionTimeRange(scheduledAt: string, durationMinutes: number): string {
  try {
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const today = new Date();
    const isToday =
      start.getDate() === today.getDate() &&
      start.getMonth() === today.getMonth() &&
      start.getFullYear() === today.getFullYear();
    const dayLabel = isToday ? "Today" : start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${dayLabel} \u2022 ${startTime} - ${endTime}`;
  } catch {
    return `${scheduledAt} \u2022 ${durationMinutes} min`;
  }
}

function getInitials(name: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SessionSummaryScreen() {
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = params.sessionId ?? null;
  const insets = useSafeAreaInsets();
  const { session, loading, error, fetchSession } = useTherapistSession(sessionId);
  const { patchSummary, loading: submitting } = useTherapistPatchSessionSummary(sessionId);

  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative">("positive");
  const [engagementLevel, setEngagementLevel] = useState(85);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");

  const handleSave = useCallback(async () => {
    if (!sessionId) {
      router.replace("/(therapist-tabs)/dashboard" as any);
      return;
    }
    const notes = clinicalNotes.trim();
    if (!notes) {
      Alert.alert("Required", "Please enter clinical notes.");
      return;
    }
    try {
      await patchSummary({
        sentiment,
        engagementLevel,
        clinicalNotes: notes,
        followUpAt: followUpAt.trim() || undefined,
      });
      router.replace("/(therapist-tabs)/dashboard" as any);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to save summary. Please try again."
      );
    }
  }, [sessionId, sentiment, engagementLevel, clinicalNotes, followUpAt, patchSummary]);

  if (!sessionId) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: BG }}>
        <Text className="text-sm text-center" style={{ color: TEXT_SECONDARY }}>No session selected. Returning to dashboard.</Text>
        <Pressable
          onPress={() => router.replace("/(therapist-tabs)/dashboard" as any)}
          className="mt-4 h-12 px-6 rounded-full items-center justify-center"
          style={{ backgroundColor: PRIMARY }}
        >
          <Text className="text-white font-bold">Go to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  if (loading && !session && sessionId) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: BG }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-sm mt-2" style={{ color: TEXT_SECONDARY }}>Loading session...</Text>
      </View>
    );
  }

  if (error && !session) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: BG }}>
        <Text className="text-red-400 text-center text-sm">{error}</Text>
        <Pressable
          onPress={() => fetchSession()}
          className="mt-4 h-12 px-6 rounded-full items-center justify-center"
          style={{ backgroundColor: PRIMARY }}
        >
          <Text className="text-white font-bold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const clientName = session?.user?.fullName ?? "Client";
  const timeLabel = session
    ? formatSessionTimeRange(session.scheduledAt, session.durationMinutes ?? 50)
    : "\u2014";
  const durationDisplay = `${session?.durationMinutes ?? 50}:00`;

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      <View className="flex-1 max-w-[480px] w-full self-center px-6" style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom }}>
        <View className="pt-10 pb-6 flex-row items-start justify-between">
          <View>
            <Text className="text-white text-xl font-bold tracking-tight">Session Summary</Text>
            <Text className="text-sm font-medium mt-1" style={{ color: TEXT_SECONDARY }}>{timeLabel}</Text>
          </View>
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <MaterialIcons name="history-edu" size={20} color={TEXT_SECONDARY} />
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ gap: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          {/* Client info card */}
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(25,179,230,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <Text className="font-bold text-base" style={{ color: PRIMARY }}>{getInitials(clientName)}</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-base leading-tight">{clientName}</Text>
                  <Text className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ color: TEXT_MUTED }}>Psychotherapy</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white text-xl font-bold tracking-tight">{durationDisplay}</Text>
                <Text className="text-xs font-medium mt-0.5" style={{ color: TEXT_MUTED }}>Duration</Text>
              </View>
            </View>
          </View>

          {/* Sentiment card */}
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="auto-awesome" size={20} color={PRIMARY} />
                <Text className="font-semibold text-white text-sm">Session Sentiment</Text>
              </View>
              <View className="flex-row gap-2">
                {SENTIMENTS.map((s) => (
                  <Pressable
                    key={s.value}
                    onPress={() => setSentiment(s.value)}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: sentiment === s.value ? "rgba(25,179,230,0.15)" : "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: sentiment === s.value ? "rgba(25,179,230,0.3)" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: sentiment === s.value ? PRIMARY : TEXT_MUTED }}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-xs font-medium" style={{ color: TEXT_MUTED }}>Low</Text>
                <Text className="text-xs font-medium" style={{ color: TEXT_MUTED }}>High Engagement</Text>
              </View>
              <View className="h-2 w-full rounded overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <View style={{ height: "100%", width: `${engagementLevel}%`, backgroundColor: PRIMARY, borderRadius: 4 }} />
              </View>
              <Pressable onPress={() => setEngagementLevel((v) => (v >= 100 ? 0 : Math.min(100, v + 5)))} className="flex-row justify-between items-center">
                <Text className="text-xs" style={{ color: TEXT_MUTED }}>Tap to adjust: </Text>
                <Text className="text-sm font-bold text-white">{engagementLevel}%</Text>
              </Pressable>
              <Text className="text-sm leading-relaxed mt-1" style={{ color: TEXT_SECONDARY }}>
                {sentiment === "positive" && "Patient exhibited elevated mood markers and productive engagement with coping strategies."}
                {sentiment === "neutral" && "Session proceeded with steady engagement and neutral affect."}
                {sentiment === "negative" && "Patient presented with subdued affect; recommend follow-up and continued support."}
              </Text>
            </View>
          </View>

          {/* Clinical Notes */}
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, minHeight: 240 }}
          >
            <View className="flex-row items-center justify-between px-5 py-3" style={{ borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="sticky-note-2" size={20} color={TEXT_MUTED} />
                <Text className="font-semibold text-white text-sm">Clinical Notes</Text>
              </View>
              <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>Draft</Text>
            </View>
            <TextInput
              className="flex-1 min-h-[180px] px-5 py-5 text-sm leading-relaxed text-white"
              style={{ textAlignVertical: "top" }}
              placeholder="Write your observation notes here..."
              placeholderTextColor={TEXT_MUTED}
              multiline
              value={clinicalNotes}
              onChangeText={setClinicalNotes}
            />
          </View>

          {/* Follow-up */}
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="p-2.5 rounded-xl" style={{ backgroundColor: "rgba(245,158,11,0.15)" }}>
                  <MaterialIcons name="calendar-today" size={22} color="#f59e0b" />
                </View>
                <View>
                  <Text className="font-bold text-white text-sm">Schedule Follow-up</Text>
                  <Text className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>Tap to select time</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={TEXT_MUTED} />
            </View>
            <TextInput
              className="px-4 pb-3 pt-0 text-xs"
              style={{ color: TEXT_MUTED }}
              placeholder="Optional: 2026-02-10T10:00:00Z"
              placeholderTextColor={TEXT_MUTED}
              value={followUpAt}
              onChangeText={setFollowUpAt}
            />
          </View>
        </ScrollView>

        {/* Bottom fade + save button */}
        <LinearGradient
          colors={["transparent", "rgba(17,29,33,0.9)", BG]}
          locations={[0, 0.5, 1]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160 }}
          pointerEvents="none"
        />
        <View
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: 64, paddingHorizontal: 24, paddingBottom: Math.max(24, insets.bottom) }}
          pointerEvents="box-none"
        >
          <Pressable
            className="flex-row items-center justify-center gap-2 h-14 rounded-full active:scale-[0.98]"
            style={{
              backgroundColor: submitting ? "rgba(25,179,230,0.5)" : PRIMARY,
              ...Platform.select({
                ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
                android: { elevation: 8 },
              }),
            }}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="check-circle" size={22} color="white" />
            )}
            <Text className="text-white font-bold text-base">{submitting ? "Saving..." : "Save & Close"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
