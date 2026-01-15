import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface TherapistProfileScreenProps {
  therapistId?: string;
  onBack?: () => void;
  onBookConsultation?: () => void;
  onMessage?: () => void;
}

export const TherapistProfileScreen: React.FC<TherapistProfileScreenProps> = ({
  therapistId,
  onBack,
  onBookConsultation,
  onMessage,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Dark Gradient Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.4)',
            'rgba(15, 23, 42, 0.25)',
            'rgba(17, 29, 33, 0.15)',
            'rgba(17, 29, 33, 0.05)',
            'transparent',
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View 
          style={[
            styles.backgroundBlob1,
            { backgroundColor: 'rgba(25, 179, 230, 0.08)' }
          ]} 
        />
        <View 
          style={[
            styles.backgroundBlob2,
            { backgroundColor: 'rgba(88, 28, 135, 0.12)' }
          ]} 
        />
      </View>

      {/* Top App Bar */}
      <View style={styles.header}>
        {/* <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} /> */}
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow_back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Therapist Profile</Text>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Icon name="share" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgbDlx1Qj2YWaZo8UJYytHB3bPuqilDGnRNHE-WSSOS4INf-t9zijKiqMz3mccQ5ycKNL62Q7xURiDMs9T2TATepCnHagEcTCyz16Go4EsfqsvPvwLh_ljhC43AkYBARQKgif8HD4y3q667ENOGUAV3uGH_Ddr3U8YoGres65xBuONf9LUjm483CYOa_gO9XgS-mHumdYuzHLohiGhc0ohHxI_JnulBFyq1Ao0g_Zad34GWKm2OB9C9bKC5Z2L_z-mQk68kFoCI3A',
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.verificationBadge}>
              <Icon name="check" size={16} color="#ffffff" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Dr. Sarah Bennett</Text>
              <View style={styles.phdBadge}>
                <Text style={styles.phdText}>PhD</Text>
              </View>
            </View>
            <Text style={styles.title}>Clinical Psychologist</Text>
            <Text style={styles.specialization}>Specializing in Anxiety & Trauma</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="local_police" size={24} color="#19b3e6" />
            <Text style={styles.statValue}>12 Yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="star" size={24} color="#19b3e6" />
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>120 Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="payments" size={24} color="#19b3e6" />
            <Text style={styles.statValue}>$150</Text>
            <Text style={styles.statLabel}>Per Session</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Dr. Bennett</Text>
          <Text style={styles.aboutText}>
            Dr. Bennett is a compassionate therapist dedicated to helping individuals navigate
            life's challenges. With over a decade of experience, she specializes in cognitive
            behavioral therapy and mindfulness-based approaches to treat anxiety disorders and
            trauma. She believes in creating a safe, non-judgmental space...
          </Text>
          <TouchableOpacity>
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>
        </View>

        {/* Treatment Approaches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treatment Approaches</Text>
          <View style={styles.tagsContainer}>
            {['CBT', 'DBT', 'Trauma-Informed', 'Mindfulness', 'Anxiety'].map((approach) => (
              <View key={approach} style={styles.tag}>
                <Text style={styles.tagText}>{approach}</Text>
              </View>
            ))}
            <View style={styles.moreTag}>
              <Text style={styles.moreTagText}>+3 More</Text>
            </View>
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.educationContainer}>
            <View style={styles.educationItem}>
              <View style={styles.educationIcon}>
                <Icon name="school" size={20} color="#9ca3af" />
              </View>
              <View style={styles.educationContent}>
                <Text style={styles.educationTitle}>PhD in Clinical Psychology</Text>
                <Text style={styles.educationDetails}>Stanford University • 2012</Text>
              </View>
            </View>
            <View style={styles.educationItem}>
              <View style={styles.educationIcon}>
                <Icon name="history_edu" size={20} color="#9ca3af" />
              </View>
              <View style={styles.educationContent}>
                <Text style={styles.educationTitle}>MA in Counseling</Text>
                <Text style={styles.educationDetails}>New York University • 2008</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.section, { marginBottom: 96 }]}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineBadgeText}>Online Available</Text>
            </View>
          </View>
          <View style={styles.mapContainer}>
            <ImageBackground
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAp7QPrDaLpXDgwCUsocnIeDzJHmKSwgPohkqdMtO9-J6KSZeLDoOPar6rrCn668br4_3LGicGjg-FRa6KuptSSE1Dy0UAl5W_LYfHgmLMGbP6K9Wvi5HOp5HHaPwAp2l2gu1CZ4bJ7g30LHdx9xZZnn0TFBKaz1hjO_7sYZ3VrGj0ZIw7KQUlQCrbK4X56CmzLFHnVjnRJ9rErDYrgpcIxKJsr3WpKe599z8Coc7IX0QbmRBN7dbzJi4LZXeIvnjYBlZY6uIpG4U',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            >
              <View style={styles.mapOverlay}>
                <View style={styles.mapPin}>
                  <Icon name="location_on" size={16} color="#19b3e6" />
                  <Text style={styles.mapPinText}>Downtown Office</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
          <View style={styles.visitInfo}>
            <Icon name="videocam" size={16} color="#9ca3af" />
            <Text style={styles.visitText}>Video & In-Person visits</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.actionBarContent}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={onMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={onBookConsultation}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Book Consultation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'relative',
    zIndex: 50,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    // backgroundColor: 'rgba(17, 29, 33, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 41, 55, 0.5)',
  },
  headerButton: {
    padding: 8,
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#1a2c32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#19b3e6',
    padding: 6,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: '#111d21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  phdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.8)',
  },
  phdText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(156, 163, 175, 0.8)',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#19b3e6',
  },
  specialization: {
    fontSize: 14,
    color: 'rgba(156, 163, 175, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#1a2c32',
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(156, 163, 175, 0.8)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#93bac8',
  },
  readMore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#19b3e6',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(25, 179, 230, 0.2)',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#19b3e6',
  },
  moreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  moreTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(156, 163, 175, 0.8)',
  },
  educationContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  educationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  educationContent: {
    flex: 1,
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  educationDetails: {
    fontSize: 14,
    color: '#93bac8',
    marginTop: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  onlineBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  onlineBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  mapContainer: {
    width: '100%',
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    backgroundColor: '#1a2c32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapPinText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  visitText: {
    fontSize: 14,
    color: 'rgba(156, 163, 175, 0.8)',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.8)',
    backgroundColor: 'rgba(17, 29, 33, 0.8)',
    zIndex: 40,
    overflow: 'hidden',
  },
  actionBarContent: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.8)',
    backgroundColor: 'transparent',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  bookButton: {
    flex: 2,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: '#19b3e6',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  backgroundBlob1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.4,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: '20%',
    right: '-5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.4,
  },
});
