import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface PaymentScreenProps {
  therapistId?: string;
  onBack?: () => void;
  onConfirmPayment?: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  therapistId,
  onBack,
  onConfirmPayment,
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState('USDC');

  const cryptoOptions = [
    { id: 'BTC', name: 'Bitcoin', amount: '≈ 0.0054 BTC', icon: 'currency_bitcoin', color: '#F7931A' },
    { id: 'ETH', name: 'Ethereum', amount: '≈ 0.082 ETH', icon: 'token', color: '#627EEA' },
    { id: 'USDC', name: 'USDC', amount: '150.00 USDC', icon: 'attach_money', color: '#2775CA' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 pt-4 pb-2">
        <View className="items-center pb-4">
          <View className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
        </View>
        <View className="flex-row items-center justify-center gap-2 px-4">
          <Icon name="lock" size={20} color="#19b3e6" />
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
            Secure Checkout
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pb-32" showsVerticalScrollIndicator={false}>
        <View className="py-8 items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            Total Amount Due
          </Text>
          <Text className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            $150.00
          </Text>
        </View>

        <Card className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Session Details
            </Text>
            <View className="bg-primary/10 px-2 py-1 rounded-full">
              <Text className="text-primary text-xs font-bold">Consultation</Text>
            </View>
          </View>
          <View className="flex-row items-start gap-4">
            <View className="relative shrink-0">
              <View className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700" />
              <View className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-[#1a2c32]" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white text-base font-semibold">
                Dr. Sarah Johnson
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Icon name="calendar_today" size={16} color="#6b7280" />
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Oct 24, 10:00 - 10:50 AM
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <View className="mb-6">
          <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">
            Pay with Card
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 h-14 rounded-xl bg-black items-center justify-center flex-row gap-2 active:bg-gray-900">
              <Text className="text-white font-semibold text-lg">Apple Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-14 rounded-xl bg-white border border-gray-200 items-center justify-center active:bg-gray-50">
              <Text className="text-gray-900 font-bold text-lg">Google Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Pay with Crypto
            </Text>
            <View className="flex-row items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-[10px] uppercase tracking-wide text-primary font-bold">
                Live Rates
              </Text>
            </View>
          </View>
          <View className="space-y-3">
            {cryptoOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedCrypto(option.id)}
                className={cn(
                  'flex-row items-center justify-between p-4 rounded-xl border',
                  selectedCrypto === option.id
                    ? 'border-primary bg-primary/5'
                    : 'bg-white dark:bg-[#1a2c32] border-gray-200 dark:border-gray-800'
                )}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <Icon name={option.icon} size={24} color={option.color} />
                  </View>
                  <View>
                    <Text className="font-semibold text-gray-900 dark:text-white">
                      {option.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {option.amount}
                    </Text>
                  </View>
                </View>
                <View
                  className={cn(
                    'h-5 w-5 rounded-full border-2 items-center justify-center',
                    selectedCrypto === option.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-400'
                  )}
                >
                  {selectedCrypto === option.id && (
                    <View className="h-2 w-2 rounded-full bg-white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity className="flex-row items-center gap-3 w-full p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 active:bg-gray-50 dark:active:bg-surface-dark/50 mb-6">
          <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
            <Icon name="add" size={20} color="#6b7280" />
          </View>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Add New Payment Method
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-5 bg-background-light/80 dark:bg-background-dark/80 border-t border-gray-200 dark:border-gray-800">
        <TouchableOpacity
          className="w-full bg-primary active:bg-primary/90 h-14 rounded-xl shadow-lg shadow-primary/25 flex-row items-center justify-center gap-2"
          onPress={onConfirmPayment}
        >
          <Text className="text-white font-semibold text-lg">Confirm Payment</Text>
          <Icon name="arrow_forward" size={20} color="#fff" />
        </TouchableOpacity>
        <View className="flex-row items-center justify-center gap-2 mt-4 opacity-60">
          <Icon name="verified_user" size={14} color="#6b7280" />
          <Text className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            AES-256 Encrypted & HIPAA Compliant
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
