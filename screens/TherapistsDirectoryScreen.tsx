import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/Icon';
import { TherapistCard } from '@/components/therapist/TherapistCard';
import { therapistsService } from '@/services/therapists';
import { formatTherapistDisplayName } from '@/utils/user';

interface TherapistsDirectoryScreenProps {
  onBack: () => void;
  onTherapistPress: (id: string) => void;
}

export function TherapistsDirectoryScreen({ onBack, onTherapistPress }: TherapistsDirectoryScreenProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['therapists', 'list', debouncedSearch],
    queryFn: () =>
      therapistsService.list({
        page: 1,
        limit: 50,
        search: debouncedSearch || undefined,
      }),
  });

  const therapists = data?.therapists ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Therapist Directory</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Icon name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or specialty..."
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#19b3e6" />
          }
        >
          {therapists.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No therapists found</Text>
              <Text style={styles.emptySubtext}>
                {debouncedSearch ? 'Try a different search term' : 'Check back later'}
              </Text>
            </View>
          ) : (
            therapists.map((t) => (
              <TherapistCard
                key={t.id}
                name={formatTherapistDisplayName(t.fullName) || `Therapist #${t.id}`}
                title={t.professionalTitle ?? ''}
                specialties={t.specialties ?? []}
                avatarUri={t.profilePhotoUrl ?? undefined}
                price={t.rateCents != null ? t.rateCents / 100 : undefined}
                onPress={() => onTherapistPress(String(t.id))}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 41, 55, 0.5)',
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a2c32',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 17,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
