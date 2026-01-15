import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface TherapistCardProps {
  name: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  avatarUri?: string;
  isOnline?: boolean;
  onPress?: () => void;
}

export const TherapistCard: React.FC<TherapistCardProps> = ({
  name,
  title,
  price,
  rating,
  reviewCount,
  specialties,
  avatarUri,
  isOnline = false,
  onPress,
}) => {
  const handleCardPress = () => {
    // Card press handler - can be used for card-level actions
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.8} style={styles.card}>
      <View style={styles.cardContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header: Name, Title, Price */}
          <View style={styles.header}>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${price}</Text>
              <Text style={styles.priceUnit}>/hr</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {specialties.map((specialty, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{specialty}</Text>
              </View>
            ))}
          </View>

          {/* Footer: Rating and Button */}
          <View style={styles.footer}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={18} color="#fbbf24" />
              <Text style={styles.rating}>{rating}</Text>
              <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
            </View>
            <TouchableOpacity
              style={styles.learnMoreButton}
              activeOpacity={0.8}
              onPress={(e) => {
                e?.stopPropagation?.();
                onPress?.();
              }}
            >
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a2c32',
    borderRadius: 20,
    padding: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#243e47',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#1a2c32',
  },
  content: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: '#ffffff',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#93bac8',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#19b3e6',
  },
  priceUnit: {
    fontSize: 10,
    color: '#6a8b98',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.2)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#19b3e6',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6a8b98',
  },
  learnMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: '#19b3e6',
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
});
