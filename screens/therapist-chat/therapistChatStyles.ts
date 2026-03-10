import { StyleSheet } from 'react-native';

export const therapistChatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  flex: {
    flex: 1,
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
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  voiceLabel: {
    fontSize: 14,
  },
  attachmentWrap: {
    marginTop: 6,
  },
  attachmentImage: {
    width: 160,
    height: 120,
    borderRadius: 8,
  },
  attachmentLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
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
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.3)',
  },
  recordingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fca5a5',
  },
  recordingDuration: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f87171',
    fontVariant: ['tabular-nums'],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.5)',
    backgroundColor: '#111d21',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
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
