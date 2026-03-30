import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Pressable, ScrollView, View, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboardingDocumentsStore } from "@/store/therapist-onboarding";

export default function TherapistVerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    fullName?: string;
    professionalTitle?: string;
  }>();
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false);
  const {
    licenseFile,
    identityFile,
    setLicenseFile,
    setIdentityFile,
  } = useOnboardingDocumentsStore();

  const handlePickDocument = async (
    type: "license" | "identity"
  ) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const fileObj = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType ?? undefined,
        };
        if (type === "license") {
          setLicenseFile(fileObj);
        } else {
          setIdentityFile(fileObj);
        }
      }
    } catch {
      // user cancelled or error
    }
  };

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
        }}
        edges={["left", "right", "top"]}
      >
        {/* Header: back, progress, step */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
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
          <View style={{ flex: 1, marginHorizontal: 24 }}>
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
                  width: "66%",
                  backgroundColor: "#19b3e6",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontWeight: "700",
              width: 40,
              textAlign: "right",
              fontSize: 12,
            }}
          >
            2 of 3
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            color: "#ffffff",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
            fontSize: 22,
          }}
        >
          Professional Verification
        </Text>
        <Text
          style={{
            color: "rgba(148,163,184,0.7)",
            textAlign: "center",
            marginBottom: 32,
            fontSize: 14,
          }}
        >
          Verify your credentials to join our community
        </Text>

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
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "700",
                marginBottom: 4,
                fontSize: 16,
              }}
            >
              Upload documents
            </Text>
            <Text
              style={{
                color: "rgba(148,163,184,0.7)",
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              This helps us maintain a safe community for everyone.
            </Text>

            <View style={{ gap: 16, marginBottom: 24 }}>
              {/* License upload */}
              {licenseFile ? (
                <View
                  style={{
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{ color: "#ffffff", fontWeight: "500", fontSize: 14 }}
                  >
                    Professional License: {licenseFile.name}
                  </Text>
                  <Pressable
                    onPress={() => setLicenseFile(null)}
                    style={{ marginTop: 8 }}
                  >
                    <Text
                      style={{
                        color: "#19b3e6",
                        fontSize: 13,
                        fontWeight: "500",
                      }}
                    >
                      Remove
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <UploadZone
                  icon="badge"
                  title="Professional License"
                  subtitle="Tap to upload"
                  onPress={() => handlePickDocument("license")}
                />
              )}

              {/* Identity upload */}
              {identityFile ? (
                <View
                  style={{
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{ color: "#ffffff", fontWeight: "500", fontSize: 14 }}
                  >
                    Identity Document: {identityFile.name}
                  </Text>
                  <Pressable
                    onPress={() => setIdentityFile(null)}
                    style={{ marginTop: 8 }}
                  >
                    <Text
                      style={{
                        color: "#19b3e6",
                        fontSize: 13,
                        fontWeight: "500",
                      }}
                    >
                      Remove
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <UploadZone
                  icon="account-box"
                  title="Identity Document"
                  subtitle="Passport or national ID"
                  onPress={() => handlePickDocument("identity")}
                />
              )}
            </View>

            {/* Security notice */}
            <View
              style={{
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                backgroundColor: "rgba(25,179,230,0.08)",
                borderWidth: 1,
                borderColor: "rgba(25,179,230,0.15)",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
              >
                <MaterialIcons name="verified-user" size={22} color="#19b3e6" />
                <Text
                  style={{
                    flex: 1,
                    color: "rgba(148,163,184,0.8)",
                    lineHeight: 20,
                    fontSize: 13,
                  }}
                >
                  Documents are stored securely and only used for identity
                  verification. Data is encrypted end-to-end.
                </Text>
              </View>
            </View>

            {/* Confirmation checkbox */}
            <Pressable
              onPress={() => setDocumentsConfirmed(!documentsConfirmed)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  backgroundColor: documentsConfirmed
                    ? "#19b3e6"
                    : "transparent",
                  borderColor: documentsConfirmed
                    ? "#19b3e6"
                    : "rgba(255,255,255,0.2)",
                }}
              >
                {documentsConfirmed && (
                  <MaterialIcons name="check" size={16} color="#ffffff" />
                )}
              </View>
              <Text
                style={{
                  color: "#ffffff",
                  fontWeight: "500",
                  flex: 1,
                  fontSize: 14,
                }}
              >
                I confirm these documents are valid and accurate
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Continue button */}
        <Pressable
          onPress={() => {
            if (!documentsConfirmed) return;
            router.push({
              pathname: "/(therapist-onboarding)/specialties",
              params: {
                email: params.email ?? "",
                fullName: params.fullName ?? "",
                professionalTitle: params.professionalTitle ?? "",
              },
            } as any);
          }}
          disabled={!documentsConfirmed}
          style={({ pressed }) => ({
            height: 52,
            backgroundColor: "#19b3e6",
            borderRadius: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            marginBottom: Math.max(insets.bottom, 24),
            opacity: !documentsConfirmed ? 0.4 : pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
            Continue
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={20}
            color="#ffffff"
          />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

/** Inline upload zone component replacing the source app's UploadZone */
function UploadZone({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "rgba(25,179,230,0.3)",
        backgroundColor: pressed
          ? "rgba(25,179,230,0.08)"
          : "rgba(255,255,255,0.03)",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      })}
    >
      <MaterialIcons name={icon} size={32} color="rgba(25,179,230,0.6)" />
      <Text
        style={{
          color: "#ffffff",
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: "rgba(148,163,184,0.6)",
          fontSize: 12,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}
