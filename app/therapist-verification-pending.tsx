import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Linking,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";

export default function TherapistVerificationPendingScreen() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const glowScale = pulse.interpolate({
    inputRange: [1, 1.15],
    outputRange: [1, 1.15],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#111d21" }}>
      <LinearGradient
        colors={["#111d21", "#0f1a1e", "#111d21"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={{
          flex: 1,
          maxWidth: 480,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <View
          style={{
            marginBottom: 40,
            alignItems: "center",
            opacity: 0.9,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <MaterialIcons name="spa" size={48} color="#19b3e6" />
          </View>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 20,
              fontWeight: "700",
              letterSpacing: -0.3,
            }}
          >
            Haven
          </Text>
        </View>

        {/* Main card */}
        <View
          style={{
            width: "100%",
            borderRadius: 48,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.04)",
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 25 },
                shadowOpacity: 0.4,
                shadowRadius: 50,
              },
              android: { elevation: 24 },
            }),
          }}
        >
          <View
            style={{
              paddingHorizontal: 32,
              paddingVertical: 48,
              alignItems: "center",
              gap: 32,
            }}
          >
            {/* Animated hourglass */}
            <View
              style={{
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
                width: 120,
                height: 120,
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#19b3e6",
                  opacity: 0.2,
                  transform: [{ scale: glowScale }],
                }}
              />
              <Animated.View style={{ zIndex: 10, transform: [{ scale: glowScale }] }}>
                <MaterialIcons name="hourglass-top" size={80} color="#19b3e6" />
              </Animated.View>
            </View>

            {/* Text */}
            <View style={{ alignItems: "center", gap: 12, paddingHorizontal: 8 }}>
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: "700",
                  lineHeight: 28,
                  letterSpacing: -0.3,
                  textAlign: "center",
                }}
              >
                We're verifying your credentials
              </Text>
              <Text
                style={{
                  color: "rgba(148,163,184,0.8)",
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 24,
                  textAlign: "center",
                }}
              >
                This usually takes 24-48 hours. We'll notify you once your
                practice is ready to open.
              </Text>
            </View>

            {/* CTA button */}
            <Pressable
              onPress={() => router.replace("/(therapist-tabs)/dashboard" as any)}
              style={({ pressed }) => ({
                height: 52,
                backgroundColor: "#19b3e6",
                borderRadius: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Explore Resources
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {/* Support link */}
        <View style={{ marginTop: 32, opacity: 0.7 }}>
          <Text
            style={{
              textAlign: "center",
              color: "rgba(148,163,184,0.7)",
              fontWeight: "500",
              fontSize: 13,
            }}
          >
            Questions?{" "}
            <Text
              style={{
                textDecorationLine: "underline",
                color: "rgba(148,163,184,0.8)",
              }}
              onPress={() => Linking.openURL("https://haven.app/support")}
            >
              Contact Support
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
