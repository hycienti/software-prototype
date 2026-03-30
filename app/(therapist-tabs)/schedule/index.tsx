import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTherapistAvailability } from '@/hooks/useTherapistApi';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const DAYS = [
  { label: 'Mon', date: '12' },
  { label: 'Tue', date: '13' },
  { label: 'Wed', date: '14' },
  { label: 'Thu', date: '15' },
  { label: 'Fri', date: '16' },
  { label: 'Sat', date: '17' },
];

type SlotItem = { label?: string; startTime?: string; endTime?: string; days?: number[] };

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, updateAvailability, updateLoading } = useTherapistAvailability();
  const [acceptingClients, setAcceptingClients] = useState(true);
  const [personalLink, setPersonalLink] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTab, setModalTab] = useState<'recurring' | 'specific'>('recurring');
  const [selectedWeekDays, setSelectedWeekDays] = useState([
    true, true, true, true, true, false, false,
  ]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [slotLabel, setSlotLabel] = useState('');

  useEffect(() => {
    if (data) {
      setAcceptingClients(data.acceptingNewClients ?? true);
      setPersonalLink(data.personalMeetingLink ?? '');
    }
  }, [data]);

  const toggleWeekDay = (index: number) => {
    setSelectedWeekDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleAcceptingChange = (value: boolean) => {
    setAcceptingClients(value);
    updateAvailability({ acceptingNewClients: value }).catch(() => {});
  };

  const handleSaveMeetingLink = () => {
    updateAvailability({ personalMeetingLink: personalLink || undefined }).catch(() => {});
  };

  const slots: SlotItem[] = Array.isArray(data?.availabilitySlots)
    ? (data.availabilitySlots as SlotItem[])
    : [];

  const handleSaveSlot = () => {
    const newSlot: SlotItem = {
      label: slotLabel || undefined,
      startTime,
      endTime,
      days: selectedWeekDays.map((v, i) => (v ? i : -1)).filter((d) => d >= 0),
    };
    updateAvailability({ availabilitySlots: [...slots, newSlot] as any })
      .then(() => {
        setModalVisible(false);
        setSlotLabel('');
        setStartTime('09:00');
        setEndTime('12:00');
      })
      .catch(() => {});
  };

  if (loading && !data) {
    return (
      <View className="flex-1 bg-[#111d21] justify-center items-center">
        <ActivityIndicator size="large" color="#19b3e6" />
        <Text className="text-white/40 mt-2">Loading availability...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#111d21]">
      {/* Header */}
      <View
        className="bg-[#0a1a1f] border-b border-white/5"
        style={{ paddingTop: Math.max(insets.top, 48), paddingBottom: 16, paddingHorizontal: 24 }}
      >
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="#7a8a8e" />
          </Pressable>
          <Text className="text-white font-semibold text-base">Manage Availability</Text>
          <View className="w-10" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 0,
            paddingVertical: 8,
          }}
        >
          {DAYS.map((day, index) => {
            const selected = selectedDayIndex === index;
            return (
              <Pressable
                key={day.label}
                onPress={() => setSelectedDayIndex(index)}
                className={`min-w-[50px] py-3 px-3 rounded-2xl border items-center ${
                  selected
                    ? 'bg-[#19b3e6] border-[#19b3e6]'
                    : 'bg-white/5 border-white/8'
                }`}
                style={
                  selected
                    ? {
                        shadowColor: '#19b3e6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 8,
                      }
                    : undefined
                }
              >
                <Text
                  className={`font-bold uppercase text-xs ${
                    selected ? 'text-white/80' : 'text-white/30'
                  }`}
                >
                  {day.label}
                </Text>
                <Text className={`mt-1 font-bold ${selected ? 'text-white' : 'text-white/70'}`}>
                  {day.date}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          gap: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Accepting toggle */}
        <View className="flex-row items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/8">
          <View>
            <Text className="font-bold text-white">Accepting New Clients</Text>
            <Text className="text-white/30 text-xs mt-0.5">Enable to show up in discovery</Text>
          </View>
          <Switch
            value={acceptingClients}
            onValueChange={handleAcceptingChange}
            disabled={updateLoading}
            trackColor={{ false: '#333', true: '#19b3e6' }}
            thumbColor="white"
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        </View>

        {/* Meeting link */}
        <View className="gap-2">
          <Text className="font-bold text-white/30 uppercase tracking-wider ml-1 text-xs">
            Personal Meeting Link
          </Text>
          <View className="relative">
            <MaterialIcons
              name="video-camera-front"
              size={22}
              color="#19b3e6"
              style={{ position: 'absolute', left: 16, top: '50%', marginTop: -11, zIndex: 1 }}
            />
            <TextInput
              className="w-full py-4 pl-12 pr-4 bg-white/5 rounded-2xl text-sm font-medium text-white border border-white/8"
              value={personalLink}
              onChangeText={setPersonalLink}
              onBlur={handleSaveMeetingLink}
              placeholder="e.g. zoom.us/j/your-id"
              placeholderTextColor="#7a8a8e"
            />
          </View>
        </View>

        {/* General Availability */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between px-1 mb-1">
            <Text className="font-bold text-white/30 uppercase tracking-wider ml-1 text-xs">
              General Availability
            </Text>
            <Pressable hitSlop={8}>
              <Text className="font-bold text-[#19b3e6] text-xs">Edit All</Text>
            </Pressable>
          </View>
          <View className="p-5 rounded-2xl border border-white/8 bg-[#19b3e6]/5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="bg-[#19b3e6]/10 p-1.5 rounded-lg">
                  <MaterialIcons name="calendar-today" size={18} color="#19b3e6" />
                </View>
                <Text className="font-bold text-white">Mon - Fri</Text>
              </View>
              <View className="bg-white/5 px-2 py-1 rounded-full">
                <Text className="font-bold text-[#19b3e6] text-xs">DEFAULT</Text>
              </View>
            </View>
            <View className="gap-2 mt-4">
              {slots.length === 0 ? (
                <View className="flex-row items-center justify-between bg-white/5 p-3 rounded-xl">
                  <Text className="font-semibold text-white">No slots yet</Text>
                  <Text className="font-bold text-white/50">Tap + to add</Text>
                </View>
              ) : (
                slots.map((slot, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between bg-white/5 p-3 rounded-xl"
                  >
                    <Text className="font-semibold text-white">{slot.label ?? 'Slot'}</Text>
                    <Text className="font-bold text-white/50">
                      {slot.startTime ?? '--'} - {slot.endTime ?? '--'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        {/* Overrides */}
        <View className="gap-2">
          <Text className="font-bold text-white/30 uppercase tracking-wider ml-1 text-xs">
            Specific Overrides
          </Text>

          <View className="p-5 rounded-2xl border border-white/8 bg-red-500/5 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="bg-red-500/10 p-1.5 rounded-lg">
                  <MaterialIcons name="event-busy" size={18} color="#ef4444" />
                </View>
                <Text className="font-bold text-white">Thursday, Aug 15</Text>
              </View>
              <Pressable hitSlop={8}>
                <MaterialIcons name="close" size={18} color="#ef4444" />
              </Pressable>
            </View>
            <View className="mt-4 p-4 bg-white/5 rounded-xl border border-dashed border-red-500/20 items-center justify-center">
              <Text className="font-medium text-red-400/60 italic text-xs">
                No slots available (Out of Office)
              </Text>
            </View>
          </View>

          <View className="p-5 rounded-2xl border border-white/8 bg-emerald-500/5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="bg-emerald-500/10 p-1.5 rounded-lg">
                  <MaterialIcons name="more-time" size={18} color="#22c55e" />
                </View>
                <Text className="font-bold text-white">Saturday, Aug 17</Text>
              </View>
              <Pressable hitSlop={8}>
                <MaterialIcons name="close" size={18} color="#7a8a8e" />
              </Pressable>
            </View>
            <View className="flex-row items-center justify-between bg-white/5 p-3 rounded-xl mt-3">
              <Text className="font-semibold text-white">Weekend Special</Text>
              <Text className="font-bold text-emerald-400">10:00 AM - 01:00 PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        className="absolute bottom-[100px] right-6 w-16 h-16 rounded-full bg-[#19b3e6] items-center justify-center active:scale-90"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 12,
        }}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </Pressable>

      {/* Add slot modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View
            className="bg-[#0a1a1f] rounded-t-3xl max-h-[90%] border border-white/8"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 24,
            }}
          >
            <View className="w-12 h-1 rounded-full bg-white/20 self-center mt-3 mb-1" />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 32,
                gap: 32,
              }}
            >
              <View className="items-center">
                <Text className="text-white font-bold text-lg">Add Availability Slot</Text>
                <Text className="text-white/40 mt-1 text-sm">Configure your session window</Text>
              </View>

              {/* Tab switcher */}
              <View className="flex-row bg-white/5 rounded-xl p-1">
                <Pressable
                  className={`flex-1 py-2.5 items-center rounded-lg ${
                    modalTab === 'recurring' ? 'bg-white/10' : ''
                  }`}
                  onPress={() => setModalTab('recurring')}
                >
                  <Text
                    className={`font-bold text-sm ${
                      modalTab === 'recurring' ? 'text-[#19b3e6]' : 'text-white/30'
                    }`}
                  >
                    Recurring
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 py-2.5 items-center rounded-lg ${
                    modalTab === 'specific' ? 'bg-white/10' : ''
                  }`}
                  onPress={() => setModalTab('specific')}
                >
                  <Text
                    className={`font-bold text-sm ${
                      modalTab === 'specific' ? 'text-[#19b3e6]' : 'text-white/30'
                    }`}
                  >
                    Specific Day
                  </Text>
                </Pressable>
              </View>

              {modalTab === 'recurring' && (
                <View className="gap-3">
                  <Text className="font-bold text-white/30 uppercase tracking-widest ml-1 text-xs">
                    Repeats On
                  </Text>
                  <View className="flex-row justify-between gap-1">
                    {WEEK_DAYS.map((day, index) => {
                      const active = selectedWeekDays[index];
                      return (
                        <Pressable
                          key={`${day}-${index}`}
                          onPress={() => toggleWeekDay(index)}
                          className={`w-10 h-10 rounded-full items-center justify-center border ${
                            active
                              ? 'bg-[#19b3e6] border-[#19b3e6]'
                              : 'bg-white/5 border-white/8'
                          }`}
                        >
                          <Text
                            className={`font-bold text-sm ${
                              active ? 'text-white' : 'text-white/30'
                            }`}
                          >
                            {day}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Text className="font-bold text-white/30 uppercase tracking-widest ml-1 text-xs">
                    Start Time
                  </Text>
                  <TextInput
                    className="bg-white/5 rounded-2xl py-4 px-4 text-sm font-bold text-white border border-white/8"
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    placeholderTextColor="#555"
                  />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="font-bold text-white/30 uppercase tracking-widest ml-1 text-xs">
                    End Time
                  </Text>
                  <TextInput
                    className="bg-white/5 rounded-2xl py-4 px-4 text-sm font-bold text-white border border-white/8"
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="12:00"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View className="gap-3">
                <Text className="font-bold text-white/30 uppercase tracking-widest ml-1 text-xs">
                  Label (Optional)
                </Text>
                <TextInput
                  className="bg-white/5 rounded-2xl py-4 px-5 text-sm font-medium text-white border border-white/8"
                  value={slotLabel}
                  onChangeText={setSlotLabel}
                  placeholder="e.g. Morning Session"
                  placeholderTextColor="#555"
                />
              </View>

              <View className="gap-2 pt-4">
                <Pressable
                  className="bg-[#19b3e6] py-4 rounded-2xl items-center active:opacity-90"
                  onPress={handleSaveSlot}
                  disabled={updateLoading}
                  style={{
                    shadowColor: '#19b3e6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                    opacity: updateLoading ? 0.5 : 1,
                  }}
                >
                  <Text className="text-white font-bold">
                    {updateLoading ? 'Saving...' : 'Save Slot'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setModalVisible(false)} hitSlop={8} className="py-2">
                  <Text className="text-white/40 font-bold text-center">Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
