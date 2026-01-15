import React, { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { TherapistRecommendationsScreen } from '@/screens/TherapistRecommendationsScreen';
import { ChatScreen } from '@/screens/ChatScreen';

export default function TherapistsPage() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(true);
    }, [])
  );

  const handleTherapistPress = (id: string) => {
    setModalVisible(false);
    router.push(`/therapist/${id}`);
  };

  const handleClose = () => {
    setModalVisible(false);
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleTalkToHuman = () => {
    // Already on therapists page
  };

  const handleVoicePress = () => {
    router.push('/voice');
  };

  return (
    <View style={styles.container}>
      {/* Chat Screen as Background */}
      <ChatScreen
        onBack={handleBack}
        onTalkToHuman={handleTalkToHuman}
        onVoicePress={handleVoicePress}
      />
      
      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={handleClose}
        showBackdrop={true}
      >
        <TherapistRecommendationsScreen
          onTherapistPress={handleTherapistPress}
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
