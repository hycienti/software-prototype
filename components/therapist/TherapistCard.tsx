import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
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
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card className="mb-4">
        <View className="flex-row gap-4">
          <View className="relative shrink-0">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-16 h-16 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700" />
            )}
            {isOnline && (
              <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-[#1a2c32]" />
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  {name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-[#93bac8] mt-0.5">
                  {title}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-primary font-bold text-sm">${price}</Text>
                <Text className="text-gray-400 dark:text-[#6a8b98] text-[10px]">
                  /hr
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2 my-3">
              {specialties.map((specialty, index) => (
                <View
                  key={index}
                  className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <Text className="text-xs font-medium text-primary">
                    {specialty}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
              <View className="flex-row items-center gap-1.5">
                <Icon name="star" size={18} color="#fbbf24" />
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  {rating}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-[#6a8b98]">
                  ({reviewCount} reviews)
                </Text>
              </View>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-[#243e47] dark:bg-primary active:bg-[#2d4d58] dark:active:bg-primary/90"
              >
                <Text className="text-xs font-medium text-white">Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
