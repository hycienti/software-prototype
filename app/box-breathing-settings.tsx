import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { BoxBreathingSettingsScreen } from '@/screens/BoxBreathingSettingsScreen';
import { BoxBreathingSettingsProvider } from '@/store/BoxBreathingSettingsContext';

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
    handleClose();
  };

  const handleReset = () => {
    // Reset is handled in the settings screen via context
  };

  // Note: This provider will share state with the breathing screen if both are wrapped
  // For now, each route has its own provider instance, but settings are persisted via AsyncStorage
  return (
    <BoxBreathingSettingsProvider>
      <BottomSheetModal visible={visible} onClose={handleClose}>
        <BoxBreathingSettingsScreen
          onBack={handleBack}
          onDone={handleDone}
          onReset={handleReset}
        />
      </BottomSheetModal>
    </BoxBreathingSettingsProvider>
  );
}
