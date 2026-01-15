import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cn } from '@/utils/cn';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className,
  containerClassName,
  ...props
}) => {
  return (
    <View className={cn('w-full', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        multiline
        textAlignVertical="top"
        className={cn(
          'w-full rounded-xl border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-[#1a2c32]',
          'px-4 py-3',
          'text-gray-900 dark:text-white',
          'text-base',
          'min-h-[100px]',
          error && 'border-red-500',
          className
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};
