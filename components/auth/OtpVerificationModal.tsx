import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';

interface OtpVerificationModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  expiresIn?: number; // seconds
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  visible,
  email,
  onClose,
  onVerify,
  onResend,
  isLoading = false,
  expiresIn = 600,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (!visible || timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, timeLeft]);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setCode(['', '', '', '', '', '']);
      setError(null);
      setTimeLeft(expiresIn);
      setCanResend(false);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [visible, expiresIn]);

  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only numbers

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only last character
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every((digit) => digit !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const otp = otpCode || code.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    try {
      await onVerify(otp);
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimeLeft(expiresIn);
    setError(null);
    try {
      await onResend();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
      setCanResend(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} showBackdrop={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Background gradients matching welcome page */}
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[
              'rgba(17, 29, 33, 0.95)',
              'rgba(17, 29, 33, 0.92)',
              'rgba(15, 23, 42, 0.90)',
              'rgba(15, 23, 42, 0.88)',
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Accent gradient overlay */}
          <LinearGradient
            colors={[
              'rgba(25, 179, 230, 0.08)',
              'rgba(79, 209, 197, 0.05)',
              'transparent',
            ]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.dragHandle} />

          <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(200).delay(40)} style={styles.codeContainer}>
            <View style={styles.codeInputs}>
              {code.map((digit, index) => (
                <Animated.View
                  key={index}
                  entering={FadeIn.duration(160).delay(50 + index * 22)}
                  style={index < 5 && { marginRight: 12 }}
                >
                  <TextInput
                    ref={(ref: TextInput | null) => { inputRefs.current[index] = ref; }}
                    style={[styles.codeInput, error && styles.codeInputError]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isLoading}
                  />
                </Animated.View>
              ))}
            </View>
            {error && (
              <Animated.View entering={FadeIn.duration(180)}>
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View entering={FadeIn.duration(200).delay(80)} style={styles.footer}>
            {timeLeft > 0 && (
              <Text style={styles.timerText}>
                Code expires in {formatTime(timeLeft)}
              </Text>
            )}
            {canResend && (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
            <View style={styles.buttonWrapper}>
              <Button
                onPress={() => handleVerify()}
                variant="primary"
                size="lg"
                disabled={isLoading || code.join('').length !== 6}
                loading={isLoading}
                className="w-full rounded-[50px]"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
    marginBottom: 32,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(148, 163, 184, 0.9)',
    lineHeight: 24,
    textAlign: 'center',
  },
  email: {
    fontWeight: '600',
    color: '#19b3e6',
    textShadowColor: 'rgba(25, 179, 230, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  codeContainer: {
    marginBottom: 24,
  },
  codeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeInput: {
    width: 52,
    height: 64,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  codeInputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 16,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(148, 163, 184, 0.8)',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#19b3e6',
    marginBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
