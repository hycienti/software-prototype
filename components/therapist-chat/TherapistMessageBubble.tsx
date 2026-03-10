import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { therapistChatStyles } from '@/screens/therapist-chat/therapistChatStyles';
import type { TherapistThreadMessage } from '@/types/api';

const styles = therapistChatStyles;

export interface TherapistMessageBubbleProps {
  item: TherapistThreadMessage;
  isUser: boolean;
  playingVoiceUrl: string | null;
  onPlayVoice: (url: string) => void;
}

export function TherapistMessageBubble({
  item,
  isUser,
  playingVoiceUrl,
  onPlayVoice,
}: TherapistMessageBubbleProps) {
  const hasVoice = Boolean(item.voiceUrl?.trim());
  const hasAttachments = Array.isArray(item.attachmentUrls) && item.attachmentUrls.length > 0;
  const hasBody = Boolean(item.body?.trim());
  const isPlayingThis = hasVoice && item.voiceUrl === playingVoiceUrl;

  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleTherapist]}>
      {hasBody ? (
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextTherapist]}>
          {item.body}
        </Text>
      ) : null}
      {hasVoice ? (
        <TouchableOpacity
          style={styles.voiceRow}
          onPress={() => item.voiceUrl && onPlayVoice(item.voiceUrl)}
          activeOpacity={0.8}
        >
          <Icon
            name={isPlayingThis ? 'pause' : 'play_arrow'}
            size={20}
            color={isUser ? '#ffffff' : '#19b3e6'}
          />
          <Text style={[styles.voiceLabel, isUser ? styles.bubbleTextUser : styles.bubbleTextTherapist]}>
            {isPlayingThis ? 'Playing…' : 'Voice message'}
          </Text>
        </TouchableOpacity>
      ) : null}
      {hasAttachments
        ? (item.attachmentUrls ?? []).map((url, idx) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)/i.test(url) || /image\//i.test(url);
            return (
              <View key={idx} style={styles.attachmentWrap}>
                {isImage ? (
                  <Image source={{ uri: url }} style={styles.attachmentImage} resizeMode="cover" />
                ) : (
                  <TouchableOpacity onPress={() => Linking.openURL(url)} activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.attachmentLink,
                        isUser ? styles.bubbleTextUser : styles.bubbleTextTherapist,
                      ]}
                    >
                      Attachment
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        : null}
      <Text
        style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeTherapist]}
      >
        {new Date(item.createdAt).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}
