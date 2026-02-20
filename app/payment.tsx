import React, { useState } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { View, StyleSheet, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { TherapistProfileScreen } from '@/screens/TherapistProfileScreen';
import { paymentsService } from '@/services/payments';

const CONSULTATION_AMOUNT_CENTS = 15000; // $150

export default function PaymentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { therapistId, scheduledAt, durationMinutes } = useLocalSearchParams<{
    therapistId?: string;
    scheduledAt?: string;
    durationMinutes?: string;
  }>();
  const [modalVisible, setModalVisible] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(true);
    }, [])
  );

  const handleBack = () => {
    setModalVisible(false);
    router.back();
  };

  const handleConfirmPayment = async () => {
    const tid = therapistId ? Number(therapistId) : 0;
    const at = scheduledAt?.trim();
    const dur = durationMinutes ? Number(durationMinutes) : 50;
    if (!tid || !at) {
      Alert.alert('Missing details', 'Please select a date and time from the booking screen.');
      return;
    }
    setIsProcessing(true);
    try {
      await paymentsService.create({
        therapistId: tid,
        amountCents: CONSULTATION_AMOUNT_CENTS,
        scheduledAt: at,
        durationMinutes: dur,
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setModalVisible(false);
      router.replace('/my-therapists');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
              ?.message
          : null;
      Alert.alert(
        'Booking failed',
        message ?? "The requested time may not be available. Please choose another slot."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    router.back();
  };

  const handleBookConsultation = () => {};

  const handleMessage = () => {
    if (therapistId)
      router.push({ pathname: '/therapist/[id]/message', params: { id: therapistId } });
  };

  return (
    <View style={styles.container}>
      <TherapistProfileScreen
        therapistId={therapistId}
        onBack={handleBack}
        onBookConsultation={handleBookConsultation}
        onMessage={handleMessage}
      />
      <BottomSheetModal
        visible={modalVisible}
        onClose={handleClose}
        showBackdrop={true}
      >
        <PaymentScreen
          therapistId={therapistId}
          scheduledAt={scheduledAt}
          onBack={handleBack}
          onConfirmPayment={handleConfirmPayment}
          visible={modalVisible}
          onClose={handleClose}
          isProcessing={isProcessing}
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
