import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EmailInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export const EmailInputModal: React.FC<EmailInputModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
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
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>
              Enter your email address to receive a verification code
            </Text>
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
            <Button
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              disabled={isLoading || !email.trim()}
              style={styles.button}
            >
              {isLoading ? 'Sending...' : 'Continue'}
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
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
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
  button: {
    width: '100%',
  },
});
