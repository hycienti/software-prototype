import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTherapistThreads } from '@/hooks/useTherapistApi';
import type { ThreadSummary } from '@/types/therapist';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ThreadRow({ item, onPress }: { item: ThreadSummary; onPress: () => void }) {
  const name = item.user?.fullName ?? `Client #${item.userId}`;
  const last = item.lastMessage;
  const preview = last?.body?.trim()
    ? last.body.slice(0, 50) + (last.body.length > 50 ? '...' : '')
    : last?.voiceUrl
      ? 'Voice message'
      : last?.attachmentUrls?.length
        ? 'Attachment'
        : 'No messages yet';
  const time = last ? formatTime(last.createdAt) : '';

  return (
    <Pressable onPress={onPress} className="active:opacity-90" style={styles.row}>
      <View style={styles.avatar}>
        {item.user?.avatarUrl ? (
          <Image
            source={{ uri: item.user.avatarUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.avatarImage, { backgroundColor: 'rgba(25,179,230,0.1)', alignItems: 'center', justifyContent: 'center' }]}>
            <MaterialIcons name="person" size={22} color="#19b3e6" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text className="font-semibold text-white" numberOfLines={1}>
            {name}
          </Text>
          {time ? (
            <Text className="text-white/30 text-[11px]">{time}</Text>
          ) : null}
        </View>
        <Text className="text-white/40 text-sm" numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#7a8a8e" />
    </Pressable>
  );
}

export default function MessagesListScreen() {
  const insets = useSafeAreaInsets();
  const { threads, loading, error } = useTherapistThreads();

  const handleThreadPress = (threadId: number) => {
    router.push({
      pathname: '/(therapist-tabs)/messages/thread/[threadId]' as any,
      params: { threadId: String(threadId) },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text className="text-white font-bold text-xl">Messages</Text>
        <Text className="text-white/40 mt-0.5 text-sm">Chat with your clients</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text className="text-white/40">{error}</Text>
        </View>
      ) : threads.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="chat-bubble-outline" size={48} color="#7a8a8e" />
          <Text className="text-white/40 mt-2 text-center">No conversations yet</Text>
          <Text className="text-white/30 mt-1 text-center text-xs">
            Start a chat from the Clients tab
          </Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ThreadRow item={item} onPress={() => handleThreadPress(item.id)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: { flex: 1, minWidth: 0 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
