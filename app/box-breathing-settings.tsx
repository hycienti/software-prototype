import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { BoxBreathingSettingsScreen } from '@/screens/BoxBreathingSettingsScreen';

export default function BoxBreathingSettingsPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  const handleBack = () => {
    handleClose();
  };

  const handleDone = () => {
    // TODO: Save settings
    console.log('Settings saved');
    handleClose();
  };

  const handleReset = () => {
    // TODO: Reset to defaults
    console.log('Reset to defaults');
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <BoxBreathingSettingsScreen
        onBack={handleBack}
        onDone={handleDone}
        onReset={handleReset}
      />
    </BottomSheetModal>
  );
}
