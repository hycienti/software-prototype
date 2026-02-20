import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { therapistMessagesService } from '@/services/therapistMessages';
import type { TherapistThreadMessage as ApiMessage } from '@/types/api';

interface DirectMessageTherapistScreenProps {
  therapistId: number;
  therapistName?: string | null;
  onBack: () => void;
}

export function DirectMessageTherapistScreen({
  therapistId,
  therapistName,
  onBack,
}: DirectMessageTherapistScreenProps) {
  const [inputText, setInputText] = useState('');
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['therapist-thread', therapistId],
    queryFn: () => therapistMessagesService.getOrCreateThreadByTherapist(therapistId, { limit: 100 }),
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      therapistMessagesService.sendMessage(data!.thread.id, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-thread', therapistId] });
      setInputText('');
    },
  });

  const messages: ApiMessage[] = data?.messages ?? [];
  const threadId = data?.thread?.id;

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSend = () => {
    const body = inputText.trim();
    if (!body || !threadId || sendMutation.isPending) return;
    sendMutation.mutate(body);
  };

  const displayName = therapistName ?? data?.thread?.therapist?.fullName ?? `Therapist #${therapistId}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="arrow_back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#19b3e6" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Send a message to start the conversation.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isUser = item.senderType === 'user';
              return (
                <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapTherapist]}>
                  <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleTherapist]}>
                    <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextTherapist]}>
                      {item.body}
                    </Text>
                    <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeTherapist]}>
                      {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={5000}
              editable={!sendMutation.isPending}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || sendMutation.isPending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || sendMutation.isPending}
              activeOpacity={0.8}
            >
              {sendMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="send" size={22} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  flex: {
    flex: 1,
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  bubbleWrap: {
    marginBottom: 10,
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapTherapist: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#19b3e6',
    borderBottomRightRadius: 4,
  },
  bubbleTherapist: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
  },
  bubbleTextUser: {
    color: '#ffffff',
  },
  bubbleTextTherapist: {
    color: '#e5e7eb',
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 4,
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.8)',
  },
  bubbleTimeTherapist: {
    color: '#9ca3af',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.5)',
    backgroundColor: '#111d21',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#e5e7eb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#19b3e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
