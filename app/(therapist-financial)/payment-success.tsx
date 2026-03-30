import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams<{ amount?: string; type?: string }>();
  const amount = params.amount ?? "";
  const isPaymentMethodLinked = params.type === "link";
  const insets = useSafeAreaInsets();

  const title = isPaymentMethodLinked
    ? "Payment Method Linked"
    : "Withdrawal initiated";
  const subtitle = isPaymentMethodLinked
    ? "Your bank account has been successfully verified. You can now withdraw your earnings anytime."
    : amount
      ? `$${amount} will be sent to your linked account. Funds usually arrive within 1-3 business days.`
      : "Your withdrawal request has been received. Funds usually arrive within 1-3 business days.";

  const handleReturn = () => {
    // Navigate back to therapist tabs/wallet
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: BG, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-1 px-6" style={{ paddingTop: 24 }}>
        {/* Top bar: Close button */}
        <View className="flex-row items-center justify-end w-full pb-4">
          <Pressable
            onPress={handleReturn}
            className="h-12 w-12 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <MaterialIcons name="close" size={24} color="white" />
          </Pressable>
        </View>

        {/* Center content */}
        <View className="flex-1 flex-col items-center justify-center -mt-16 max-w-lg w-full mx-auto">
          {/* Success icon */}
          <View className="relative mb-8 items-center justify-center">
            <View className="absolute w-32 h-32 rounded-full" style={{ backgroundColor: "rgba(25,179,230,0.3)", opacity: 0.8 }} />
            <MaterialIcons
              name="check-circle"
              size={96}
              color={PRIMARY}
              style={{ zIndex: 10 }}
            />
          </View>

          <View className="w-full items-center mb-10 px-2">
            <Text className="text-white tracking-tight pb-4 text-center text-3xl font-extrabold leading-tight">
              {title}
            </Text>
            <Text className="font-medium leading-relaxed max-w-xs text-center text-base" style={{ color: TEXT_SECONDARY }}>
              {subtitle}
            </Text>
          </View>

          {/* Frosted card */}
          <View
            className="w-full flex-row items-center justify-between gap-4 rounded-2xl p-4"
            style={{ backgroundColor: "rgba(30,41,46,0.6)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View
                className="h-12 w-12 rounded-full p-2 items-center justify-center overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
              >
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoBS5yP16C1d-XF3yPz7Qc1E3HZuhjxxFRuIGuPsm9i04Gq-XBKOl9kS-Vko7oe49lUvHUuSX9-znxNhpd4bazCcgDtGZuNrABy_el_1wVKHU25G0tUIkkmolfOqpiE1R_zm1FDuys8HH1-KeJpNWrzvvAfByNKZGUn0XzoLXHZlPvqyYdoK9vIb4Yij-QL2Tzs49Z5ND6XNpEhqcazF3v88KAZigSCc3yROakcLPbIY9dSnO-vrVpIXCtdFnhhIASB37ffc551f4",
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text className="text-white font-bold leading-tight text-sm">
                  Chase Bank
                </Text>
                <Text className="text-sm font-medium" style={{ color: TEXT_SECONDARY }}>
                  Checking {"\u2022\u2022\u2022\u2022"} 8842
                </Text>
              </View>
            </View>
            <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(25,179,230,0.15)" }}>
              <MaterialIcons name="verified-user" size={20} color={PRIMARY} />
            </View>
          </View>
        </View>

        {/* Bottom button */}
        <View className="w-full max-w-lg mx-auto pt-6 pb-2">
          <Pressable
            onPress={handleReturn}
            className="w-full h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: PRIMARY }}
          >
            <Text className="text-white font-bold text-base">Return to Wallet</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
