import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '@/utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
}) => {
  const baseStyles = 'rounded-xl items-center justify-center flex-row';
  const sizeStyles = {
    sm: 'h-10 px-4',
    md: 'h-12 px-6',
    lg: 'h-14 px-8',
  };
  const variantStyles = {
    primary: 'bg-[#19b3e6] active:bg-[#19b3e6]/90',
    secondary: 'bg-gray-200 dark:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-700',
    outline: 'border-2 border-[#19b3e6] bg-transparent',
    ghost: 'bg-transparent',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        disabled && 'opacity-50',
        className
      )}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#19b3e6'} />
      ) : (
        <Text
          className={cn(
            'font-semibold',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg',
            variant === 'primary' && 'text-white',
            variant === 'secondary' && 'text-gray-900 dark:text-white',
            variant === 'outline' && 'text-[#19b3e6]',
            variant === 'ghost' && 'text-gray-900 dark:text-white'
          )}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};
