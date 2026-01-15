import React from 'react';
import { View, Image } from 'react-native';
import { cn } from '@/utils/cn';

interface AvatarProps {
  uri?: string;
  size?: number;
  className?: string;
  showOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 40,
  className,
  showOnline = false,
}) => {
  return (
    <View className={cn('relative', className)}>
      <View
        className={cn('rounded-full bg-gray-300 dark:bg-gray-700')}
        style={{ width: size, height: size }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            className="w-full h-full rounded-full"
            resizeMode="cover"
          />
        ) : null}
      </View>
      {showOnline && (
        <View
          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
        />
      )}
    </View>
  );
};
