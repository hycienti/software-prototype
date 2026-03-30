import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { EmailInputModal } from '@/components/auth/EmailInputModal';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTherapistAuth } from '@/hooks/useTherapistAuth';

export default function TherapistAuthModalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendOtp, verifyOtp, isLoading } = useTherapistAuth();

  const [showEmailModal, setShowEmailModal] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [therapistEmail, setTherapistEmail] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(600);

  const handleHeaderClose = () => {
    if (showOtpModal) {
      setShowOtpModal(false);
      setShowEmailModal(true);
      return;
    }
    router.back();
  };

  const handleEmailModalClose = () => {
    setShowEmailModal(false);
    router.back();
  };

  const handleEmailSubmit = async (submittedEmail: string) => {
    const response = await sendOtp(submittedEmail);
    setTherapistEmail(submittedEmail);
    setOtpExpiresIn(response.expiresIn ?? 600);
    setShowEmailModal(false);
    setShowOtpModal(true);
  };

  const handleOtpModalClose = () => {
    setShowOtpModal(false);
    setShowEmailModal(true);
  };

  const handleOtpVerify = async (code: string) => {
    const result = await verifyOtp(therapistEmail, code);
    if (result.requiresOnboarding) {
      router.dismissAll();
      router.replace({
        pathname: '/(therapist-onboarding)/profile-setup',
        params: { email: therapistEmail },
      } as any);
      return;
    }
    router.dismissAll();
    router.replace('/(therapist-tabs)/dashboard' as any);
  };

  const handleOtpResend = async () => {
    await sendOtp(therapistEmail);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#111d21', '#0f1a1e', '#111d21']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={handleHeaderClose}
          style={styles.closeBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={showOtpModal ? 'Back to email' : 'Close'}
        >
          <MaterialIcons
            name={showOtpModal ? 'arrow-back' : 'close'}
            size={24}
            color="rgba(255,255,255,0.85)"
          />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      <EmailInputModal
        visible={showEmailModal}
        onClose={handleEmailModalClose}
        onSubmit={handleEmailSubmit}
        isLoading={isLoading}
        title="Sign in as therapist"
        subtitle="We'll email you a one-time code to sign in or create your therapist account."
        submitLabel="Continue with email"
        loadingLabel="Sending code..."
      />

      <OtpVerificationModal
        visible={showOtpModal}
        email={therapistEmail}
        onClose={handleOtpModalClose}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        isLoading={isLoading}
        expiresIn={otpExpiresIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
