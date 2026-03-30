import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const WELCOME_IMAGE =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop";

export default function TherapistWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#111d21" }}>
      <ImageBackground
        source={{ uri: WELCOME_IMAGE }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(17,29,33,0.3)",
            "rgba(17,29,33,0.6)",
            "rgba(17,29,33,0.95)",
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView
          style={{ flex: 1, maxWidth: 480, width: "100%", alignSelf: "center", paddingHorizontal: 24, justifyContent: "space-between", paddingBottom: 48 }}
        >
          {/* Hero */}
          <View style={{ paddingTop: 48, alignItems: "center", width: "100%" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: "rgba(25,179,230,0.2)",
                borderWidth: 1,
                borderColor: "rgba(25,179,230,0.4)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <MaterialIcons name="spa" size={36} color="#19b3e6" />
            </View>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 30,
                fontWeight: "700",
                letterSpacing: -0.5,
                textAlign: "center",
              }}
            >
              Haven
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontWeight: "500",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginTop: 8,
                textAlign: "center",
                fontSize: 12,
              }}
            >
              For Therapists
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                marginTop: 16,
                maxWidth: 280,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Your practice, simplified. Manage clients, sessions, and growth in
              one place.
            </Text>
          </View>

          {/* CTA card */}
          <View
            style={{
              borderRadius: 32,
              overflow: "hidden",
              marginBottom: 8,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={[
                "rgba(17,29,33,0.85)",
                "rgba(17,29,33,0.9)",
              ]}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ padding: 24 }}>
              <Text
                style={{
                  color: "#ffffff",
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 4,
                  fontSize: 16,
                }}
              >
                Get started in minutes
              </Text>
              <Text
                style={{
                  color: "rgba(148,163,184,0.8)",
                  textAlign: "center",
                  marginBottom: 24,
                  fontSize: 14,
                }}
              >
                Sign in or create an account to continue
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/therapist-auth-modal")}
                activeOpacity={0.9}
                style={{
                  height: 52,
                  backgroundColor: "#19b3e6",
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Let's get started
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  paddingTop: 16,
                  marginTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "rgba(148,163,184,0.7)",
                    lineHeight: 20,
                    fontSize: 12,
                  }}
                >
                  By continuing, you agree to our{" "}
                  <Text style={{ textDecorationLine: "underline" }}>Terms</Text>{" "}
                  and{" "}
                  <Text style={{ textDecorationLine: "underline" }}>
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
