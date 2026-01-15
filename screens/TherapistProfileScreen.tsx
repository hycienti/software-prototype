import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="sticky top-0 z-50 flex-row items-center justify-between p-4 bg-background-light/90 dark:bg-background-dark/90 border-b border-gray-200/50 dark:border-gray-800/50">
        <TouchableOpacity
          onPress={onBack}
          className="p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-800"
        >
          <Icon name="arrow_back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Therapist Profile</Text>
        <TouchableOpacity className="p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-800">
          <Icon name="share" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center px-4 pt-6 pb-2">
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700" />
            <View className="absolute bottom-1 right-1 bg-primary p-1.5 rounded-full border-4 border-background-light dark:border-background-dark">
              <Icon name="check" size={16} color="#fff" />
            </View>
          </View>
          <View className="items-center space-y-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Dr. Sarah Bennett
              </Text>
              <View className="px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-700">
                <Text className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  PhD
                </Text>
              </View>
            </View>
            <Text className="text-primary font-medium">Clinical Psychologist</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Specializing in Anxiety & Trauma
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 px-4 py-6">
          <Card className="flex-1 items-center p-3">
            <Icon name="local_police" size={24} color="#19b3e6" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold mt-1">
              12 Yrs
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Experience</Text>
          </Card>
          <Card className="flex-1 items-center p-3">
            <Icon name="star" size={24} color="#19b3e6" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold mt-1">
              4.9
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">120 Reviews</Text>
          </Card>
          <Card className="flex-1 items-center p-3">
            <Icon name="payments" size={24} color="#19b3e6" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold mt-1">
              $150
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Per Session</Text>
          </Card>
        </View>

        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            About Dr. Bennett
          </Text>
          <Text className="text-gray-600 dark:text-[#93bac8] text-base leading-relaxed">
            Dr. Bennett is a compassionate therapist dedicated to helping individuals navigate
            life's challenges. With over a decade of experience, she specializes in cognitive
            behavioral therapy and mindfulness-based approaches to treat anxiety disorders and
            trauma. She believes in creating a safe, non-judgmental space...
          </Text>
          <TouchableOpacity>
            <Text className="text-primary font-medium text-sm mt-1">Read more</Text>
          </TouchableOpacity>
        </View>

        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Treatment Approaches
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {['CBT', 'DBT', 'Trauma-Informed', 'Mindfulness', 'Anxiety'].map((approach) => (
              <View
                key={approach}
                className="px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20"
              >
                <Text className="text-sm font-medium text-primary">{approach}</Text>
              </View>
            ))}
            <View className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                +3 More
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Education
          </Text>
          <View className="flex-col gap-4">
            <View className="flex-row items-start gap-4">
              <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                <Icon name="school" size={20} color="#6b7280" />
              </View>
              <View>
                <Text className="text-gray-900 dark:text-white font-semibold">
                  PhD in Clinical Psychology
                </Text>
                <Text className="text-sm text-gray-500 dark:text-[#93bac8]">
                  Stanford University • 2012
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-4">
              <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                <Icon name="history_edu" size={20} color="#6b7280" />
              </View>
              <View>
                <Text className="text-gray-900 dark:text-white font-semibold">
                  MA in Counseling
                </Text>
                <Text className="text-sm text-gray-500 dark:text-[#93bac8]">
                  New York University • 2008
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 mb-24">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Location</Text>
            <View className="bg-green-500/10 px-2 py-1 rounded-md">
              <Text className="text-xs font-medium text-green-500">Online Available</Text>
            </View>
          </View>
          <View className="w-full h-32 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
            <View className="absolute inset-0 bg-black/10 items-center justify-center">
              <View className="bg-white dark:bg-[#1a2c32] px-3 py-1.5 rounded-lg shadow-lg flex-row items-center gap-2">
                <Icon name="location_on" size={16} color="#19b3e6" />
                <Text className="text-xs font-bold text-gray-900 dark:text-white">
                  Downtown Office
                </Text>
              </View>
            </View>
          </View>
          <View className="mt-2 flex-row items-center gap-2">
            <Icon name="videocam" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Video & In-Person visits
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-background-light/80 dark:bg-background-dark/80 border-t border-gray-200 dark:border-gray-800">
        <View className="flex-row gap-3">
          <Button variant="outline" className="flex-1" onPress={onMessage}>
            Message
          </Button>
          <Button className="flex-[2]" onPress={onBookConsultation}>
            Book Consultation
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};
