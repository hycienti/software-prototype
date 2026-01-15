import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { NotificationsScreen } from '@/screens/NotificationsScreen';

export default function NotificationsPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  const handleBack = () => {
    handleClose();
  };

  const handleSettings = () => {
    // TODO: Navigate to notification settings
    console.log('Notification settings');
  };

  const handleNotificationPress = (id: string) => {
    // TODO: Handle notification press
    console.log('Notification pressed:', id);
  };

  const handleClearAll = () => {
    // TODO: Clear all today's notifications
    console.log('Clear all notifications');
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <NotificationsScreen
        onBack={handleBack}
        onSettings={handleSettings}
        onNotificationPress={handleNotificationPress}
        onClearAll={handleClearAll}
      />
    </BottomSheetModal>
  );
}
