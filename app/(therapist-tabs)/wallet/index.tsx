import { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTherapistWallet } from '@/hooks/useTherapistApi';

const HAVEN_SAGE = '#5B7A7A';
const HAVEN_ACCENT = '#D4A574';

function getInitialsFromDescription(description: string | null): string {
  if (!description?.trim()) return '??';
  const match =
    description.match(/\bwith\s+([^.]+?)(?:\s*\.|$|\s+[•])/i) ||
    description.match(/\s+([A-Za-z.]+\s+[A-Za-z.]+)\s*$/);
  const namePart = (match ? match[1] : description).trim();
  const parts = namePart.split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return description.slice(0, 2).toUpperCase().replace(/\s/g, '');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

type RevenuePeriod = '3M' | '6M' | '1Y';

const FROSTED = {
  borderRadius: 12,
  overflow: 'hidden' as const,
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.05)',
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, fetchWallet } = useTherapistWallet();
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('3M');

  const balance = data?.balance ?? '0.00';
  const displayBalance = balance.replace(/-mck$/i, '');
  const transactions = data?.recentTransactions ?? [];
  const withdrawals = data?.recentWithdrawals ?? [];

  const allActivity = [
    ...transactions.map((t) => ({ ...t, kind: 'transaction' as const })),
    ...withdrawals.map((w) => ({
      id: w.id,
      amountCents: -w.amountCents,
      amount: `-${w.amount.replace(/-mck$/i, '')}`,
      type: 'Withdrawal',
      description: `Withdrawal #${w.id}`,
      createdAt: w.requestedAt,
      kind: 'withdrawal' as const,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const avatarBg = (index: number) => {
    if (index === 0) return { bg: `${HAVEN_SAGE}1A`, color: HAVEN_SAGE };
    if (index === 1) return { bg: '#1a2f2f', color: HAVEN_SAGE };
    if (index === 2) return { bg: `${HAVEN_ACCENT}1A`, color: HAVEN_ACCENT };
    return { bg: '#1a1f22', color: '#6B7280' };
  };

  return (
    <View className="flex-1 bg-[#111d21]">
      {/* Header */}
      <View
        className="bg-[#0a1a1f] border-b border-white/5"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <View className="flex-row items-center justify-between px-4 max-w-[480px] w-full self-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="white" />
          </Pressable>
          <Text className="text-white font-semibold tracking-tight text-base">
            Wallet & Earnings
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {loading && !data ? (
        <View className="flex-1 justify-center items-center p-6">
          <ActivityIndicator size="large" color={HAVEN_SAGE} />
          <Text className="text-white/40 mt-2">Loading...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-red-400 text-center">{error}</Text>
          <Pressable
            onPress={() => fetchWallet()}
            className="mt-4 px-6 py-3 rounded-full"
            style={{ backgroundColor: HAVEN_SAGE }}
          >
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 24,
            paddingHorizontal: 24,
            paddingBottom: 128 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <View className="mb-5" style={[FROSTED, { padding: 32, alignItems: 'center', minHeight: 220 }]}>
            <Text
              className="font-bold tracking-widest text-[11px] mb-2"
              style={{ color: HAVEN_SAGE }}
            >
              Available Balance
            </Text>
            <Text className="text-white font-bold tracking-tight text-4xl mb-8">
              ${displayBalance}
            </Text>
            <Pressable
              onPress={() => router.push('/payment' as any)}
              className="w-full rounded-full overflow-hidden active:opacity-95"
            >
              <LinearGradient
                colors={[HAVEN_SAGE, '#4D6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 56,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 24,
                }}
              >
                <MaterialIcons
                  name="payments"
                  size={22}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-bold tracking-wide">Withdraw Funds</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Revenue History */}
          <View className="mb-5" style={[FROSTED, { padding: 24 }]}>
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-white font-bold text-base">Revenue History</Text>
              <View className="flex-row bg-white/5 p-1 rounded-full gap-1">
                {(['3M', '6M', '1Y'] as const).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setRevenuePeriod(p)}
                    style={[
                      {
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: 9999,
                      },
                      revenuePeriod === p && {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                    ]}
                  >
                    <Text
                      className={`font-bold text-xs ${
                        revenuePeriod === p ? '' : 'text-white/30'
                      }`}
                      style={revenuePeriod === p ? { color: HAVEN_SAGE } : undefined}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View
              className="flex-row items-end justify-between px-2 gap-3"
              style={{ height: 176 }}
            >
              <View className="flex-1 items-center">
                <View
                  className="w-full rounded-t-xl"
                  style={{ height: '40%', backgroundColor: `${HAVEN_SAGE}26` }}
                />
                <Text className="mt-3 font-bold text-white/30 tracking-wide text-xs">May</Text>
              </View>
              <View className="flex-1 items-center">
                <View
                  className="w-full rounded-t-xl"
                  style={{ height: '65%', backgroundColor: `${HAVEN_SAGE}26` }}
                />
                <Text className="mt-3 font-bold text-white/30 tracking-wide text-xs">Jun</Text>
              </View>
              <View className="flex-1 items-center">
                <View
                  className="w-full rounded-t-xl"
                  style={{
                    height: '92%',
                    backgroundColor: `${HAVEN_ACCENT}CC`,
                    shadowColor: HAVEN_ACCENT,
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4,
                  }}
                />
                <Text
                  className="mt-3 font-bold tracking-wide text-xs"
                  style={{ color: HAVEN_ACCENT }}
                >
                  Jul
                </Text>
              </View>
            </View>
            <View className="mt-8 pt-6 border-t border-white/5 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="trending-up" size={18} color={HAVEN_SAGE} />
                <Text className="font-bold ml-1.5" style={{ color: HAVEN_SAGE }}>
                  +12.5% Growth
                </Text>
              </View>
              <Text className="text-white/40 font-medium text-sm">
                Total: <Text className="font-bold text-white">$7,250</Text>
              </Text>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-white font-bold text-base">Recent Activity</Text>
              <Pressable
                onPress={() => router.push('/payment-history' as any)}
                className="active:opacity-70"
              >
                <View className="flex-row items-center">
                  <Text className="font-bold" style={{ color: HAVEN_SAGE }}>
                    View All
                  </Text>
                  <MaterialIcons name="chevron-right" size={16} color={HAVEN_SAGE} />
                </View>
              </Pressable>
            </View>
            <View className="gap-3">
              {allActivity.length === 0 ? (
                <View className="bg-white/5 p-6 rounded-xl border border-white/5 items-center">
                  <Text className="text-white/40">No recent activity yet.</Text>
                </View>
              ) : (
                allActivity.slice(0, 6).map((item, index) => (
                  <Pressable
                    key={item.kind === 'withdrawal' ? `w-${item.id}` : `t-${item.id}`}
                    className={`flex-row items-center justify-between p-4 rounded-xl border bg-white/3 border-white/5 ${
                      index >= 3 ? 'opacity-70' : ''
                    }`}
                  >
                    <View className="flex-row items-center flex-1 min-w-0">
                      <View
                        className="w-11 h-11 rounded-full items-center justify-center"
                        style={{ backgroundColor: avatarBg(index).bg }}
                      >
                        <Text className="font-bold" style={{ color: avatarBg(index).color }}>
                          {item.kind === 'transaction'
                            ? getInitialsFromDescription(item.description)
                            : 'W'}
                        </Text>
                      </View>
                      <View className="ml-4 flex-1 min-w-0">
                        <Text className="font-bold text-white" numberOfLines={1}>
                          {item.kind === 'transaction'
                            ? (item.description ?? 'Session')
                            : item.description}
                        </Text>
                        <Text className="text-white/30 font-medium mt-0.5 text-xs">
                          {formatDate(item.createdAt)} - {item.type}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-bold text-white">
                        {item.amountCents >= 0 ? '+' : ''}
                        {item.amount.replace(/-mck$/i, '')}
                      </Text>
                      <Text
                        className="font-bold tracking-wide mt-0.5 text-xs"
                        style={{ color: HAVEN_SAGE }}
                      >
                        {item.amountCents >= 0 ? 'Deposited' : 'Withdrawal'}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
