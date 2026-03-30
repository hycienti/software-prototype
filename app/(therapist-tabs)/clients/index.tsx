import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { therapistTabBarClearance } from '@/constants/therapistTabBar';
import { useTherapistClients } from '@/hooks/useTherapistApi';
import type { ClientItem } from '@/types/therapist';

const FILTERS = ['All', 'Anxiety', 'Depression', 'Recent'];

const imageShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  android: { elevation: 2 },
});

function formatDateOnly(iso: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatSessionDate(iso: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// --- Expanded client card ---

type ExpandedClientCardProps = {
  client: ClientItem;
  name: string;
  tagLabel: string;
  nextSessionLabel: string | null;
  onCollapse: () => void;
};

function ExpandedClientCard({
  client,
  name,
  tagLabel,
  nextSessionLabel,
  onCollapse,
}: ExpandedClientCardProps) {
  const handleMessage = () => {
    router.push({
      pathname: '/(therapist-tabs)/messages/client/[userId]' as any,
      params: { userId: String(client.userId) },
    });
  };

  return (
    <View className="rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/8 p-5">
      <Pressable onPress={onCollapse} className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-4">
          <View className="relative">
            <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center border border-white/10">
              {client.avatarUrl ? (
                <Image
                  source={{ uri: client.avatarUrl }}
                  className="w-14 h-14 rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="person" size={24} color="#19b3e6" />
              )}
            </View>
            {!!client.nextSessionAt && (
              <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#111d21] items-center justify-center bg-emerald-500">
                <MaterialIcons name="check" size={10} color="white" />
              </View>
            )}
          </View>
          <View>
            <Text className="text-white font-semibold leading-tight">{name}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <View className="px-2 py-0.5 rounded-full bg-[#19b3e6]/15">
                <Text className="font-bold uppercase tracking-wider text-[#19b3e6] text-[10px]">
                  {tagLabel}
                </Text>
              </View>
              <Text className="text-white/30 text-[11px]">
                Last: {formatDateOnly(client.lastSessionAt)}
              </Text>
            </View>
          </View>
        </View>
        <MaterialIcons name="expand-less" size={24} color="#19b3e6" />
      </Pressable>

      <View className="rounded-[20px] p-4 mb-5 bg-[#19b3e6]/5 border border-[#19b3e6]/10">
        <View className="flex-row items-center gap-2 mb-2">
          <MaterialIcons name="auto-awesome" size={16} color="#19b3e6" />
          <Text className="font-bold text-[#19b3e6] uppercase tracking-widest text-[10px]">
            Haven AI Insight
          </Text>
        </View>
        <Text className="text-white/50 leading-relaxed text-xs italic">
          Progress and session notes will appear here when available.
        </Text>
      </View>

      {nextSessionLabel && (
        <Pressable className="flex-row items-center justify-between px-3 py-3 rounded-2xl mb-5">
          <View className="flex-row items-center gap-3">
            <MaterialIcons name="calendar-today" size={18} color="#19b3e6" />
            <View>
              <Text className="text-[10px] uppercase tracking-tighter text-white/30 font-bold">
                Upcoming
              </Text>
              <Text className="font-semibold text-white text-sm">{nextSessionLabel}</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#7a8a8e" />
        </Pressable>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={handleMessage}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-[#19b3e6]/90 active:opacity-90"
        >
          <MaterialIcons name="chat-bubble" size={18} color="white" />
          <Text className="text-white font-bold text-xs">Message</Text>
        </Pressable>
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-[#19b3e6] active:opacity-90">
          <MaterialIcons name="edit-note" size={18} color="white" />
          <Text className="text-white font-bold text-xs">New Note</Text>
        </Pressable>
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 active:opacity-90">
          <MaterialIcons name="account-circle" size={18} color="#19b3e6" />
          <Text className="text-[#19b3e6] font-bold text-xs">Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Collapsed client card ---

type CollapsedClientCardProps = {
  client: ClientItem;
  name: string;
  tagLabel: string;
  onPress: () => void;
};

function CollapsedClientCard({ client, name, tagLabel, onPress }: CollapsedClientCardProps) {
  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <View className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/8 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4 flex-1">
            <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center border border-white/10">
              {client.avatarUrl ? (
                <Image
                  source={{ uri: client.avatarUrl }}
                  className="w-12 h-12 rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="person" size={20} color="#19b3e6" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">{name}</Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                <View className="px-2 py-0.5 rounded-full bg-[#19b3e6]/15">
                  <Text className="font-bold uppercase tracking-wider text-[#19b3e6] text-[9px]">
                    {tagLabel}
                  </Text>
                </View>
                <Text className="text-white/30 text-[11px]">
                  - {formatDateOnly(client.lastSessionAt)}
                </Text>
              </View>
            </View>
          </View>
          <MaterialIcons name="expand-more" size={24} color="#7a8a8e" />
        </View>
      </View>
    </Pressable>
  );
}

// --- Screen ---

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const { clients, loading, error, fetchClients } = useTherapistClients();
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleClientPress = (userId: number) => {
    setExpandedClient(expandedClient === userId ? null : userId);
  };

  const filteredBySearch = clients.filter((c) => {
    const name = c.fullName ?? c.email ?? '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const list =
    selectedFilter === 'Recent'
      ? filteredBySearch.filter((c) => c.sessionCount > 0)
      : filteredBySearch;

  const listPaddingBottom = therapistTabBarClearance(insets.bottom, 12);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-[#111d21]">
        <View className="w-full max-w-[480px] self-center flex-1">
          {/* Pinned: does not scroll with client list */}
          <View
            style={[styles.pinnedTop, { paddingTop: insets.top + 8 }]}
            className="border-b border-white/6 bg-[#0a1a1f]"
          >
            <View className="flex-row items-center h-10 justify-between px-6">
              <View className="w-10 h-10 shrink-0 items-center justify-center">
                <MaterialIcons name="spa" size={28} color="#19b3e6" />
              </View>
              <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/10 active:opacity-80">
                <MaterialIcons name="add" size={22} color="#19b3e6" />
              </Pressable>
            </View>
            <View className="mt-2 px-6">
              <Text className="text-white tracking-tight text-2xl font-semibold">My Clients</Text>
              <Text className="text-white/40 font-medium uppercase tracking-widest mt-1 text-xs">
                {list.length} Active {list.length === 1 ? 'Journey' : 'Journeys'}
              </Text>
            </View>

            <View className="px-6 pt-4">
              <View className="relative flex-row items-center">
                <View className="absolute left-4 z-10">
                  <MaterialIcons
                    name="search"
                    size={20}
                    color="#19b3e6"
                    style={{ opacity: isSearchFocused ? 1 : 0.5 }}
                  />
                </View>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search by name or concern..."
                  placeholderTextColor="#7a8a8e"
                  className="w-full h-12 pl-12 pr-12 rounded-2xl text-sm text-white bg-white/5 border"
                  style={{
                    borderColor: isSearchFocused ? '#19b3e6' : 'rgba(255,255,255,0.08)',
                  }}
                />
                <Pressable className="absolute right-4 z-10">
                  <MaterialIcons name="tune" size={20} color="#19b3e6" style={{ opacity: 0.5 }} />
                </Pressable>
              </View>
            </View>

            <View style={styles.filterRow}>
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.filterScroll}
                contentContainerStyle={styles.filterScrollContent}
              >
                {FILTERS.map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setSelectedFilter(f)}
                    className={`px-4 py-2.5 rounded-full border ${
                      selectedFilter === f
                        ? 'bg-[#19b3e6] border-[#19b3e6]'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selectedFilter === f ? 'text-white' : 'text-white/50'
                      }`}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {loading && !clients.length ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#19b3e6" />
              <Text className="text-white/40 mt-2">Loading clients...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center px-6">
              <Text className="text-center text-red-400">{error}</Text>
              <Pressable
                onPress={() => fetchClients()}
                className="mt-4 px-6 py-3 rounded-full bg-[#19b3e6]"
              >
                <Text className="text-white font-bold">Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-1 relative">
              <ScrollView
                style={styles.listScroll}
                contentContainerStyle={[styles.listContent, { paddingBottom: listPaddingBottom }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {list.map((client: ClientItem) => {
                  const isExpanded = expandedClient === client.userId;
                  const name = client.fullName ?? client.email ?? 'Client';
                  const tagLabel =
                    client.sessionCount > 0
                      ? `${client.sessionCount} session${client.sessionCount !== 1 ? 's' : ''}`
                      : 'New';
                  const nextSessionLabel = client.nextSessionAt
                    ? formatSessionDate(client.nextSessionAt)
                    : null;

                  if (isExpanded) {
                    return (
                      <ExpandedClientCard
                        key={client.userId}
                        client={client}
                        name={name}
                        tagLabel={tagLabel}
                        nextSessionLabel={nextSessionLabel}
                        onCollapse={() => handleClientPress(client.userId)}
                      />
                    );
                  }

                  return (
                    <CollapsedClientCard
                      key={client.userId}
                      client={client}
                      name={name}
                      tagLabel={tagLabel}
                      onPress={() => handleClientPress(client.userId)}
                    />
                  );
                })}
              </ScrollView>

              <View className="absolute bottom-24 right-6" style={{ maxWidth: 480 }}>
                <Pressable
                  className="w-14 h-14 rounded-2xl bg-[#19b3e6] items-center justify-center active:scale-95"
                  style={{
                    shadowColor: '#19b3e6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <MaterialIcons name="person-add" size={26} color="white" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pinnedTop: {
    flexShrink: 0,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  filterRow: {
    marginTop: 12,
    paddingBottom: 14,
  },
  filterScroll: {
    flexGrow: 0,
    maxHeight: 48,
  },
  filterScrollContent: {
    paddingHorizontal: 24,
    gap: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
});
