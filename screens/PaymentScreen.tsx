import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface PaymentScreenProps {
  therapistId?: string;
  onBack?: () => void;
  onConfirmPayment?: () => void;
  visible?: boolean;
  onClose?: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  therapistId,
  onBack,
  onConfirmPayment,
  visible = true,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCrypto, setSelectedCrypto] = useState('USDC');

  const cryptoOptions = [
    { id: 'BTC', name: 'Bitcoin', amount: '≈ 0.0054 BTC', icon: 'currency_bitcoin', color: '#F7931A' },
    { id: 'ETH', name: 'Ethereum', amount: '≈ 0.082 ETH', icon: 'token', color: '#627EEA' },
    { id: 'USDC', name: 'USDC', amount: '150.00 USDC', icon: 'attach_money', color: '#2775CA' },
  ];

  return (
    <View style={styles.container}>

      {/* Modal Handle & Header */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <View style={styles.secureHeader}>
            <Icon name="lock" size={20} color="#19b3e6" />
            <Text style={styles.secureHeaderText}>Secure Checkout</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Price Display */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Amount Due</Text>
          <Text style={styles.priceAmount}>$150.00</Text>
        </View>

        {/* Session Summary Card */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionCardHeader}>
            <Text style={styles.sessionCardTitle}>Session Details</Text>
            <View style={styles.consultationBadge}>
              <Text style={styles.consultationBadgeText}>Consultation</Text>
            </View>
          </View>
          <View style={styles.sessionCardContent}>
            <View style={styles.therapistAvatarContainer}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrxzv7tHaJTO6aCXjvhX9YI7596wh2WdlHlqQSytW2yKV32v9kL1a1w9uKNrPyPX-Ejmhv68Xd5BEdnJHTuB9_t76RIHdk08IiZ_8y-6m7T8YTBAMXVLyVdSGL7wv_v-jaBTddy7duKomZH4gzEcLxpAlekzBnzv0Vor3wSeVK3lcyDGrPIQS3AVUxfoSZiEsKwgNIqvvqtWC7UWzo0Il7dCGIq6fqKY0Yx3e023mvByd2h6RUCniin0FwOHEbkirlMXjHXyvY1Hk',
                }}
                style={styles.therapistAvatar}
                resizeMode="cover"
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.therapistInfo}>
              <Text style={styles.therapistName}>Dr. Sarah Johnson</Text>
              <View style={styles.sessionTime}>
                <Icon name="calendar_today" size={16} color="#9ca3af" />
                <Text style={styles.sessionTimeText}>Oct 24, 10:00 - 10:50 AM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method: Fiat */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentSectionTitle}>Pay with Card</Text>
          <View style={styles.cardPaymentContainer}>
            <TouchableOpacity style={styles.applePayButton} activeOpacity={0.8}>
              <Icon name="ios" size={24} color="#ffffff" />
              <Text style={styles.applePayText}>Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.googlePayButton} activeOpacity={0.8}>
              <Text style={styles.googlePayText}>
                <Text style={styles.googlePayG}>G</Text>
                <Text style={styles.googlePayO1}>o</Text>
                <Text style={styles.googlePayO2}>o</Text>
                <Text style={styles.googlePayG2}>g</Text>
                <Text style={styles.googlePayL}>l</Text>
                <Text style={styles.googlePayE}>e</Text>
                {' '}Pay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method: Crypto */}
        <View style={styles.paymentSection}>
          <View style={styles.cryptoHeader}>
            <Text style={styles.paymentSectionTitle}>Pay with Crypto</Text>
            <View style={styles.liveRatesBadge}>
              <View style={styles.liveRatesDot} />
              <Text style={styles.liveRatesText}>Live Rates</Text>
            </View>
          </View>
          <View style={styles.cryptoOptions}>
            {cryptoOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedCrypto(option.id)}
                style={[
                  styles.cryptoOption,
                  selectedCrypto === option.id && styles.cryptoOptionSelected,
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.cryptoOptionContent}>
                  <View style={[styles.cryptoIconContainer, { backgroundColor: `${option.color}20` }]}>
                    <Icon name={option.icon} size={24} color={option.color} />
                  </View>
                  <View>
                    <Text style={styles.cryptoName}>{option.name}</Text>
                    <Text style={styles.cryptoAmount}>{option.amount}</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedCrypto === option.id && styles.radioButtonSelected,
                ]}>
                  {selectedCrypto === option.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add New Payment Method */}
        <TouchableOpacity style={styles.addPaymentButton} activeOpacity={0.8}>
          <View style={styles.addPaymentIcon}>
            <Icon name="add" size={20} color="#9ca3af" />
          </View>
          <Text style={styles.addPaymentText}>Add New Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Footer Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.footerContent}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirmPayment}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            <Icon name="arrow_forward" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.securityBadge}>
            <Icon name="verified_user" size={14} color="#9ca3af" />
            <Text style={styles.securityText}>AES-256 Encrypted & HIPAA Compliant</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
    position: 'relative',
  },
  header: {
    position: 'relative',
    zIndex: 10,
    overflow: 'hidden',
  },
  headerContent: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(17, 29, 33, 0.95)',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  dragHandle: {
    height: 6,
    width: 48,
    borderRadius: 3,
    backgroundColor: 'rgba(52, 89, 101, 0.8)',
  },
  secureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  secureHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(156, 163, 175, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 128,
  },
  priceContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(156, 163, 175, 0.8)',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#ffffff',
  },
  sessionCard: {
    marginBottom: 32,
    borderRadius: 25,
    backgroundColor: '#1a2c32',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(156, 163, 175, 0.8)',
  },
  consultationBadge: {
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  consultationBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#19b3e6',
  },
  sessionCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  therapistAvatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  therapistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(25, 179, 230, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#1a2c32',
  },
  therapistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sessionTimeText: {
    fontSize: 14,
    color: 'rgba(156, 163, 175, 0.8)',
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  cardPaymentContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  applePayButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applePayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  googlePayButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googlePayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  googlePayG: { color: '#4285F4' },
  googlePayO1: { color: '#EA4335' },
  googlePayO2: { color: '#FBBC05' },
  googlePayG2: { color: '#4285F4' },
  googlePayL: { color: '#34A853' },
  googlePayE: { color: '#EA4335' },
  cryptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  liveRatesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveRatesDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#19b3e6',
  },
  liveRatesText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#19b3e6',
  },
  cryptoOptions: {
    gap: 12,
  },
  cryptoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 30,
    backgroundColor: '#1a2c32',
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.8)',
  },
  cryptoOptionSelected: {
    borderColor: '#19b3e6',
    backgroundColor: 'rgba(25, 179, 230, 0.05)',
  },
  cryptoOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cryptoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cryptoAmount: {
    fontSize: 12,
    color: 'rgba(156, 163, 175, 0.8)',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(156, 163, 175, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#19b3e6',
    backgroundColor: '#19b3e6',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: 16,
    borderRadius: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(55, 65, 81, 0.8)',
    marginBottom: 24,
  },
  addPaymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPaymentText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(209, 213, 219, 0.8)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.8)',
    backgroundColor: 'rgba(17, 29, 33, 0.8)',
    zIndex: 40,
    overflow: 'hidden',
  },
  footerContent: {
    width: '100%',
  },
  confirmButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#19b3e6',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(156, 163, 175, 0.8)',
  },
});
