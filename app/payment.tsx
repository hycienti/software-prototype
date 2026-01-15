import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PaymentScreen } from '@/screens/PaymentScreen';

export default function PaymentPage() {
  const router = useRouter();
  const { therapistId } = useLocalSearchParams<{ therapistId?: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleConfirmPayment = () => {
    // TODO: Process payment
    console.log('Processing payment for therapist:', therapistId);
    // After successful payment, navigate back or to confirmation
    router.back();
  };

  return (
    <PaymentScreen
      therapistId={therapistId}
      onBack={handleBack}
      onConfirmPayment={handleConfirmPayment}
    />
  );
}
