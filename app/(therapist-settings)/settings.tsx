import React, { useState } from "react";
import {
  View,
  ScrollView,
  Switch,
  TextInput,
  Pressable,
  Modal,
  Platform,
  Text,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";
const MODAL_BG = "rgba(20,30,35,0.95)";
const INPUT_BG = "rgba(255,255,255,0.06)";
const INPUT_BORDER = "rgba(255,255,255,0.1)";

function PaymentMethodCard({
  icon,
  title,
  subtitle,
  actionLabel,
  onPress,
  isPrimary,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel: string;
  onPress: () => void;
  isPrimary?: boolean;
}) {
  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
    >
      <Pressable onPress={onPress} className="flex-row items-center justify-between p-5 active:opacity-90">
        <View className="flex-row items-center gap-4 flex-1">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <MaterialIcons name={icon} size={24} color={PRIMARY} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-sm">{title}</Text>
            <Text className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>{subtitle}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: isPrimary ? "rgba(25,179,230,0.15)" : "rgba(255,255,255,0.06)" }}
          >
            <Text className="font-bold text-xs" style={{ color: isPrimary ? PRIMARY : TEXT_SECONDARY }}>
              {actionLabel}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={TEXT_MUTED} />
        </View>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const [linkBankVisible, setLinkBankVisible] = useState(false);
  const [linkCryptoVisible, setLinkCryptoVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center" hitSlop={12}>
          <MaterialIcons name="arrow-back-ios" size={22} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-bold flex-1 text-center mr-10">Practice Settings</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pb-44"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
      >
        {/* Payment Methods */}
        <View className="gap-3 mb-7">
          <Text className="px-1 text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>
            Payment Methods
          </Text>
          <View className="gap-3">
            <PaymentMethodCard
              icon="account-balance"
              title="Bank Account"
              subtitle="Not linked"
              actionLabel="Link"
              onPress={() => setLinkBankVisible(true)}
              isPrimary
            />
            <PaymentMethodCard
              icon="currency-bitcoin"
              title="Crypto Wallet"
              subtitle="Connected ...4f2e"
              actionLabel="Edit"
              onPress={() => setLinkCryptoVisible(true)}
            />
          </View>
        </View>

        {/* Session Rates */}
        <View className="gap-3 mb-7">
          <Text className="px-1 text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>
            Session Rates
          </Text>
          <View
            className="rounded-3xl p-5 overflow-hidden"
            style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-bold text-white text-sm">Hourly Rate</Text>
              <View
                className="flex-row items-center gap-1 px-4 py-2.5 rounded-full"
                style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}
              >
                <Text className="text-sm font-medium" style={{ color: TEXT_MUTED }}>$</Text>
                <TextInput
                  className="w-14 bg-transparent text-base font-bold text-white text-right"
                  defaultValue="180"
                  keyboardType="numeric"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>
            </View>
            <View className="h-px mb-5" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-white text-sm">Accepting Insurance</Text>
              <Switch
                value={true}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: PRIMARY }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Clinical Specialties */}
        <View className="gap-3 mb-2">
          <Text className="px-1 text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>
            Clinical Specialties
          </Text>
          <View
            className="rounded-3xl p-5 overflow-hidden"
            style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
          >
            <View className="flex-row flex-wrap gap-2 mb-5">
              {["Anxiety", "CBT", "Mindfulness", "Depression", "Trauma"].map((s) => (
                <View
                  key={s}
                  className="px-3.5 py-2 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: INPUT_BORDER }}
                >
                  <Text className="text-xs font-bold text-white">{s}</Text>
                </View>
              ))}
            </View>
            <Pressable
              className="flex-row items-center justify-center gap-2 py-3.5 rounded-full active:opacity-90"
              style={{ backgroundColor: "rgba(25,179,230,0.1)", borderWidth: 1, borderColor: "rgba(25,179,230,0.2)" }}
            >
              <MaterialIcons name="edit" size={20} color={PRIMARY} />
              <Text className="font-bold text-xs" style={{ color: PRIMARY }}>Edit Specialties</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom save button */}
      <View className="absolute bottom-0 left-0 right-0 p-6" style={{ paddingBottom: 32 }}>
        <Pressable
          onPress={() => {}}
          className="w-full h-14 rounded-full flex-row items-center justify-center gap-2"
          style={{ backgroundColor: PRIMARY }}
        >
          <MaterialIcons name="save" size={20} color="white" />
          <Text className="text-white font-bold text-base">Save Changes</Text>
        </Pressable>
      </View>

      {/* Link Bank Account Modal */}
      <Modal visible={linkBankVisible} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setLinkBankVisible(false)}>
          <Pressable className="rounded-t-3xl p-8 pb-12" style={{ backgroundColor: MODAL_BG }} onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1.5 rounded-full self-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
            <View className="flex-row items-start justify-between mb-6">
              <View>
                <Text className="text-2xl font-bold text-white">Link Bank Account</Text>
                <Text className="text-sm mt-1" style={{ color: TEXT_SECONDARY }}>Provide your banking information for payouts.</Text>
              </View>
              <Pressable onPress={() => setLinkBankVisible(false)} className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <MaterialIcons name="close" size={24} color={TEXT_SECONDARY} />
              </Pressable>
            </View>
            <View className="gap-6">
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>Country</Text>
                <View className="h-14 rounded-2xl flex-row items-center px-4 gap-3" style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}>
                  <Text className="text-xl">US</Text>
                  <Text className="text-sm font-semibold text-white flex-1">United States</Text>
                  <MaterialIcons name="expand-more" size={20} color={TEXT_MUTED} />
                </View>
              </View>
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>Account Holder Name</Text>
                <TextInput className="h-14 rounded-2xl px-4 text-sm font-semibold text-white" style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }} placeholder="Johnathan Doe" placeholderTextColor={TEXT_MUTED} />
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Text className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>Routing Number</Text>
                  <TextInput className="h-14 rounded-2xl px-4 text-sm font-semibold text-white" style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }} placeholder="000000000" placeholderTextColor={TEXT_MUTED} keyboardType="number-pad" />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>Account Number</Text>
                  <TextInput className="h-14 rounded-2xl px-4 text-sm font-semibold text-white" style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }} placeholder="--------" secureTextEntry placeholderTextColor={TEXT_MUTED} keyboardType="number-pad" />
                </View>
              </View>
              <Pressable
                onPress={() => setLinkBankVisible(false)}
                className="w-full h-14 rounded-full flex-row items-center justify-center gap-2"
                style={{ backgroundColor: PRIMARY }}
              >
                <Text className="text-white font-bold text-base">Link Account</Text>
                <MaterialIcons name="arrow-forward" size={18} color="white" />
              </Pressable>
              <Text className="text-center text-xs px-4" style={{ color: TEXT_MUTED }}>
                By linking your account, you agree to Haven's Terms of Service and secure payment processing.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Link Crypto Wallet Modal */}
      <Modal visible={linkCryptoVisible} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setLinkCryptoVisible(false)}>
          <Pressable className="rounded-t-3xl p-6 pb-12" style={{ backgroundColor: MODAL_BG }} onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1.5 rounded-full self-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-white">Link Crypto Wallet</Text>
              <Pressable onPress={() => setLinkCryptoVisible(false)} className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <MaterialIcons name="close" size={20} color={TEXT_SECONDARY} />
              </Pressable>
            </View>
            <View className="gap-5">
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: TEXT_MUTED }}>Select Asset</Text>
                <View className="h-14 rounded-2xl flex-row items-center px-4 justify-between" style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}>
                  <Text className="text-sm font-semibold text-white">BTC (Bitcoin)</Text>
                  <MaterialIcons name="expand-more" size={20} color={TEXT_MUTED} />
                </View>
              </View>
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: TEXT_MUTED }}>Select Network</Text>
                <View className="h-14 rounded-2xl flex-row items-center px-4 justify-between" style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}>
                  <Text className="text-sm font-semibold text-white">Ethereum Mainnet</Text>
                  <MaterialIcons name="expand-more" size={20} color={TEXT_MUTED} />
                </View>
              </View>
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: TEXT_MUTED }}>Wallet Address</Text>
                <View className="h-14 rounded-2xl flex-row items-center pl-4 pr-2 gap-2" style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}>
                  <TextInput className="flex-1 text-sm font-medium text-white" placeholder="Enter or paste address" placeholderTextColor={TEXT_MUTED} />
                  <Pressable className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(25,179,230,0.1)", borderWidth: 1, borderColor: "rgba(25,179,230,0.2)" }}>
                    <Text className="text-[10px] font-bold uppercase" style={{ color: PRIMARY }}>Paste</Text>
                  </Pressable>
                  <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <MaterialIcons name="qr-code-scanner" size={18} color={TEXT_SECONDARY} />
                  </View>
                </View>
              </View>
              <Text className="text-xs text-center px-4 leading-relaxed" style={{ color: TEXT_MUTED }}>
                Please double check your wallet address. Sending assets to the wrong address or network may result in permanent loss.
              </Text>
              <Pressable
                onPress={() => setLinkCryptoVisible(false)}
                className="w-full h-14 rounded-full flex-row items-center justify-center gap-2 mt-4"
                style={{ backgroundColor: PRIMARY }}
              >
                <MaterialIcons name="account-balance-wallet" size={20} color="white" />
                <Text className="text-white font-bold text-base">Connect Wallet</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
