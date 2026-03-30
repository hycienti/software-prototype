import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTherapistWallet, useTherapistWithdraw } from "@/hooks/useTherapistApi";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.5)";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";
const MIN_CENTS = 100; // $1.00

export default function WithdrawScreen() {
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "crypto">("bank");
  const [amountInput, setAmountInput] = useState("");
  const { data: wallet, loading: walletLoading, error: walletError } = useTherapistWallet();
  const { withdraw, loading: withdrawLoading, error: withdrawError } = useTherapistWithdraw();

  const balanceCents = wallet?.balanceCents ?? 0;
  const balanceFormatted = wallet?.balance ?? "0.00";
  const amountCents = useMemo(() => {
    const parsed = parseFloat(amountInput.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(parsed) || parsed <= 0) return 0;
    return Math.round(parsed * 100);
  }, [amountInput]);
  const feeCents = Math.round(amountCents * 0.015);
  const receivableCents = amountCents - feeCents;
  const isValid = amountCents >= MIN_CENTS && amountCents <= balanceCents;

  const handleWithdraw = async () => {
    if (!isValid) {
      if (amountCents < MIN_CENTS) Alert.alert("Invalid amount", "Minimum withdrawal is $1.00.");
      else if (amountCents > balanceCents) Alert.alert("Insufficient balance", `Available: $${balanceFormatted}`);
      return;
    }
    try {
      await withdraw(amountCents);
      router.replace({
        pathname: "/(therapist-financial)/payment-success" as any,
        params: { amount: (receivableCents / 100).toFixed(2) },
      });
    } catch {
      // Error shown via withdrawError
    }
  };

  if (walletLoading && !wallet) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BG }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-white/50 mt-2 text-sm">Loading balance...</Text>
      </View>
    );
  }

  const errorMessage = walletError ?? withdrawError;

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center" hitSlop={12}>
            <MaterialIcons name="arrow-back-ios" size={22} color="white" />
          </Pressable>
          <Text className="text-white text-lg font-bold flex-1 text-center mr-10">Withdraw Earnings</Text>
        </View>

        {errorMessage ? (
          <View className="mx-6 mt-2 rounded-2xl border px-4 py-3" style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.1)" }}>
            <Text className="text-red-400 text-sm">{errorMessage}</Text>
          </View>
        ) : null}

        <ScrollView
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Available balance */}
          <View className="rounded-3xl overflow-hidden p-6 mb-8 items-center" style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}>
            <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: TEXT_MUTED }}>
              Available Balance
            </Text>
            <Text className="text-4xl font-extrabold tracking-tight text-white">
              ${balanceFormatted}
            </Text>
          </View>

          {/* Withdrawal method */}
          <Text className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: TEXT_MUTED }}>
            Withdrawal Method
          </Text>
          <View className="flex-row gap-3 mb-8">
            <Pressable onPress={() => setSelectedMethod("bank")} className="flex-1">
              <View
                className="rounded-3xl overflow-hidden p-4 min-h-[100px]"
                style={{
                  backgroundColor: CARD_BG,
                  borderWidth: 2,
                  borderColor: selectedMethod === "bank" ? PRIMARY : "transparent",
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <MaterialIcons name="account-balance" size={22} color={PRIMARY} />
                </View>
                <Text className="text-white font-bold text-sm">Bank Account</Text>
                <Text className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>Ends in 4291</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setSelectedMethod("crypto")} className="flex-1">
              <View
                className="rounded-3xl overflow-hidden p-4 min-h-[100px]"
                style={{
                  backgroundColor: CARD_BG,
                  borderWidth: 2,
                  borderColor: selectedMethod === "crypto" ? PRIMARY : "transparent",
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <MaterialIcons name="currency-bitcoin" size={22} color={TEXT_SECONDARY} />
                </View>
                <Text className="text-white font-bold text-sm">Crypto Wallet</Text>
                <Text className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>BTC / ETH</Text>
              </View>
            </Pressable>
          </View>

          {/* Amount */}
          <Text className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: TEXT_MUTED }}>
            Amount to Withdraw
          </Text>
          <View className="rounded-3xl overflow-hidden p-6 mb-6" style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}>
            <View className="relative">
              <Text className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-2xl font-bold">$</Text>
              <TextInput
                className="w-full bg-transparent text-3xl font-bold text-white pl-7 py-2"
                placeholder="0.00"
                placeholderTextColor={TEXT_MUTED}
                keyboardType="decimal-pad"
                value={amountInput}
                onChangeText={setAmountInput}
              />
            </View>
            <Text className="text-xs mt-2" style={{ color: TEXT_MUTED }}>Min. $1.00</Text>
            <View className="mt-6 pt-5 gap-3" style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm" style={{ color: TEXT_SECONDARY }}>Processing Fee (1.5%)</Text>
                <Text className="text-sm text-white font-medium">-${(feeCents / 100).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold text-sm">You receive</Text>
                <Text className="font-bold text-sm" style={{ color: PRIMARY }}>
                  ${(receivableCents / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleWithdraw}
            disabled={!isValid || withdrawLoading}
            className="w-full h-14 rounded-full items-center justify-center flex-row gap-2"
            style={{
              backgroundColor: !isValid || withdrawLoading ? "rgba(25,179,230,0.4)" : PRIMARY,
            }}
          >
            {withdrawLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : null}
            <Text className="text-white font-bold text-base">
              {withdrawLoading ? "Processing..." : "Initiate Withdrawal"}
            </Text>
            {!withdrawLoading && (
              <MaterialIcons name="keyboard-double-arrow-right" size={20} color="white" />
            )}
          </Pressable>

          <Text className="text-center text-xs mt-4 px-2" style={{ color: TEXT_MUTED }}>
            Funds usually arrive within 1-3 business days.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
