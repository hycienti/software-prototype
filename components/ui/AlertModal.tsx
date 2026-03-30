import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useUIStore } from '@/store';
import { Button } from './Button';

const AnimatedView = Animated.createAnimatedComponent(View);

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'warning' | 'success';
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK' }],
  onClose,
}) => {
  const scale = useSharedValue(0.94);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      const ease = Easing.out(Easing.cubic);
      scale.value = withTiming(1, { duration: 200, easing: ease });
      opacity.value = withTiming(1, { duration: 200, easing: ease });
    } else {
      const ease = Easing.in(Easing.cubic);
      scale.value = withTiming(0.94, { duration: 140, easing: ease });
      opacity.value = withTiming(0, { duration: 140, easing: ease });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.6,
  }));

  const getTypeColor = () => {
    switch (type) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      default:
        return '#3b82f6';
    }
  };

  const handleButtonPress = (button: typeof buttons[0]) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
        </Animated.View>

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <AnimatedView style={[styles.modal, modalStyle]}>
          <View style={[styles.header, { borderBottomColor: getTypeColor() }]}>
            <View style={[styles.indicator, { backgroundColor: getTypeColor() }]} />
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.buttons}>
            {buttons.map((button, index) => {
              const isCancel = button.style === 'cancel';
              const isDestructive = button.style === 'destructive';

              return (
                <View key={index} style={styles.buttonContainer}>
                  <Button
                    onPress={() => handleButtonPress(button)}
                    variant={isCancel ? 'outline' : 'primary'}
                    size="md"
                  >
                    {isDestructive ? (
                      <Text style={{ color: '#ef4444' }}>{button.text}</Text>
                    ) : (
                      button.text
                    )}
                  </Button>
                </View>
              );
            })}
          </View>
        </AnimatedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a2529',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
  },
  indicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#b0b8c0',
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    gap: 12,
  },
  buttonContainer: {
    flex: 1,
  },
});

// Global Alert Modal Component (uses Zustand store)
export const GlobalAlertModal: React.FC = () => {
  const { alertModal, hideAlert } = useUIStore();

  return (
    <AlertModal
      visible={alertModal.visible}
      title={alertModal.title}
      message={alertModal.message}
      type={alertModal.type}
      buttons={alertModal.buttons}
      onClose={hideAlert}
    />
  );
};
