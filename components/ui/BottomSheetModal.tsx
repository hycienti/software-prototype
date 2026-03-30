import React, { useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

const SHEET_OUT = Easing.out(Easing.cubic);
const SHEET_IN = Easing.in(Easing.cubic);
const OPEN_MS = 280;
const CLOSE_MS = 240;

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showBackdrop?: boolean;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  children,
  showBackdrop = true,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(MODAL_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: OPEN_MS, easing: SHEET_OUT });
      opacity.value = withTiming(1, { duration: 220, easing: SHEET_OUT });
    } else {
      translateY.value = withTiming(MODAL_HEIGHT, { duration: CLOSE_MS, easing: SHEET_IN });
      opacity.value = withTiming(0, { duration: 180, easing: SHEET_IN });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {showBackdrop && (
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
          </Animated.View>
        )}
        {showBackdrop && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        )}
        <Animated.View
          style={[
            styles.modal,
            modalStyle,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    height: MODAL_HEIGHT,
    backgroundColor: '#111d21',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
});
