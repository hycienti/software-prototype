import React from 'react';
import { useRouter } from 'expo-router';
import { PaymentHistoryScreen } from '@/screens/PaymentHistoryScreen';

export default function PaymentHistoryPage() {
  const router = useRouter();
  return <PaymentHistoryScreen onBack={() => router.back()} />;
}
