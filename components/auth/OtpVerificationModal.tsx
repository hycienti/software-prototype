import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.codeContainer}>
            <View style={styles.codeInputs}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.codeInput, error && styles.codeInputError]}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isLoading}
                />
              ))}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.footer}>
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
            <Button
              onPress={() => handleVerify()}
              variant="primary"
              size="lg"
              disabled={isLoading || code.join('').length !== 6}
              style={styles.button}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
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
    width: 48,
    height: 56,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  codeInputError: {
    borderColor: '#ef4444',
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
  button: {
    width: '100%',
  },
});
