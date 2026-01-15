import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface ChatHeaderProps {
  name: string;
  status?: string;
  avatarUri?: string;
  onBack?: () => void;
  onTalkToHuman?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  status = 'Online',
  avatarUri = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMwb-cetFJqCtYFVevmjKD1ZHWxaXhuAkk6KOFUzdzYtTjXr3jI3oWgDXCZz-dD6K76ElAi6i1uBOPbnXKaFY0UBILhUKY90lwEMYaTZVf_YJrrBl8a77pYn67_CqF9bvgf48hv4K2mUqkNgPRhc9so4R5umLkwvmvP4I4n7i7YG3I9qR7f-dHF9aU_OrjJrayPeORCW3PkheM5OqRF6TkDhVg5_9L1PTaBHTivzsLNXso-kMjujHRT42AfbMy5A9uoiy8U1gbJpE',
  onBack,
  onTalkToHuman,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow_back" size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
            resizeMode="cover"
          />
          {status === 'Online' && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onTalkToHuman}
        style={styles.humanButton}
        activeOpacity={0.8}
      >
        <Icon name="support_agent" size={18} color="#e11d48" />
        <Text style={styles.humanButtonText}>Human</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111d21',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 41, 55, 0.8)',
    position: 'relative',
    zIndex: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 9999,
  },
  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#111d21',
  },
  nameContainer: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: '#ffffff',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    color: '#19b3e6',
  },
  humanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(225, 29, 72, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  humanButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f43f5e',
  },
});
