import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  Switch,
  Platform,
  Text,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTherapistMe, useUpdateTherapistMe, useTherapistUploadDocument } from "@/hooks/useTherapistApi";
import type { PickedFile } from "@/types/therapist";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";

export default function ProfessionalProfileScreen() {
  const { therapist, loading, error, fetchMe } = useTherapistMe();
  const { updateMe, loading: saving } = useUpdateTherapistMe();
  const { uploadDocument, error: uploadError } = useTherapistUploadDocument();
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");
  const [identityUrl, setIdentityUrl] = useState("");
  const [hourlyRate, setHourlyRate] = useState("180");
  const [acceptingInsurance, setAcceptingInsurance] = useState(true);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingIdentity, setUploadingIdentity] = useState(false);

  useEffect(() => {
    if (therapist) {
      setFullName(therapist.fullName ?? "");
      setProfessionalTitle(therapist.professionalTitle ?? "");
      setLicenseUrl(therapist.licenseUrl ?? "");
      setIdentityUrl(therapist.identityUrl ?? "");
    }
  }, [therapist]);

  const handleLicenseFile = async (result: DocumentPicker.DocumentPickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const file = result.assets[0] as PickedFile;
    setUploadingLicense(true);
    try {
      const res = await uploadDocument({ type: "license", file });
      if (res.licenseUrl) setLicenseUrl(res.licenseUrl);
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleIdentityFile = async (result: DocumentPicker.DocumentPickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const file = result.assets[0] as PickedFile;
    setUploadingIdentity(true);
    try {
      const res = await uploadDocument({ type: "identity", file });
      if (res.identityUrl) setIdentityUrl(res.identityUrl);
    } finally {
      setUploadingIdentity(false);
    }
  };

  const pickAndUploadLicense = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"], copyToCacheDirectory: true });
    await handleLicenseFile(result);
  };

  const pickAndUploadIdentity = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"], copyToCacheDirectory: true });
    await handleIdentityFile(result);
  };

  const handleSave = async () => {
    try {
      await updateMe({
        fullName: fullName.trim() || undefined,
        professionalTitle: professionalTitle.trim() || undefined,
        licenseUrl: licenseUrl.trim() || null,
        identityUrl: identityUrl.trim() || null,
      });
      router.back();
    } catch {}
  };

  if (loading && !therapist) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BG }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-sm mt-2" style={{ color: TEXT_MUTED }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center" hitSlop={12}>
          <MaterialIcons name="arrow-back-ios" size={22} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-bold">Professional Profile</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Text className="font-bold text-sm" style={{ color: PRIMARY }}>{saving ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      {error ? (
        <View className="px-6 py-2">
          <Text className="text-sm" style={{ color: "#f87171" }}>{error}</Text>
          <Pressable onPress={() => fetchMe()} className="mt-2">
            <Text className="text-sm font-semibold" style={{ color: PRIMARY }}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      {uploadError ? (
        <View className="px-6 py-2">
          <Text className="text-sm" style={{ color: "#f87171" }}>{uploadError}</Text>
        </View>
      ) : null}

      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View className="items-center gap-4 py-4">
          <View className="relative">
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDP4LwtcGJz31Fr2K_ethIApAh0hqNVP1xPjOa3w4zXQr1A3noh_P9npsDR-oxoBTuJSH680zNFSEnprGcAE681etIzl8N0LtJb7_4ppC-pdO6_grRyvviSujQNWgoSCg9U6lNPzxAbYFQLhrPzAudZBa2XD9zu-nz0MvTV0XLZOCnxCBxGVwr2Z7gAZwwUjEea5Ssg_qSbgJL9RQh7FP5Ic6oe2fem87uP7e00ytNdksXwkep-yskdFbGVVV_z2S08VBUYbLiC4SY",
              }}
              className="w-32 h-32 rounded-full"
              style={{ borderWidth: 4, borderColor: "rgba(255,255,255,0.1)" }}
            />
            <Pressable
              className="absolute bottom-0 right-0 p-2 rounded-full"
              style={{ backgroundColor: PRIMARY, borderWidth: 2, borderColor: BG }}
            >
              <MaterialIcons name="photo-camera" size={16} color="white" />
            </Pressable>
          </View>
          <Pressable>
            <Text className="text-sm font-semibold" style={{ color: PRIMARY }}>Change Photo</Text>
          </Pressable>
        </View>

        {/* Verification documents */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
        >
          <Text className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_MUTED }}>Verification documents</Text>
          <Text className="text-sm mb-3" style={{ color: TEXT_SECONDARY }}>Stored securely and only visible to you.</Text>
          <View className="gap-4">
            <View>
              <Text className="text-xs font-semibold mb-1" style={{ color: TEXT_SECONDARY }}>Professional license</Text>
              {licenseUrl ? (
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-white flex-1" numberOfLines={1}>Uploaded</Text>
                  <Pressable onPress={pickAndUploadLicense} disabled={uploadingLicense} className="ml-2">
                    {uploadingLicense ? (
                      <ActivityIndicator size="small" color={PRIMARY} />
                    ) : (
                      <Text className="text-sm font-medium" style={{ color: PRIMARY }}>Replace</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={pickAndUploadLicense}
                  className="rounded-xl p-4 items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed" }}
                >
                  <MaterialIcons name="badge" size={24} color={TEXT_MUTED} />
                  <Text className="text-xs font-semibold mt-2" style={{ color: TEXT_SECONDARY }}>Upload license</Text>
                  <Text className="text-xs" style={{ color: TEXT_MUTED }}>PDF or image, max 10MB</Text>
                </Pressable>
              )}
            </View>
            <View>
              <Text className="text-xs font-semibold mb-1" style={{ color: TEXT_SECONDARY }}>Identity document</Text>
              {identityUrl ? (
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-white flex-1" numberOfLines={1}>Uploaded</Text>
                  <Pressable onPress={pickAndUploadIdentity} disabled={uploadingIdentity} className="ml-2">
                    {uploadingIdentity ? (
                      <ActivityIndicator size="small" color={PRIMARY} />
                    ) : (
                      <Text className="text-sm font-medium" style={{ color: PRIMARY }}>Replace</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={pickAndUploadIdentity}
                  className="rounded-xl p-4 items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed" }}
                >
                  <MaterialIcons name="account-box" size={24} color={TEXT_MUTED} />
                  <Text className="text-xs font-semibold mt-2" style={{ color: TEXT_SECONDARY }}>Upload ID</Text>
                  <Text className="text-xs" style={{ color: TEXT_MUTED }}>Passport or national ID</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Professional Bio */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
        >
          <Text className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: TEXT_MUTED }}>Professional Bio</Text>
          <TextInput
            className="w-full bg-transparent p-0 text-base text-white"
            placeholder="Share your therapeutic approach and philosophy..."
            placeholderTextColor={TEXT_MUTED}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Education & Credentials */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
        >
          <Text className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_MUTED }}>Education & Credentials</Text>
          <View className="gap-4">
            <View className="flex-row items-start gap-3">
              <MaterialIcons name="school" size={20} color={PRIMARY} style={{ marginTop: 2 }} />
              <View className="flex-1">
                <TextInput className="w-full bg-transparent p-0 text-sm font-semibold text-white" defaultValue="Ph.D. in Clinical Psychology" />
                <TextInput className="w-full bg-transparent p-0 text-xs" style={{ color: TEXT_MUTED }} defaultValue="Stanford University" />
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <MaterialIcons name="verified-user" size={20} color={PRIMARY} style={{ marginTop: 2 }} />
              <View className="flex-1">
                <TextInput className="w-full bg-transparent p-0 text-sm font-semibold text-white" defaultValue="Licensed Clinical Psychologist" />
                <TextInput className="w-full bg-transparent p-0 text-xs" style={{ color: TEXT_MUTED }} defaultValue="CA State Board #PSY12345" />
              </View>
            </View>
            <Pressable className="flex-row items-center gap-1 mt-1">
              <MaterialIcons name="add-circle" size={18} color={PRIMARY} />
              <Text className="text-sm font-medium" style={{ color: PRIMARY }}>Add Credential</Text>
            </Pressable>
          </View>
        </View>

        {/* Specialties */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
        >
          <Text className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_MUTED }}>Specialties</Text>
          <View className="flex-row flex-wrap gap-2">
            {["Anxiety", "Mindfulness", "Relationships"].map((s) => (
              <View
                key={s}
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
              >
                <Text className="text-sm text-white font-medium">{s}</Text>
              </View>
            ))}
            <Pressable
              className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
              style={{ backgroundColor: "rgba(25,179,230,0.1)", borderWidth: 1, borderColor: "rgba(25,179,230,0.2)" }}
            >
              <MaterialIcons name="add" size={14} color={PRIMARY} />
              <Text className="text-sm font-bold" style={{ color: PRIMARY }}>Edit</Text>
            </Pressable>
          </View>
        </View>

        {/* Hourly Rates */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
        >
          <Text className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_MUTED }}>Hourly Rates</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-white">$</Text>
              <TextInput
                className="w-20 bg-transparent p-0 text-2xl font-bold text-white"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
            </View>
            <Text className="text-sm font-medium" style={{ color: TEXT_MUTED }}>per 50-minute session</Text>
          </View>
          <View className="mt-4 pt-4 flex-row items-center justify-between" style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }}>
            <Text className="text-sm" style={{ color: TEXT_SECONDARY }}>Accepting Insurance</Text>
            <Switch
              value={acceptingInsurance}
              onValueChange={setAcceptingInsurance}
              trackColor={{ false: "rgba(255,255,255,0.1)", true: PRIMARY }}
              thumbColor="white"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View className="absolute bottom-0 left-0 right-0 p-6" style={{ paddingBottom: 32 }}>
        <Pressable
          onPress={() => {}}
          className="w-full h-14 rounded-full flex-row items-center justify-center gap-2"
          style={{ backgroundColor: PRIMARY }}
        >
          <MaterialIcons name="visibility" size={20} color="white" />
          <Text className="text-white font-bold text-base">Preview Public Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
