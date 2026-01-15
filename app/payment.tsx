import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { TherapistProfileScreen } from '@/screens/TherapistProfileScreen';

export default function PaymentPage() {
  const router = useRouter();
  const { therapistId } = useLocalSearchParams<{ therapistId?: string }>();
  const [modalVisible, setModalVisible] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(true);
    }, [])
  );

  const handleBack = () => {
    setModalVisible(false);
    router.back();
  };

  const handleConfirmPayment = () => {
    // TODO: Process payment
    console.log('Processing payment for therapist:', therapistId);
    // After successful payment, navigate back or to confirmation
    setModalVisible(false);
    router.back();
  };

  const handleClose = () => {
    setModalVisible(false);
    router.back();
  };

  const handleBookConsultation = () => {
    // Already on payment page
  };

  const handleMessage = () => {
    // TODO: Navigate to messaging
    console.log('Message therapist:', therapistId);
  };

  return (
    <View style={styles.container}>
      {/* Therapist Profile as Background */}
      <TherapistProfileScreen
        therapistId={therapistId}
        onBack={handleBack}
        onBookConsultation={handleBookConsultation}
        onMessage={handleMessage}
      />
      
      {/* Payment Modal */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={handleClose}
        showBackdrop={true}
      >
        <PaymentScreen
          therapistId={therapistId}
          onBack={handleBack}
          onConfirmPayment={handleConfirmPayment}
          visible={modalVisible}
          onClose={handleClose}
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
