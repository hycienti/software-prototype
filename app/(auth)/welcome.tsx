import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Asset } from 'expo-asset';
import { AppleIcon } from '@/components/ui/AppleIcon';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WelcomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  
  // Load video asset
  useEffect(() => {
    const loadVideo = async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/onboarding/vidoes/therapy.mp4'));
        await asset.downloadAsync();
        if (asset.localUri) {
          setVideoUri(asset.localUri);
        }
      } catch (error) {
        console.error('Error loading video:', error);
        // Fallback to require if Asset fails
        setVideoUri(require('../../assets/onboarding/vidoes/therapy.mp4') as any);
      }
    };
    loadVideo();
  }, []);

  // Create video player only when URI is available
  const player = useVideoPlayer(
    videoUri || 'https://assets.mixkit.co/videos/preview/mixkit-sun-shining-through-the-trees-1240-large.mp4',
    (player) => {
      if (player) {
        player.loop = true;
        player.muted = true;
        if (videoUri) {
          player.play();
        }
      }
    }
  );

  useEffect(() => {
    // Ensure video plays when player and URI are ready
    if (player && videoUri) {
      const timer = setTimeout(() => {
        try {
          player.play();
        } catch (error) {
          console.error('Error playing video:', error);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [player, videoUri]);

  const handleAppleLogin = () => {
    // TODO: Implement Apple OAuth
    router.replace('/(tabs)');
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      <View style={styles.wrapper}>
        {/* Video Background Layer */}
        <View style={styles.videoContainer}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            fullscreenOptions={
              {
                enable: true,
              }
            }
            allowsPictureInPicture={false}
          />
          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(79, 209, 197, 0.3)', // mint/30
              'rgba(25, 179, 230, 0.2)', // primary/20
              'rgba(15, 23, 42, 0.5)', // slate-900/50
            ]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Dark Overlay */}
          <View style={styles.darkOverlay} />
        </View>

        {/* Top Content - Logo and Title */}
        <View style={styles.topContent}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.logoContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6znBoTu6R2NCalZovWSQI64K1JDtNpGuYSk8r83lcgK2TMKlDHz87juYiBsm-Ne5oovTkBqHYPYvVFKk_RxjEVR7B5W6hO5tJd0pLrxNIWfOIA_-f8XUz7NmQaU6MATSU2bxSw3-7rFp6I4h-WlBA4naNlHeFTkjj3_PLiARf7BCZjUT93ps0yjlO3PoLGtsaYo5ymsp7zupCpx6rMaypiQfBe68AC7L6eyBKwoggTpQMTNIUGPWce283UpQ3xas-5bU3lLtemsY',
              }}
              style={styles.logoImage}
              resizeMode="cover"
            />
            <View style={styles.logoGradient} />
          </Animated.View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Haven</Text>
            <Text style={styles.subtitle}>Your safe space for mental health</Text>
          </View>
        </View>

        {/* Bottom Sheet */}
        <View style={styles.bottomSheet}>
          <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.95)',
              'rgba(255, 255, 255, 0.90)',
              'rgba(249, 250, 251, 0.85)',
            ]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bottomSheetContent}>
            <View style={styles.dragHandle} />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleAppleLogin}
                style={[styles.appleButton, { marginBottom: 16 }]}
                activeOpacity={0.98}>
                <View style={{ marginRight: 12 }}>
                  <AppleIcon size={24} color="#0f172a" />
                </View>
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGoogleLogin}
                style={styles.googleButton}
                activeOpacity={0.98}>
                <View style={{ marginRight: 12 }}>
                  <GoogleIcon size={24} />
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> &{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>

            <View style={[styles.bottomSpacer, { height: Math.max(16, insets.bottom) }]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '70%',
    overflow: 'hidden',
    zIndex: 0,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  topContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '70%',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 48,
  },
  logoContainer: {
    width: 112,
    height: 112,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  logoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 179, 230, 0.2)',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.2,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '35%',
    zIndex: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
    overflow: 'hidden',
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 0,
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(203, 213, 225, 0.8)',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 'auto',
  },
  appleButton: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  appleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#0f172a',
  },
  googleButton: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#243e47',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#ffffff',
  },
  termsText: {
    marginTop: 'auto',
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  linkText: {
    textDecorationLine: 'underline',
    textDecorationColor: '#94a3b8',
    color: '#64748b',
  },
  bottomSpacer: {
    height: 16,
    width: '100%',
  },
});
