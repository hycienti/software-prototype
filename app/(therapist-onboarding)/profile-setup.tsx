import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TherapistProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = (params.email ?? "").trim();
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");

  const canContinue = !!email && !!fullName.trim() && !!professionalTitle.trim();

  return (
    <View style={{ flex: 1, backgroundColor: "#111d21" }}>
      <LinearGradient
        colors={["#111d21", "#0f1a1e", "#111d21"]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            maxWidth: 480,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Step indicator */}
          <View style={{ paddingTop: 14, paddingHorizontal: 32, paddingBottom: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: "rgba(148,163,184,0.6)",
                  fontSize: 11,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Step 1 of 3
              </Text>
              <Text
                style={{
                  color: "rgba(148,163,184,0.6)",
                  fontSize: 11,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Professional Info
              </Text>
            </View>
            <View
              style={{
                height: 6,
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: "33%",
                  backgroundColor: "#19b3e6",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Card */}
              <View
                style={{
                  borderRadius: 32,
                  padding: 32,
                  marginBottom: 24,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                {/* Title section */}
                <View style={{ marginBottom: 32 }}>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 22,
                      fontWeight: "700",
                      marginBottom: 12,
                    }}
                  >
                    Let's set up your practice
                  </Text>
                  <Text
                    style={{
                      color: "rgba(148,163,184,0.8)",
                      fontSize: 15,
                      fontWeight: "500",
                      lineHeight: 24,
                    }}
                  >
                    Please provide your professional identity.
                  </Text>
                </View>

                {/* Form fields */}
                <View style={{ marginBottom: 32 }}>
                  <FormField
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Dr. Sarah Mitchell"
                    style={{ marginBottom: 24 }}
                  />
                  <FormField
                    label="Professional Title"
                    value={professionalTitle}
                    onChangeText={setProfessionalTitle}
                    placeholder="e.g., Psychologist, LCSW"
                  />
                </View>

                {/* Continue button */}
                <Pressable
                  onPress={() => {
                    if (!canContinue) return;
                    router.push({
                      pathname: "/(therapist-onboarding)/verification",
                      params: {
                        email,
                        fullName: fullName.trim(),
                        professionalTitle: professionalTitle.trim(),
                      },
                    } as any);
                  }}
                  disabled={!canContinue}
                  style={({ pressed }) => ({
                    height: 52,
                    backgroundColor: "#19b3e6",
                    borderRadius: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                    opacity: !canContinue ? 0.4 : pressed ? 0.9 : 1,
                  })}
                >
                  <Text
                    style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}
                  >
                    Continue
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                </Pressable>
              </View>

              {/* Subtitle */}
              <View style={{ paddingHorizontal: 32 }}>
                <Text
                  style={{
                    color: "rgba(148,163,184,0.6)",
                    fontSize: 14,
                    fontWeight: "500",
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  This information helps us verify your credentials and build
                  trust with your future clients.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  style?: object;
}) {
  return (
    <View style={style}>
      <Text
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(148,163,184,0.4)"
        style={{
          width: "100%",
          height: 48,
          borderRadius: 16,
          paddingHorizontal: 16,
          fontSize: 15,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          color: "#ffffff",
        }}
      />
    </View>
  );
}
