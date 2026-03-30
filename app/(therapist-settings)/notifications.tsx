import React from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTherapistNotifications } from "@/hooks/useTherapistApi";
import type { NotificationItem } from "@/types/therapist";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";

type IconConfig = { icon: string; bg: string; color: string };
const TYPE_CONFIG: Record<string, IconConfig> = {
  session: { icon: "event", bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  "session-mck": { icon: "event", bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  payout: { icon: "account-balance-wallet", bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  "payout-mck": { icon: "account-balance-wallet", bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  client: { icon: "person-add", bg: "rgba(217,119,6,0.15)", color: "#d97706" },
  "client-mck": { icon: "person-add", bg: "rgba(217,119,6,0.15)", color: "#d97706" },
  completed: { icon: "event-available", bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  feature: { icon: "auto-awesome", bg: "rgba(168,85,247,0.15)", color: "#a855f7" },
};
const DEFAULT_ICON: IconConfig = { icon: "notifications", bg: "rgba(100,116,139,0.15)", color: "#64748b" };

function getIconConfig(type: string): IconConfig {
  return TYPE_CONFIG[type] ?? DEFAULT_ICON;
}

function isClientType(type: string): boolean {
  return type === "client" || type === "client-mck";
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAllRead,
    markRead,
    removeNotification,
  } = useTherapistNotifications();

  const unread = notifications.filter((n: NotificationItem) => !n.isRead);
  const read = notifications.filter((n: NotificationItem) => n.isRead);

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAllRead();
  };

  if (loading && notifications.length === 0) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BG }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="mt-2 text-sm" style={{ color: TEXT_MUTED }}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: BG, paddingBottom: Math.max(insets.bottom, 24) }}>
      <View className="flex-1 max-w-[480px] w-full self-center px-6" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between mb-8 pt-4">
          <View>
            <Text className="text-white text-2xl font-bold tracking-tight">Notifications</Text>
            <Text className="text-sm font-medium mt-0.5" style={{ color: TEXT_SECONDARY }}>Your practice at a glance</Text>
          </View>
          <Pressable
            onPress={handleClearAll}
            className="px-4 py-2 rounded-full active:opacity-80"
            style={{ backgroundColor: "rgba(25,179,230,0.1)" }}
          >
            <Text className="font-semibold text-sm" style={{ color: PRIMARY }}>Clear All</Text>
          </Pressable>
        </View>

        {error ? (
          <View className="px-6 py-3">
            <Text className="text-sm" style={{ color: "#f87171" }}>{error}</Text>
            <Pressable onPress={() => fetchNotifications()} className="mt-2">
              <Text className="font-semibold text-sm" style={{ color: PRIMARY }}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View className="py-12 items-center">
                <MaterialIcons name="notifications-none" size={48} color={TEXT_MUTED} />
                <Text className="mt-2 text-sm" style={{ color: TEXT_MUTED }}>No notifications yet</Text>
              </View>
            ) : (
              <>
                {unread.length > 0 && (
                  <>
                    <View className="mb-2 ml-1">
                      <Text className="text-xs uppercase tracking-widest font-semibold" style={{ color: TEXT_SECONDARY }}>Newest</Text>
                    </View>
                    {unread.map((n: NotificationItem) => (
                      <NotificationCard
                        key={n.id}
                        item={n}
                        onMarkRead={() => markRead(n.id)}
                        onRemove={() => removeNotification(n.id)}
                        dimmed={false}
                      />
                    ))}
                  </>
                )}
                {read.length > 0 && (
                  <>
                    <View className="mt-4 mb-2 ml-1">
                      <Text className="text-xs uppercase tracking-widest font-semibold" style={{ color: TEXT_SECONDARY }}>Earlier</Text>
                    </View>
                    {read.map((n: NotificationItem) => (
                      <NotificationCard
                        key={n.id}
                        item={n}
                        onMarkRead={() => markRead(n.id)}
                        onRemove={() => removeNotification(n.id)}
                        dimmed
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function NotificationCard({
  item,
  onMarkRead,
  onRemove,
  dimmed,
}: {
  item: NotificationItem;
  onMarkRead: () => void;
  onRemove: () => void;
  dimmed?: boolean;
}) {
  const config = getIconConfig(item.type);
  const showClientActions = isClientType(item.type);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!item.isRead) onMarkRead();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`mb-4 rounded-2xl overflow-hidden active:scale-[0.98] ${dimmed ? "opacity-70" : ""}`}
      style={{
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        ...Platform.select({
          ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
          android: { elevation: 2 },
        }),
      }}
    >
      <View className="flex-row gap-4 p-4">
        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: config.bg }}>
          <MaterialIcons name={config.icon as any} size={24} color={config.color} />
        </View>
        <View className="flex-1 min-w-0">
          <View className="flex-row justify-between items-start">
            <Text className="font-bold text-white text-sm flex-1" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs" style={{ color: TEXT_SECONDARY }}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
          <Text className="text-sm mt-0.5" style={{ color: TEXT_SECONDARY }} numberOfLines={3}>
            {item.message}
          </Text>
          {showClientActions && (
            <View className="flex-row gap-2 mt-3">
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMarkRead(); }} className="active:opacity-90">
                <Text className="font-bold text-sm" style={{ color: PRIMARY }}>View</Text>
              </Pressable>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRemove(); }} className="active:opacity-90">
                <Text className="font-bold text-sm" style={{ color: TEXT_SECONDARY }}>Decline</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
