import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Switch,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Text,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTherapistAvailability } from "@/hooks/useTherapistApi";
import type {
  AvailabilitySlot,
  OneOffAvailabilitySlot,
  RecurringAvailabilitySlot,
} from "@/types/therapist";
import { isOneOffSlot, isRecurringSlot } from "@/types/therapist";

const PRIMARY = "#19b3e6";
const BG = "#111d21";
const CARD_BG = "rgba(30,41,46,0.6)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const TEXT_SECONDARY = "rgba(255,255,255,0.7)";
const INPUT_BG = "rgba(255,255,255,0.06)";
const INPUT_BORDER = "rgba(255,255,255,0.1)";
const MODAL_BG = "rgba(20,30,35,0.95)";
const ERROR_COLOR = "#f87171";
const SUCCESS_COLOR = "#22c55e";

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateSlotId() {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  if (h === 12) return `12:${m.toString().padStart(2, "0")} PM`;
  if (h === 0) return `12:${m.toString().padStart(2, "0")} AM`;
  return h > 12 ? `${h - 12}:${m.toString().padStart(2, "0")} PM` : `${h}:${m.toString().padStart(2, "0")} AM`;
}

function formatDays(days: number[]) {
  if (days.length === 0) return "\u2014";
  const names = [...days].sort((a, b) => a - b).map((d) => DAY_NAMES[d]);
  if (names.length === 7) return "Every day";
  if (names.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return "Mon \u2013 Fri";
  return names.join(", ");
}

function formatDateOnly(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function AvailabilityScreen() {
  const { data, loading, error, updateAvailability, updateLoading } = useTherapistAvailability();
  const [acceptingClients, setAcceptingClients] = useState(true);
  const [meetingLink, setMeetingLink] = useState("");

  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [modalTab, setModalTab] = useState<"recurring" | "specific">("recurring");
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [specificDate, setSpecificDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [slotLabel, setSlotLabel] = useState("");

  useEffect(() => {
    if (data) {
      setAcceptingClients(data.acceptingNewClients ?? true);
      setMeetingLink(data.personalMeetingLink ?? "");
    }
  }, [data]);

  const slots: AvailabilitySlot[] = Array.isArray(data?.availabilitySlots) ? data.availabilitySlots : [];
  const recurringSlots = slots.filter((s): s is RecurringAvailabilitySlot => isRecurringSlot(s));
  const oneOffSlots = slots.filter((s): s is OneOffAvailabilitySlot => isOneOffSlot(s));

  const openAdd = () => {
    setEditingSlot(null);
    setModalTab("recurring");
    setSelectedDays([1, 2, 3, 4, 5]);
    setSpecificDate("");
    setStartTime("09:00");
    setEndTime("12:00");
    setSlotLabel("");
    setSlotModalVisible(true);
  };

  const openEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    if (isOneOffSlot(slot)) {
      setModalTab("specific");
      setSpecificDate(slot.date);
    } else {
      setModalTab("recurring");
      setSelectedDays(slot.days?.length ? [...slot.days] : [1, 2, 3, 4, 5]);
    }
    setStartTime(slot.startTime ?? "09:00");
    setEndTime(slot.endTime ?? "12:00");
    setSlotLabel(slot.label ?? "");
    setSlotModalVisible(true);
  };

  const closeModal = () => {
    setSlotModalVisible(false);
    setEditingSlot(null);
  };

  const saveSlot = () => {
    const id = editingSlot?.id ?? generateSlotId();
    let newSlot: AvailabilitySlot;
    if (modalTab === "specific") {
      const date = specificDate.trim() || new Date().toISOString().slice(0, 10);
      newSlot = { id, type: "one_off", date, startTime, endTime, label: slotLabel || undefined };
    } else {
      newSlot = {
        id,
        type: "recurring",
        days: selectedDays.length ? selectedDays : [1, 2, 3, 4, 5],
        startTime,
        endTime,
        label: slotLabel || undefined,
      };
    }
    const nextSlots = editingSlot
      ? slots.map((s) => (s.id === editingSlot.id ? newSlot : s))
      : [...slots, newSlot];
    updateAvailability({ availabilitySlots: nextSlots }).then(closeModal).catch(() => {});
  };

  const deleteSlot = (slot: AvailabilitySlot) => {
    const nextSlots = slots.filter((s) => s.id !== slot.id);
    updateAvailability({ availabilitySlots: nextSlots }).catch(() => {});
  };

  const handleAcceptingChange = (value: boolean) => {
    setAcceptingClients(value);
    updateAvailability({ acceptingNewClients: value }).catch(() => {});
  };

  const handleMeetingLinkBlur = () => {
    updateAvailability({ personalMeetingLink: meetingLink || undefined }).catch(() => {});
  };

  const toggleDay = (i: number) => {
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort((a, b) => a - b)
    );
  };

  if (loading && !data) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BG }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-sm mt-2" style={{ color: TEXT_MUTED }}>Loading availability...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3" style={{ paddingTop: 56 }}>
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center" hitSlop={12}>
          <MaterialIcons name="arrow-back-ios" size={22} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-bold flex-1 text-center mr-10">Manage Availability</Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View className="p-4 rounded-2xl" style={{ borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.08)" }}>
            <Text className="text-sm" style={{ color: ERROR_COLOR }}>{error}</Text>
          </View>
        ) : null}

        {/* Accepting New Clients */}
        <View
          className="p-5 rounded-2xl"
          style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-bold text-white text-sm">Accepting New Clients</Text>
              <Text className="text-xs" style={{ color: TEXT_MUTED }}>Enable to show up in discovery</Text>
            </View>
            <Switch
              value={acceptingClients}
              onValueChange={handleAcceptingChange}
              trackColor={{ false: "rgba(255,255,255,0.1)", true: PRIMARY }}
              thumbColor="white"
              disabled={updateLoading}
            />
          </View>
        </View>

        {/* Personal Meeting Link */}
        <View className="gap-2">
          <Text className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>
            Personal Meeting Link
          </Text>
          <View className="relative">
            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
              <MaterialIcons name="video-camera-front" size={22} color={PRIMARY} />
            </View>
            <TextInput
              className="w-full rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white"
              style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}
              value={meetingLink}
              onChangeText={setMeetingLink}
              onBlur={handleMeetingLinkBlur}
              placeholder="https://zoom.us/j/..."
              placeholderTextColor={TEXT_MUTED}
            />
          </View>
        </View>

        {/* Recurring slots */}
        <View className="gap-3">
          <Text className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>
            Recurring Availability
          </Text>
          {recurringSlots.length === 0 ? (
            <View className="p-5 rounded-2xl" style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}>
              <Text className="text-sm text-center" style={{ color: TEXT_SECONDARY }}>
                No recurring slots. Tap + to add.
              </Text>
            </View>
          ) : (
            recurringSlots.map((slot) => (
              <View
                key={slot.id ?? slot.startTime + slot.endTime}
                className="p-5 rounded-2xl"
                style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <View className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(25,179,230,0.15)" }}>
                      <MaterialIcons name="repeat" size={18} color={PRIMARY} />
                    </View>
                    <Text className="font-bold text-white text-sm">
                      {slot.label || "Recurring"}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => openEdit(slot)} hitSlop={8} className="p-2">
                      <MaterialIcons name="edit" size={20} color={PRIMARY} />
                    </Pressable>
                    <Pressable onPress={() => deleteSlot(slot)} hitSlop={8} className="p-2">
                      <MaterialIcons name="delete-outline" size={20} color={ERROR_COLOR} />
                    </Pressable>
                  </View>
                </View>
                <Text className="text-xs mb-1" style={{ color: TEXT_MUTED }}>
                  {formatDays(slot.days ?? [])}
                </Text>
                <Text className="text-sm font-medium text-white">
                  {formatTime(slot.startTime)} \u2013 {formatTime(slot.endTime)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* One-off slots */}
        <View className="gap-3">
          <Text className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: TEXT_MUTED }}>
            Specific Dates
          </Text>
          {oneOffSlots.length === 0 ? (
            <View className="p-5 rounded-2xl" style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}>
              <Text className="text-sm text-center" style={{ color: TEXT_SECONDARY }}>
                No one-off slots. Tap + to add a specific date.
              </Text>
            </View>
          ) : (
            oneOffSlots.map((slot) => (
              <View
                key={slot.id ?? slot.date + slot.startTime}
                className="p-5 rounded-2xl"
                style={{ backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <View className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(34,197,94,0.2)" }}>
                      <MaterialIcons name="event" size={18} color={SUCCESS_COLOR} />
                    </View>
                    <Text className="font-bold text-white text-sm">
                      {slot.label || formatDateOnly(slot.date)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => openEdit(slot)} hitSlop={8} className="p-2">
                      <MaterialIcons name="edit" size={20} color={PRIMARY} />
                    </Pressable>
                    <Pressable onPress={() => deleteSlot(slot)} hitSlop={8} className="p-2">
                      <MaterialIcons name="delete-outline" size={20} color={ERROR_COLOR} />
                    </Pressable>
                  </View>
                </View>
                <Text className="text-xs mb-1" style={{ color: TEXT_MUTED }}>
                  {formatDateOnly(slot.date)}
                </Text>
                <Text className="text-sm font-medium text-white">
                  {formatTime(slot.startTime)} \u2013 {formatTime(slot.endTime)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={openAdd}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-2xl items-center justify-center z-50 active:opacity-90"
        style={{ backgroundColor: PRIMARY }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </Pressable>

      {/* Add / Edit Slot Modal */}
      <Modal visible={slotModalVisible} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={closeModal}>
          <Pressable
            className="rounded-t-3xl max-h-[90%] p-6 pt-4 pb-8"
            style={{ backgroundColor: MODAL_BG }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1 rounded-full self-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
            <Text className="text-center text-white font-bold text-xl">
              {editingSlot ? "Edit Slot" : "Add Availability Slot"}
            </Text>
            <Text className="text-sm text-center mt-1 mb-6" style={{ color: TEXT_MUTED }}>
              {modalTab === "recurring" ? "Repeats weekly" : "One specific day"}
            </Text>

            {/* Tab switcher */}
            <View className="flex-row p-1 rounded-xl mb-6" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <Pressable
                onPress={() => setModalTab("recurring")}
                className="flex-1 py-2.5 rounded-lg"
                style={modalTab === "recurring" ? { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: INPUT_BORDER } : undefined}
              >
                <Text className="text-center text-xs font-bold" style={{ color: modalTab === "recurring" ? PRIMARY : TEXT_MUTED }}>
                  Recurring
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setModalTab("specific")}
                className="flex-1 py-2.5 rounded-lg"
                style={modalTab === "specific" ? { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: INPUT_BORDER } : undefined}
              >
                <Text className="text-center text-xs font-bold" style={{ color: modalTab === "specific" ? PRIMARY : TEXT_MUTED }}>
                  Specific Day
                </Text>
              </Pressable>
            </View>

            {modalTab === "recurring" && (
              <>
                <Text className="text-xs uppercase tracking-widest ml-1 mb-2" style={{ color: TEXT_MUTED }}>
                  Repeats on
                </Text>
                <View className="flex-row justify-between gap-1 mb-6">
                  {WEEK_LETTERS.map((letter, i) => {
                    const on = selectedDays.includes(i);
                    return (
                      <Pressable
                        key={i}
                        onPress={() => toggleDay(i)}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: on ? PRIMARY : "rgba(255,255,255,0.04)",
                          borderWidth: 2,
                          borderColor: on ? PRIMARY : "rgba(255,255,255,0.1)",
                        }}
                      >
                        <Text className="text-sm font-bold" style={{ color: on ? "white" : TEXT_MUTED }}>
                          {letter}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {modalTab === "specific" && (
              <View className="mb-6">
                <Text className="text-xs uppercase tracking-widest ml-1 mb-2" style={{ color: TEXT_MUTED }}>
                  Date (YYYY-MM-DD)
                </Text>
                <TextInput
                  className="w-full rounded-2xl py-4 px-4 text-sm font-medium text-white"
                  style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}
                  value={specificDate}
                  onChangeText={setSpecificDate}
                  placeholder="2025-02-20"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>
            )}

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-xs uppercase tracking-widest ml-1 mb-2" style={{ color: TEXT_MUTED }}>Start</Text>
                <TextInput
                  className="w-full rounded-2xl py-4 px-4 text-sm font-medium text-white"
                  style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs uppercase tracking-widest ml-1 mb-2" style={{ color: TEXT_MUTED }}>End</Text>
                <TextInput
                  className="w-full rounded-2xl py-4 px-4 text-sm font-medium text-white"
                  style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="17:00"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>
            </View>
            <View className="mb-6">
              <Text className="text-xs uppercase tracking-widest ml-1 mb-2" style={{ color: TEXT_MUTED }}>Label (optional)</Text>
              <TextInput
                className="w-full rounded-2xl py-4 px-4 text-sm font-medium text-white"
                style={{ backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER }}
                value={slotLabel}
                onChangeText={setSlotLabel}
                placeholder="e.g. Morning Session"
                placeholderTextColor={TEXT_MUTED}
              />
            </View>

            <Pressable
              onPress={saveSlot}
              disabled={updateLoading}
              className="w-full h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: updateLoading ? "rgba(25,179,230,0.4)" : PRIMARY }}
            >
              <Text className="text-white font-bold text-base">{updateLoading ? "Saving..." : "Save Slot"}</Text>
            </Pressable>
            <Pressable onPress={closeModal} className="py-3">
              <Text className="text-center font-medium text-sm" style={{ color: TEXT_MUTED }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
