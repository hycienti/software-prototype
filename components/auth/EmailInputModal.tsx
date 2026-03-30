import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EmailInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  /** Override default "Get Started" / client copy (e.g. therapist sign-in) */
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  loadingLabel?: string;
}

export const EmailInputModal: React.FC<EmailInputModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
  title = 'Get Started',
  subtitle = 'Enter your email address to receive a verification code',
  submitLabel = 'Continue',
  loadingLabel = 'Sending...',
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit(trimmedEmail);
      setEmail(''); // Clear on success
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} showBackdrop={true}>
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

          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(148, 163, 184, 0.6)"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={handleSubmit}
              />
            </View>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={isLoading || !email.trim()}
                loading={isLoading}
                className="w-full rounded-[50px]"
              >
                {isLoading ? loadingLabel : submitLabel}
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
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(148, 163, 184, 0.9)',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  input: {
    fontSize: 16,
    color: '#ffffff',
    padding: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 16,
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
