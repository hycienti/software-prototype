import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { ProfileScreen } from '@/screens/ProfileScreen';

export default function ProfilePage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  const handleBack = () => {
    handleClose();
  };

  const handleMenu = () => {
    // TODO: Open menu
    console.log('Menu pressed');
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile
    console.log('Edit profile');
  };

  const handleViewAllAchievements = () => {
    // TODO: Navigate to all achievements
    console.log('View all achievements');
  };

  const handleAccountPrivacy = () => {
    // TODO: Navigate to account privacy
    console.log('Account privacy');
  };

  const handlePaymentHistory = () => {
    router.push('/payment-history');
  };

  const handleConnectedApps = () => {
    // TODO: Navigate to connected apps
    console.log('Connected apps');
  };

  const handleLogOut = () => {
    // TODO: Implement logout
    console.log('Log out');
    router.replace('/(auth)/welcome');
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <ProfileScreen
        onBack={handleBack}
        onMenu={handleMenu}
        onEditProfile={handleEditProfile}
        onViewAllAchievements={handleViewAllAchievements}
        onAccountPrivacy={handleAccountPrivacy}
        onConnectedApps={handleConnectedApps}
        onPaymentHistory={handlePaymentHistory}
        onLogOut={handleLogOut}
      />
    </BottomSheetModal>
  );
}
