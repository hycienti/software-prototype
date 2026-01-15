import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-[#1a2c32]',
    elevated: 'bg-white dark:bg-[#1a2c32] shadow-lg',
    outlined: 'bg-white dark:bg-[#1a2c32] border border-gray-200 dark:border-gray-800',
  };

  return (
    <View
      className={cn('rounded-xl p-4', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </View>
  );
};
