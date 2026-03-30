import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
  Text,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTherapistAuth } from "@/hooks/useTherapistAuth";
import { useTherapistSpecialties, useTherapistUploadDocument } from "@/hooks/useTherapistApi";
import { useOnboardingDocumentsStore } from "@/store/therapist-onboarding";

export default function TherapistSpecialtiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    fullName?: string;
    professionalTitle?: string;
  }>();
  const { onboard, isLoading: onboardLoading } = useTherapistAuth();
  const { specialties: specialtiesList, loading: listLoading } = useTherapistSpecialties();
  const { uploadDocument } = useTherapistUploadDocument();
  const {
    licenseFile,
    identityFile,
    clear: clearOnboardingDocuments,
  } = useOnboardingDocumentsStore();

  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSpecialty = (specialty: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(specialty)) {
      setSelected(selected.filter((s) => s !== specialty));
    } else {
      setSelected([...selected, specialty]);
    }
  };

  const filteredSpecialties = specialtiesList.filter((s: string) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFinish = async () => {
    const email = (params.email ?? "").trim();
    const fullName = (params.fullName ?? "").trim();
    const professionalTitle = (params.professionalTitle ?? "").trim();
    if (!email || !fullName || !professionalTitle || selected.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFinishing(true);
    setError(null);
    try {
      await onboard({
        email,
        fullName,
        professionalTitle,
        specialties: selected,
      });

      // Upload any documents stored from the verification step (non-blocking)
      if (licenseFile) {
        try {
          await uploadDocument({ type: "license", file: licenseFile as any });
        } catch {
          // Non-blocking; user can upload later
        }
      }
      if (identityFile) {
        try {
          await uploadDocument({ type: "identity", file: identityFile as any });
        } catch {
          // Non-blocking; user can upload later
        }
      }
      clearOnboardingDocuments();
      router.replace("/(therapist-tabs)/dashboard" as any);
    } catch (e: any) {
      setError(e?.message || "Failed to complete onboarding");
    } finally {
      setFinishing(false);
    }
  };

  const loading = onboardLoading || finishing;

  return (
    <View style={{ flex: 1, backgroundColor: "#111d21" }}>
      <LinearGradient
        colors={["#111d21", "#0f1a1e", "#111d21"]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView
        style={{
          flex: 1,
          maxWidth: 480,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 16,
        }}
        edges={["left", "right", "top"]}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingTop: 8,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color="rgba(255,255,255,0.8)"
            />
          </Pressable>
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 2,
              fontSize: 11,
            }}
          >
            Step 3 of 3
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 6,
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "#19b3e6",
              borderRadius: 3,
            }}
          />
        </View>

        {/* Main card */}
        <View
          style={{
            borderRadius: 32,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.04)",
            flex: 1,
            marginBottom: 24,
          }}
        >
          <View style={{ flex: 1, padding: 24 }}>
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "700",
                marginBottom: 4,
                fontSize: 22,
              }}
            >
              What are your specialties?
            </Text>
            <Text
              style={{
                color: "rgba(148,163,184,0.7)",
                marginTop: 4,
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              Select the areas where you have extensive clinical experience.
            </Text>

            {/* Search input */}
            <View style={{ position: "relative", marginBottom: 20 }}>
              <View
                style={{
                  position: "absolute",
                  left: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <MaterialIcons
                  name="search"
                  size={20}
                  color="rgba(148,163,184,0.5)"
                />
              </View>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search specialties..."
                placeholderTextColor="rgba(148,163,184,0.4)"
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 16,
                  paddingLeft: 44,
                  paddingRight: 16,
                  fontSize: 14,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                }}
              />
            </View>

            {/* Specialty chips */}
            {listLoading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 48,
                }}
              >
                <ActivityIndicator size="large" color="#19b3e6" />
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {filteredSpecialties.map((specialty: string) => {
                    const isSelected = selected.includes(specialty);
                    return (
                      <Pressable
                        key={specialty}
                        onPress={() => toggleSpecialty(specialty)}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? "#19b3e6"
                            : "rgba(255,255,255,0.12)",
                          backgroundColor: isSelected
                            ? "rgba(25,179,230,0.15)"
                            : "rgba(255,255,255,0.05)",
                          transform: pressed
                            ? [{ scale: 0.97 }]
                            : [{ scale: 1 }],
                        })}
                      >
                        {isSelected && (
                          <MaterialIcons
                            name="check"
                            size={18}
                            color="#19b3e6"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text
                          numberOfLines={1}
                          style={{
                            fontWeight: isSelected ? "600" : "500",
                            color: isSelected
                              ? "#19b3e6"
                              : "rgba(148,163,184,0.8)",
                            fontSize: 14,
                          }}
                        >
                          {specialty}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* Error */}
            {error ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <MaterialIcons name="error-outline" size={18} color="#ef4444" />
                <Text style={{ color: "#ef4444", flex: 1, fontSize: 14 }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Finish button */}
            <View style={{ paddingTop: 16 }}>
              <Pressable
                onPress={handleFinish}
                disabled={loading || selected.length === 0}
                style={({ pressed }) => ({
                  height: 52,
                  backgroundColor: "#19b3e6",
                  borderRadius: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  opacity:
                    loading || selected.length === 0
                      ? 0.4
                      : pressed
                      ? 0.9
                      : 1,
                })}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      Finish Setup
                    </Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="#ffffff"
                    />
                  </>
                )}
              </Pressable>
              <Text
                style={{
                  textAlign: "center",
                  color: "rgba(148,163,184,0.5)",
                  marginTop: 16,
                  lineHeight: 20,
                  fontSize: 12,
                }}
              >
                You can add or update your specialties anytime in your profile
                settings.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
