import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTherapistWallet } from "@/hooks/useTherapistApi";
function formatWithdrawalDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";

type FilterChip = "All" | "Completed" | "Pending" | "Failed";

function normalizeStatus(status: string): FilterChip {
  const s = status.toLowerCase().replace(/-mck$/, "");
  if (s === "completed" || s === "succeeded") return "Completed";
  if (s === "pending" || s === "processing") return "Pending";
  return "Failed";
}

function statusStyle(status: FilterChip) {
  switch (status) {
    case "Completed":
      return { bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: "check-circle" as const };
    case "Pending":
      return { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", icon: "pending" as const };
    default:
      return { bg: "rgba(239,68,68,0.15)", color: "#f87171", icon: "error" as const };
  }
}

export default function WithdrawalHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { data: wallet, loading, error, fetchWallet } = useTherapistWallet();
  const [filter, setFilter] = useState<FilterChip>("All");

  const withdrawals = wallet?.recentWithdrawals ?? [];
  const totalWithdrawnCents = withdrawals.reduce((sum: number, w: any) => sum + w.amountCents, 0);
  const totalWithdrawn = (totalWithdrawnCents / 100).toFixed(2);

  const filtered = useMemo(() => {
    if (filter === "All") return withdrawals;
    return withdrawals.filter((w: any) => normalizeStatus(w.status) === filter);
  }, [withdrawals, filter]);

  if (loading && !wallet) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BG, paddingTop: insets.top + 80 }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="mt-2 text-sm" style={{ color: TEXT_SECONDARY }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      {/* Header */}
      <View
        className="px-4 z-50"
        style={{ paddingTop: insets.top + 12, paddingBottom: 16 }}
      >
        <View className="flex-row items-center justify-between py-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back-ios" size={22} color="white" />
          </Pressable>
          <Text className="text-white font-bold text-lg tracking-tight">Withdrawal History</Text>
          <View className="w-10 h-10" />
        </View>
      </View>

      {error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-400 text-center text-sm">{error}</Text>
          <Pressable
            onPress={() => fetchWallet()}
            className="mt-4 h-12 px-6 rounded-full items-center justify-center"
            style={{ backgroundColor: PRIMARY }}
          >
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 24, paddingBottom: 32 + 40 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {/* Total Withdrawn Card */}
          <View
            className="rounded-3xl p-8 items-center justify-center"
            style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
          >
            <Text className="font-semibold text-xs uppercase tracking-widest" style={{ color: TEXT_SECONDARY }}>
              Total Withdrawn
            </Text>
            <Text className="text-3xl font-bold tracking-tight mt-2" style={{ color: PRIMARY }}>
              ${totalWithdrawn.replace(/-mck$/i, "")}
            </Text>
            <View className="flex-row items-center gap-1 px-3 py-1 rounded-full mt-2" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
              <MaterialIcons name="trending-up" size={14} color="#34d399" />
              <Text className="font-bold text-xs" style={{ color: "#34d399" }}>+12% this month</Text>
            </View>
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingBottom: 8 }}
            className="-mx-4"
          >
            {(["All", "Completed", "Pending", "Failed"] as const).map((label) => (
              <Pressable
                key={label}
                onPress={() => setFilter(label)}
                className="h-10 min-w-[80px] px-4 rounded-full items-center justify-center"
                style={{
                  backgroundColor: filter === label ? PRIMARY : "rgba(255,255,255,0.08)",
                  borderWidth: filter === label ? 0 : 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  className={`text-sm font-medium ${filter === label ? "text-white font-semibold" : ""}`}
                  style={filter !== label ? { color: TEXT_SECONDARY } : undefined}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="font-semibold text-xs uppercase tracking-widest ml-2" style={{ color: TEXT_SECONDARY }}>
            Recent Transactions
          </Text>

          <View className="gap-4">
            {filtered.length === 0 ? (
              <View
                className="rounded-2xl p-8 items-center"
                style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
              >
                <MaterialIcons name="account-balance-wallet" size={48} color={TEXT_MUTED} />
                <Text className="mt-2 text-sm" style={{ color: TEXT_SECONDARY }}>No withdrawals yet</Text>
              </View>
            ) : (
              filtered.map((w: any) => {
                const status = normalizeStatus(w.status);
                const style = statusStyle(status);
                const isFailed = status === "Failed";
                const amountDisplay = w.amount.replace(/-mck$/i, "");
                return (
                  <Pressable
                    key={w.id}
                    onPress={() =>
                      router.push({
                        pathname: "/(therapist-financial)/transaction-details" as any,
                        params: {
                          type: "withdrawal",
                          id: String(w.id),
                          amount: w.amount,
                          description: `Withdrawal #${w.id}`,
                          createdAt: w.requestedAt,
                          status: w.status,
                          requestedAt: w.requestedAt,
                          completedAt: w.completedAt ?? "",
                        },
                      })
                    }
                    className={`rounded-3xl overflow-hidden p-5 active:scale-[0.98] ${isFailed ? "opacity-80" : ""}`}
                    style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
                  >
                    <View className="gap-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <View
                            className="w-12 h-12 rounded-full items-center justify-center"
                            style={{ backgroundColor: style.bg }}
                          >
                            <MaterialIcons name={style.icon} size={24} color={style.color} />
                          </View>
                          <View className="gap-0.5">
                            <Text className="text-white font-bold text-base">-${amountDisplay}</Text>
                            <Text className="text-xs font-medium" style={{ color: style.color }}>{status}</Text>
                          </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={TEXT_MUTED} />
                      </View>
                      <View className="h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="account-balance" size={18} color={TEXT_SECONDARY} />
                          <Text className="text-sm" style={{ color: TEXT_SECONDARY }}>Bank transfer</Text>
                        </View>
                        <Text className="text-xs" style={{ color: TEXT_MUTED }}>
                          {typeof formatWithdrawalDate === "function" ? formatWithdrawalDate(w.requestedAt) : w.requestedAt}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
