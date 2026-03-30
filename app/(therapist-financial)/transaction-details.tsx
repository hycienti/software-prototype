import React, { useState } from "react";
import { View, Pressable, StyleSheet, Platform, ScrollView, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.4)";

function normalizeStatus(status: string): "Completed" | "Pending" | "Failed" {
  const s = status.toLowerCase().replace(/-mck$/, "");
  if (s === "completed" || s === "succeeded") return "Completed";
  if (s === "pending" || s === "processing") return "Pending";
  return "Failed";
}

function statusStyle(status: "Completed" | "Pending" | "Failed") {
  switch (status) {
    case "Completed":
      return { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", color: "#34d399", icon: "check-circle" as const };
    case "Pending":
      return { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", color: "#fbbf24", icon: "pending" as const };
    default:
      return { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", color: "#f87171", icon: "error" as const };
  }
}

function formatDateOnly(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

const MOCK_DESTINATION = "Chase Bank ****4321";
const MOCK_TXID = "0x8f72a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f3a29b";

export default function TransactionDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    type?: string;
    id?: string;
    amount?: string;
    status?: string;
    requestedAt?: string;
    completedAt?: string;
    description?: string;
    createdAt?: string;
  }>();
  const [copyLabel, setCopyLabel] = useState<"Copy" | "Copied!">("Copy");

  const type = params.type ?? "withdrawal";
  const amountRaw = params.amount ?? "0.00";
  const amount = amountRaw.replace(/-mck$/i, "");
  const status = normalizeStatus(params.status ?? "pending");
  const style = statusStyle(status);
  const requestDate = formatDateOnly(params.requestedAt ?? params.createdAt ?? "");
  const completionDate = formatDateOnly(params.completedAt ?? "");
  const subtitle = type === "withdrawal" ? "Withdrawal to Chase Bank" : (params.description ?? "Transaction");
  const trxId = params.id ? `#TRX-${params.id.padStart(6, "0")}` : "#TRX-000000";

  const handleCopyTxid = () => {
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 2000);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      {/* Decorative blurs */}
      <View
        style={{
          position: "absolute",
          top: "15%",
          left: "15%",
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "rgba(25,179,230,0.12)",
          transform: [{ translateX: -50 }, { translateY: -50 }],
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "rgba(13,148,136,0.12)",
          transform: [{ translateX: 50 }, { translateY: 50 }],
        }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 max-w-[480px] w-full self-center p-4 pt-2">
          <View className="flex-row items-center justify-between pb-6">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              hitSlop={12}
            >
              <MaterialIcons name="close" size={22} color="white" />
            </Pressable>
            <Text className="font-semibold tracking-widest text-xs uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
              Transaction Details
            </Text>
            <View className="w-10 h-10" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              className="rounded-3xl overflow-hidden p-6 mb-4"
              style={{
                backgroundColor: CARD_BG,
                borderWidth: 1,
                borderColor: CARD_BORDER,
                ...Platform.select({
                  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 32 },
                  android: { elevation: 8 },
                }),
              }}
            >
              {/* Status badge */}
              <View className="items-center mb-6">
                <View
                  className="flex-row items-center rounded-full border px-4 py-1.5"
                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                >
                  <MaterialIcons name={style.icon} size={18} color={style.color} />
                  <Text className="font-semibold tracking-wide ml-2 text-sm" style={{ color: style.color }}>
                    {status}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View className="items-center mb-8">
                <Text className="text-white text-3xl font-bold tracking-tight mb-1">${amount}</Text>
                <Text className="text-sm" style={{ color: TEXT_MUTED }}>{subtitle}</Text>
              </View>

              <View className="h-px w-full mb-6" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

              {/* Details */}
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium" style={{ color: TEXT_MUTED }}>Transaction ID</Text>
                  <Text className="text-sm text-white font-semibold tracking-wide">{trxId}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium" style={{ color: TEXT_MUTED }}>Request Date</Text>
                  <Text className="text-sm text-white font-semibold tracking-wide">{requestDate || "\u2014"}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium" style={{ color: TEXT_MUTED }}>Completion Date</Text>
                  <Text className="text-sm text-white font-semibold tracking-wide">{completionDate || "\u2014"}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium" style={{ color: TEXT_MUTED }}>Destination</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="w-[22px] h-[22px] rounded-full items-center justify-center" style={{ backgroundColor: "rgba(34,197,94,0.2)" }}>
                      <MaterialIcons name="account-balance" size={14} color="rgba(34,197,94,0.9)" />
                    </View>
                    <Text className="text-sm text-white font-semibold tracking-wide">{MOCK_DESTINATION}</Text>
                  </View>
                </View>

                <View className="h-px my-2" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />

                {/* Blockchain TXID */}
                <View className="gap-2 pt-1">
                  <Text className="text-xs font-medium uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                    Blockchain TXID
                  </Text>
                  <Pressable
                    onPress={handleCopyTxid}
                    className="flex-row items-center justify-between rounded-lg p-3 active:opacity-80"
                    style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                  >
                    <Text className="text-sm max-w-[180px]" style={{ color: PRIMARY }} numberOfLines={1}>
                      {MOCK_TXID.slice(0, 6)}...{MOCK_TXID.slice(-4)}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs font-medium" style={{ color: TEXT_MUTED }}>{copyLabel}</Text>
                      <MaterialIcons name="content-copy" size={16} color={TEXT_MUTED} />
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Download PDF */}
              <Pressable
                className="mt-8 pt-4 rounded-3xl overflow-hidden min-h-12 justify-center active:opacity-90"
                style={{ borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)" }}
              >
                <View className="flex-row items-center justify-center gap-2 py-3.5">
                  <MaterialIcons name="download" size={20} color={PRIMARY} />
                  <Text className="text-white font-semibold text-sm">Download PDF Receipt</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>

          {/* Done button */}
          <View className="w-full pt-4" style={{ paddingBottom: 16 + insets.bottom }}>
            <Pressable
              onPress={() => router.back()}
              className="w-full h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: PRIMARY }}
            >
              <Text className="text-white font-bold text-base">Done</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
