# Haven AI Development System Prompt

## Project Overview

You are working on **Haven**, an AI-powered therapy mobile application built with:
- **Framework:** Expo (React Native)
- **Styling:** NativeWind (Tailwind CSS utility classes for React Native)
- **UI Components:** Gluestack UI (https://gluestack.io/ui/docs/components/all-components)
- **Platform:** iOS, Android, and Web (via Expo)

## Core Project Context

### Product Description
Haven is a mental health application that provides:
1. AI-powered therapy conversations (text and voice)
2. Intelligent interventions (breathing exercises, PMR, journaling, gratitude)
3. Human therapist matching and booking
4. Wellness content recommendations

### Key Features Summary
- **Authentication:** OAuth (Google, Apple)
- **Main Screen:** Single unified interface with chat/voice options and wellness content
- **AI Modes:** Text chat and voice agent with animated blob
- **AI Actions:** Therapist referral, breathing exercises, PMR, journaling, gratitude practice
- **Payment:** Fiat and crypto support for booking therapists

## Technical Stack Requirements

### Frontend Technologies
```json
{
  "framework": "expo",
  "styling": "nativewind (tailwind for RN)",
  "ui_library": "gluestack-ui",
  "state_management": "zustand",
  "data_fetching": "tanstack-query (react-query)",
  "http_client": "axios",
  "forms": "formik",
  "validation": "yup",
  "navigation": "expo-router",
  "authentication": "expo-auth-session (OAuth)",
  "storage": "expo-secure-store (sensitive data), AsyncStorage (general)",
  "audio": "expo-av or react-native-voice",
  "animations": "react-native-reanimated, Lottie"
}
```

### Backend/API Technologies
```json
{
  "api": "REST or GraphQL",
  "ai_integration": "OpenAI API / Anthropic Claude API",
  "speech_to_text": "Whisper API / Google Cloud Speech",
  "text_to_speech": "ElevenLabs API / Azure Cognitive Services",
  "payment": "Stripe API (fiat), Coinbase Commerce (crypto)",
  "database": "Supabase or Firebase (real-time, auth, storage)"
}
```

## Development Guidelines

### 1. Code Architecture

**File Structure:**
```
haven/
├── app/                    # Expo Router pages
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (tabs)/
│   │   ├── index.tsx      # Main screen
│   │   └── _layout.tsx
│   ├── chat.tsx           # Chat interface
│   ├── voice.tsx          # Voice agent
│   ├── breathing.tsx      # Breathing exercises
│   ├── pmr.tsx           # Progressive Muscle Relaxation
│   ├── journal.tsx       # Mood journaling
│   ├── gratitude.tsx     # Gratitude practice
│   └── therapists.tsx    # Therapist list
├── components/
│   ├── ai/
│   │   ├── ChatInterface.tsx
│   │   ├── VoiceBlob.tsx
│   │   └── AIMessage.tsx
│   ├── therapist/
│   │   ├── TherapistCard.tsx
│   │   ├── TherapistModal.tsx
│   │   └── PaymentModal.tsx
│   ├── exercises/
│   │   ├── BreathingCircle.tsx
│   │   ├── PMRGuide.tsx
│   │   └── JournalPrompt.tsx
│   └── ui/
│       └── [shared components]
├── services/
│   ├── ai/
│   │   ├── conversationService.ts
│   │   ├── voiceService.ts
│   │   └── decisionEngine.ts
│   ├── auth/
│   │   └── oauthService.ts
│   ├── payment/
│   │   └── paymentService.ts
│   └── api/
│       ├── apiClient.ts          # Axios instance
│       └── endpoints/
│           ├── auth.api.ts
│           ├── therapist.api.ts
│           └── conversation.api.ts
├── hooks/
│   ├── useAIChat.ts
│   ├── useVoiceAgent.ts
│   ├── useAuth.ts
│   └── useTherapists.ts
├── store/
│   ├── authStore.ts              # Zustand auth store
│   ├── conversationStore.ts      # Zustand conversation store
│   ├── therapistStore.ts         # Zustand therapist store
│   └── appStore.ts               # Zustand global app store
├── lib/
│   ├── queryClient.ts            # TanStack Query setup
│   └── axios.ts                  # Axios configuration
├── utils/
│   ├── encryption.ts
│   ├── storage.ts
│   ├── validators.ts             # Yup schemas
│   └── constants.ts
└── types/
    ├── ai.types.ts
    ├── user.types.ts
    ├── therapist.types.ts
    └── api.types.ts
```

### 2. NativeWind & Gluestack Usage

**Styling Approach:**
```tsx
import { View, Text } from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';

// Use NativeWind classes for layout and basic styling
export function Component() {
  return (
    <View className="flex-1 bg-white px-4 py-6">
      {/* NativeWind for margins, padding, flex */}
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to Haven
      </Text>
      
      {/* Gluestack for interactive components */}
      <Button 
        size="lg" 
        variant="solid" 
        className="mt-6"
      >
        <ButtonText>Start Conversation</ButtonText>
      </Button>
    </View>
  );
}
```

**When to Use What:**
- **NativeWind:** Layout (flex, grid), spacing (margin, padding), colors, typography, responsive design
- **Gluestack:** Buttons, Modals, Inputs, Alerts, Cards, Toasts, complex interactive components

### 3. Axios Configuration

**Setup Axios Instance:**
```typescript
// lib/axios.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.haven.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await SecureStore.deleteItemAsync('authToken');
      // Navigate to login or refresh token
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

**API Endpoint Services:**
```typescript
// services/api/endpoints/auth.api.ts
import apiClient from '@/lib/axios';

export const authAPI = {
  verifyOAuthToken: async (token: string, provider: 'google' | 'apple') => {
    const response = await apiClient.post('/auth/verify', {
      token,
      provider,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

// services/api/endpoints/therapist.api.ts
import apiClient from '@/lib/axios';
import { Therapist, BookingRequest } from '@/types/therapist.types';

export const therapistAPI = {
  getTherapists: async (): Promise<Therapist[]> => {
    const response = await apiClient.get('/therapists');
    return response.data;
  },

  getTherapistById: async (id: string): Promise<Therapist> => {
    const response = await apiClient.get(`/therapists/${id}`);
    return response.data;
  },

  bookConsultation: async (data: BookingRequest) => {
    const response = await apiClient.post('/therapists/book', data);
    return response.data;
  },
};

// services/api/endpoints/conversation.api.ts
import apiClient from '@/lib/axios';

export const conversationAPI = {
  sendMessage: async (message: string, conversationId?: string) => {
    const response = await apiClient.post('/conversation/message', {
      message,
      conversationId,
    });
    return response.data;
  },

  getConversationHistory: async (conversationId: string) => {
    const response = await apiClient.get(`/conversation/${conversationId}`);
    return response.data;
  },

  deleteConversation: async (conversationId: string) => {
    const response = await apiClient.delete(`/conversation/${conversationId}`);
    return response.data;
  },
};
```

### 4. TanStack Query Setup

**Configure Query Client:**
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// app/_layout.tsx - Wrap app with QueryClientProvider
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

**Using TanStack Query in Hooks:**
```typescript
// hooks/useTherapists.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { therapistAPI } from '@/services/api/endpoints/therapist.api';
import { Therapist, BookingRequest } from '@/types/therapist.types';

export function useTherapists() {
  return useQuery<Therapist[]>({
    queryKey: ['therapists'],
    queryFn: therapistAPI.getTherapists,
  });
}

export function useTherapist(id: string) {
  return useQuery<Therapist>({
    queryKey: ['therapist', id],
    queryFn: () => therapistAPI.getTherapistById(id),
    enabled: !!id, // Only run if id exists
  });
}

export function useBookConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingRequest) => therapistAPI.bookConsultation(data),
    onSuccess: () => {
      // Invalidate and refetch therapist queries
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });
}

// hooks/useConversation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationAPI } from '@/services/api/endpoints/conversation.api';
import { useConversationStore } from '@/store/conversationStore';

export function useConversationHistory(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationAPI.getConversationHistory(conversationId),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const addMessage = useConversationStore((state) => state.addMessage);

  return useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) =>
      conversationAPI.sendMessage(message, conversationId),
    onSuccess: (data) => {
      // Update local store
      addMessage(data.message);
      // Invalidate conversation cache
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
}
```

### 5. Zustand State Management

**Create Zustand Stores:**
```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      setToken: (token) => set({ token }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          token: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// store/conversationStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  messages: Message[];
  conversationId: string | null;
  isTyping: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setTyping: (isTyping: boolean) => void;
  clearConversation: () => void;
  setConversationId: (id: string) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  conversationId: null,
  isTyping: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),
  setTyping: (isTyping) => set({ isTyping }),
  clearConversation: () =>
    set({
      messages: [],
      conversationId: null,
    }),
  setConversationId: (id) => set({ conversationId: id }),
}));

// store/therapistStore.ts
import { create } from 'zustand';
import { Therapist } from '@/types/therapist.types';

interface TherapistState {
  selectedTherapist: Therapist | null;
  showTherapistModal: boolean;
  showPaymentModal: boolean;
  setSelectedTherapist: (therapist: Therapist | null) => void;
  openTherapistModal: () => void;
  closeTherapistModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
}

export const useTherapistStore = create<TherapistState>((set) => ({
  selectedTherapist: null,
  showTherapistModal: false,
  showPaymentModal: false,
  setSelectedTherapist: (therapist) => set({ selectedTherapist: therapist }),
  openTherapistModal: () => set({ showTherapistModal: true }),
  closeTherapistModal: () => set({ showTherapistModal: false }),
  openPaymentModal: () => set({ showPaymentModal: true }),
  closePaymentModal: () => set({ showPaymentModal: false }),
}));

// store/appStore.ts
import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  error: string | null;
  currentAction: 'breathing' | 'pmr' | 'journal' | 'gratitude' | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentAction: (action: AppState['currentAction']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  currentAction: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentAction: (action) => set({ currentAction: action }),
}));
```

**Using Zustand in Components:**
```typescript
// Example component using multiple stores
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';

export function ChatScreen() {
  const user = useAuthStore((state) => state.user);
  const messages = useConversationStore((state) => state.messages);
  const addMessage = useConversationStore((state) => state.addMessage);
  const isTyping = useConversationStore((state) => state.isTyping);

  // Component logic
}
```

### 6. Formik & Yup Validation

**Define Yup Schemas:**
```typescript
// utils/validators.ts
import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const bookingSchema = yup.object().shape({
  therapistId: yup.string().required('Please select a therapist'),
  date: yup.date().required('Date is required').min(new Date(), 'Date must be in the future'),
  time: yup.string().required('Time is required'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters'),
});

export const journalEntrySchema = yup.object().shape({
  title: yup.string().max(100, 'Title cannot exceed 100 characters'),
  content: yup
    .string()
    .required('Content is required')
    .min(10, 'Please write at least 10 characters')
    .max(10000, 'Entry cannot exceed 10,000 characters'),
  mood: yup
    .string()
    .oneOf(['happy', 'sad', 'anxious', 'angry', 'calm'], 'Invalid mood')
    .required('Please select a mood'),
  intensity: yup
    .number()
    .min(1, 'Intensity must be between 1-10')
    .max(10, 'Intensity must be between 1-10')
    .required('Please rate intensity'),
});

export const paymentSchema = yup.object().shape({
  cardNumber: yup
    .string()
    .matches(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  expiryDate: yup
    .string()
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)')
    .required('Expiry date is required'),
  cvv: yup
    .string()
    .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits')
    .required('CVV is required'),
  name: yup.string().required('Cardholder name is required'),
});

export const gratitudeSchema = yup.object().shape({
  items: yup
    .array()
    .of(yup.string().min(5, 'Each item should be at least 5 characters'))
    .min(1, 'Please add at least one item')
    .max(5, 'Maximum 5 items allowed'),
  reflection: yup.string().max(500, 'Reflection cannot exceed 500 characters'),
});
```

**Using Formik in Components:**
```typescript
// components/forms/JournalEntryForm.tsx
import { Formik } from 'formik';
import { View } from 'react-native';
import {
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Button,
  ButtonText,
  Textarea,
  TextareaInput,
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
} from '@gluestack-ui/themed';
import { journalEntrySchema } from '@/utils/validators';

interface JournalFormValues {
  title: string;
  content: string;
  mood: string;
  intensity: number;
}

export function JournalEntryForm({ onSubmit }: { onSubmit: (values: JournalFormValues) => void }) {
  return (
    <Formik
      initialValues={{
        title: '',
        content: '',
        mood: '',
        intensity: 5,
      }}
      validationSchema={journalEntrySchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
        <View className="gap-4 p-4">
          {/* Title Input */}
          <FormControl isInvalid={!!(touched.title && errors.title)}>
            <FormControlLabel>
              <FormControlLabelText>Title (Optional)</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                placeholder="Give your entry a title..."
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
              />
            </Input>
            {touched.title && errors.title && (
              <FormControlError>
                <FormControlErrorText>{errors.title}</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Content Textarea */}
          <FormControl isInvalid={!!(touched.content && errors.content)}>
            <FormControlLabel>
              <FormControlLabelText>Journal Entry</FormControlLabelText>
            </FormControlLabel>
            <Textarea>
              <TextareaInput
                placeholder="What's on your mind?"
                value={values.content}
                onChangeText={handleChange('content')}
                onBlur={handleBlur('content')}
                className="min-h-[200px]"
              />
            </Textarea>
            {touched.content && errors.content && (
              <FormControlError>
                <FormControlErrorText>{errors.content}</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Mood Select */}
          <FormControl isInvalid={!!(touched.mood && errors.mood)}>
            <FormControlLabel>
              <FormControlLabelText>How are you feeling?</FormControlLabelText>
            </FormControlLabel>
            <Select
              selectedValue={values.mood}
              onValueChange={(value) => setFieldValue('mood', value)}
            >
              <SelectTrigger>
                <SelectInput placeholder="Select mood" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectItem label="Happy 😊" value="happy" />
                  <SelectItem label="Sad 😢" value="sad" />
                  <SelectItem label="Anxious 😰" value="anxious" />
                  <SelectItem label="Angry 😠" value="angry" />
                  <SelectItem label="Calm 😌" value="calm" />
                </SelectContent>
              </SelectPortal>
            </Select>
            {touched.mood && errors.mood && (
              <FormControlError>
                <FormControlErrorText>{errors.mood}</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Intensity Slider */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>
                Intensity: {values.intensity}/10
              </FormControlLabelText>
            </FormControlLabel>
            {/* Use Gluestack Slider or custom implementation */}
          </FormControl>

          {/* Submit Button */}
          <Button
            size="lg"
            onPress={() => handleSubmit()}
            className="mt-4"
          >
            <ButtonText>Save Entry</ButtonText>
          </Button>
        </View>
      )}
    </Formik>
  );
}

// components/forms/BookingForm.tsx
import { Formik } from 'formik';
import { View } from 'react-native';
import { Input, InputField, FormControl, Button, ButtonText } from '@gluestack-ui/themed';
import { bookingSchema } from '@/utils/validators';
import { useBookConsultation } from '@/hooks/useTherapists';
import { useTherapistStore } from '@/store/therapistStore';

export function BookingForm() {
  const selectedTherapist = useTherapistStore((state) => state.selectedTherapist);
  const { mutate: bookConsultation, isLoading } = useBookConsultation();

  return (
    <Formik
      initialValues={{
        therapistId: selectedTherapist?.id || '',
        date: '',
        time: '',
        notes: '',
      }}
      validationSchema={bookingSchema}
      onSubmit={(values) => {
        bookConsultation(values);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View className="gap-4 p-4">
          <FormControl isInvalid={!!(touched.date && errors.date)}>
            <Input>
              <InputField
                placeholder="Select date"
                value={values.date}
                onChangeText={handleChange('date')}
                onBlur={handleBlur('date')}
              />
            </Input>
          </FormControl>

          <FormControl isInvalid={!!(touched.time && errors.time)}>
            <Input>
              <InputField
                placeholder="Select time"
                value={values.time}
                onChangeText={handleChange('time')}
                onBlur={handleBlur('time')}
              />
            </Input>
          </FormControl>

          <FormControl>
            <Input>
              <InputField
                placeholder="Additional notes (optional)"
                value={values.notes}
                onChangeText={handleChange('notes')}
                multiline
              />
            </Input>
          </FormControl>

          <Button
            onPress={() => handleSubmit()}
            isDisabled={isLoading}
            size="lg"
          >
            <ButtonText>
              {isLoading ? 'Booking...' : 'Continue to Payment'}
            </ButtonText>
          </Button>
        </View>
      )}
    </Formik>
  );
}
```

### 7. Component Development Standards

**Example: AI Chat Component**
```tsx
import { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Input, InputField, Button, ButtonText } from '@gluestack-ui/themed';
import { useConversationStore } from '@/store/conversationStore';
import { useSendMessage } from '@/hooks/useConversation';

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const messages = useConversationStore((state) => state.messages);
  const isTyping = useConversationStore((state) => state.isTyping);
  
  const { mutate: sendMessage, isLoading } = useSendMessage();

  const handleSend = async () => {
    if (!message.trim()) return;
    
    sendMessage(
      { message, conversationId: undefined },
      {
        onSuccess: () => {
          setMessage('');
        },
        onError: (error) => {
          console.error('Failed to send message:', error);
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <View className="flex-1 bg-gray-50">
        {/* Messages */}
        <ScrollView className="flex-1 px-4 py-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 bg-white border-t border-gray-200">
          <View className="flex-row items-center gap-2">
            <Input className="flex-1">
              <InputField
                placeholder="Type your message..."
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
              />
            </Input>
            <Button 
              onPress={handleSend} 
              isDisabled={isLoading || !message.trim()}
              size="md"
            >
              <ButtonText>Send</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
```

### 4. AI Integration Patterns

**Conversation Service with Axios:**
```typescript
// services/ai/conversationService.ts
import apiClient from '@/lib/axios';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationResponse {
  message: string;
  action?: 'THERAPIST_URGENT' | 'BREATHING' | 'PMR' | 'JOURNAL' | 'GRATITUDE';
  conversationId: string;
}

export class ConversationService {
  async sendMessage(
    userMessage: string,
    conversationId?: string
  ): Promise<ConversationResponse> {
    try {
      const response = await apiClient.post<ConversationResponse>(
        '/conversation/message',
        {
          message: userMessage,
          conversationId,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Conversation error:', error);
      throw error;
    }
  }

  async getHistory(conversationId: string) {
    try {
      const response = await apiClient.get(`/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string) {
    try {
      await apiClient.delete(`/conversation/${conversationId}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }
}

export const conversationService = new ConversationService();
```

### 5. Voice Agent Implementation

**Voice Service with Blob Animation:**
```typescript
// services/ai/voiceService.ts
import { Audio } from 'expo-av';

export class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async startRecording(onVolumeUpdate: (volume: number) => void) {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    // Monitor volume for blob animation
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && status.metering) {
        onVolumeUpdate(status.metering);
      }
    });

    await recording.startAsync();
    this.recording = recording;
    this.isRecording = true;
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) return '';

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.recording = null;
    this.isRecording = false;

    // Send to Whisper API for transcription
    return await this.transcribeAudio(uri);
  }

  private async transcribeAudio(uri: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    return data.text;
  }

  async textToSpeech(text: string): Promise<void> {
    // Use ElevenLabs or similar for natural TTS
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: 'compassionate_voice',
      }),
    });

    const audioBuffer = await response.arrayBuffer();
    // Play audio using expo-av
    const { sound } = await Audio.Sound.createAsync(
      { uri: URL.createObjectURL(new Blob([audioBuffer])) },
      { shouldPlay: true }
    );
  }
}
```

**Animated Blob Component:**
```tsx
// components/ai/VoiceBlob.tsx
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';

type BlobState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceBlobProps {
  state: BlobState;
  volume?: number;
}

export function VoiceBlob({ state, volume = 0 }: VoiceBlobProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    switch (state) {
      case 'listening':
        // Pulse based on volume
        scale.value = withSpring(1 + volume * 0.3);
        break;
      case 'thinking':
        // Gentle shimmer
        scale.value = withTiming(1.1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        });
        break;
      case 'speaking':
        // Animated response
        scale.value = withSpring(1.2);
        break;
      default:
        scale.value = withSpring(1);
    }
  }, [state, volume]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center h-64">
      <Animated.View style={animatedStyle}>
        <Canvas style={{ width: 200, height: 200 }}>
          <Group>
            <Circle cx={100} cy={100} r={80} color="#6366F1" opacity={0.3} />
            <Circle cx={100} cy={100} r={60} color="#6366F1" opacity={0.6} />
            <Circle cx={100} cy={100} r={40} color="#6366F1" />
          </Group>
        </Canvas>
      </Animated.View>
    </View>
  );
}
```

### 6. Authentication Implementation

**OAuth with Expo:**
```typescript
// services/auth/oauthService.ts
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

export class AuthService {
  async signInWithGoogle() {
    const [request, response, promptAsync] = Google.useAuthRequest({
      expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    });

    const result = await promptAsync();
    
    if (result?.type === 'success') {
      const { authentication } = result;
      await this.storeToken(authentication.accessToken);
      return await this.getUserProfile(authentication.accessToken);
    }
  }

  async signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      await this.storeToken(credential.identityToken);
      return credential;
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        // User canceled
      }
    }
  }

  private async storeToken(token: string) {
    await SecureStore.setItemAsync('authToken', token);
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  }

  async logout() {
    await SecureStore.deleteItemAsync('authToken');
  }
}
```

### 7. Payment Integration

**Stripe Payment:**
```typescript
// services/payment/paymentService.ts
import { useStripe } from '@stripe/stripe-react-native';

export function usePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const processPayment = async (
    therapistId: string,
    amount: number
  ) => {
    // Get payment intent from backend
    const response = await fetch('/api/v1/payment/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        therapistId,
        amount,
        currency: 'usd',
      }),
    });

    const { paymentIntent, ephemeralKey, customer } = await response.json();

    // Initialize payment sheet
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Haven Therapy',
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Present payment UI
    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    return { success: true, paymentIntent };
  };

  return { processPayment };
}
```

### 8. State Management Pattern

**Using Zustand Stores in Components:**
```typescript
// Example: Therapist Selection Flow
import { View } from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { useTherapists, useTherapist } from '@/hooks/useTherapists';
import { useTherapistStore } from '@/store/therapistStore';

export function TherapistListScreen() {
  const { data: therapists, isLoading, error } = useTherapists();
  const setSelectedTherapist = useTherapistStore((state) => state.setSelectedTherapist);
  const openTherapistModal = useTherapistStore((state) => state.openTherapistModal);

  const handleSelectTherapist = (therapist) => {
    setSelectedTherapist(therapist);
    openTherapistModal();
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} />;

  return (
    <View className="flex-1 p-4">
      {therapists?.map((therapist) => (
        <TherapistCard
          key={therapist.id}
          therapist={therapist}
          onPress={() => handleSelectTherapist(therapist)}
        />
      ))}
    </View>
  );
}

// Example: Complex state with multiple stores
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';
import { useAppStore } from '@/store/appStore';

export function MainScreen() {
  // Auth state
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Conversation state
  const messages = useConversationStore((state) => state.messages);
  const addMessage = useConversationStore((state) => state.addMessage);
  
  // App state
  const setCurrentAction = useAppStore((state) => state.setCurrentAction);
  const currentAction = useAppStore((state) => state.currentAction);

  // Component logic using multiple stores
}
```

### 9. Data Encryption & Security

**Encryption Utilities:**
```typescript
// utils/encryption.ts
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export class EncryptionService {
  private static ENCRYPTION_KEY = 'user_encryption_key';

  static async generateKey(): Promise<string> {
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString()
    );
    await SecureStore.setItemAsync(this.ENCRYPTION_KEY, key);
    return key;
  }

  static async encrypt(data: string): Promise<string> {
    const key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
    if (!key) {
      throw new Error('Encryption key not found');
    }
    // Use a proper encryption library like expo-crypto or crypto-js
    // This is simplified for example
    return btoa(data); // Replace with actual encryption
  }

  static async decrypt(encryptedData: string): Promise<string> {
    const key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
    if (!key) {
      throw new Error('Encryption key not found');
    }
    return atob(encryptedData); // Replace with actual decryption
  }

  static async encryptAndStore(key: string, data: any) {
    const encrypted = await this.encrypt(JSON.stringify(data));
    await SecureStore.setItemAsync(key, encrypted);
  }

  static async retrieveAndDecrypt(key: string): Promise<any> {
    const encrypted = await SecureStore.getItemAsync(key);
    if (!encrypted) return null;
    const decrypted = await this.decrypt(encrypted);
    return JSON.parse(decrypted);
  }
}
```

### 10. Testing Guidelines

**Component Testing with Jest:**
```typescript
// __tests__/components/ChatInterface.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatInterface } from '@/components/ai/ChatInterface';

describe('ChatInterface', () => {
  it('sends message when button pressed', async () => {
    const { getByPlaceholderText, getByText } = render(<ChatInterface />);
    
    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Hello');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  it('disables send when message is empty', () => {
    const { getByText } = render(<ChatInterface />);
    const sendButton = getByText('Send');
    
    expect(sendButton.props.disabled).toBe(true);
  });
});
```

## AI Development Instructions

When working on Haven, follow these principles:

### 1. **Always Start with Context**
- Review the PRD section relevant to the feature
- Understand the user flow before coding
- Check existing components for reusability

### 2. **Component Structure**
- Create small, focused components
- Use TypeScript for type safety
- Extract business logic to hooks or services (using TanStack Query)
- Keep components presentational when possible
- Use Zustand for global state, React Query for server state

### 3. **Styling Approach**
- Use NativeWind classes for layout and spacing
- Use Gluestack components for interactive elements
- Maintain consistent spacing: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px)
- Colors: Primary `bg-indigo-600`, Secondary `bg-gray-100`, Text `text-gray-900`

### 4. **Data Fetching & State Management**
- Use TanStack Query (React Query) for ALL server state
- Use Zustand for client-side global state only
- Use Axios for all HTTP requests
- Always handle loading and error states
- Implement optimistic updates where appropriate

### 5. **Form Handling**
- Always use Formik for forms with multiple fields
- Use Yup schemas for validation
- Show validation errors clearly with Gluestack FormControl
- Disable submit buttons during submission
- Provide clear success/error feedback

### 6. **AI Integration**
- Always handle errors gracefully
- Show loading states during API calls
- Cache conversation history locally (encrypted)
- Implement retry logic for failed requests
- Rate limit user requests to prevent abuse

### 5. **Security First**
- Never log sensitive data
- Encrypt all stored conversations
- Use HTTPS for all API calls (Axios handles this)
- Validate all user inputs (use Yup schemas)
- Implement proper authentication checks
- Use Expo SecureStore for tokens

### 6. **Performance**
- Lazy load components when possible
- Memoize expensive calculations
- Use FlatList for long lists
- Optimize images and assets
- Implement proper pagination
- Use React Query caching strategies

### 7. **Accessibility**
- Add accessibility labels to all interactive elements
- Ensure proper contrast ratios
- Support screen readers
- Test with VoiceOver/TalkBack
- Provide alternative text for images

### 8. **Error Handling**
```typescript
// With TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['therapists'],
  queryFn: therapistAPI.getTherapists,
  retry: 2,
});

if (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
    } else if (error.response?.status === 500) {
      // Server error - show error message
    }
  }
}

// With mutations
const mutation = useMutation({
  mutationFn: sendMessage,
  onError: (error) => {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      console.error('API Error:', error.response?.data);
    }
  },
});
```

### 9. **Naming Conventions**
- Components: PascalCase (`ChatInterface.tsx`)
- Hooks: camelCase with 'use' prefix (`useAIChat.ts`)
- Services: PascalCase class (`ConversationService`)
- Utils: camelCase (`encryptData()`)
- Constants: UPPER_SNAKE_CASE (`MAX_MESSAGE_LENGTH`)

### 10. **Git Commit Guidelines**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `style:` Styling changes
- `test:` Adding tests
- `docs:` Documentation

Example: `feat: implement voice blob animation with volume detection`

## Common Patterns & Solutions

### Using TanStack Query with Zustand
```tsx
// Fetch data with React Query, store UI state in Zustand
import { useQuery } from '@tanstack/react-query';
import { useTherapistStore } from '@/store/therapistStore';

export function TherapistModal() {
  const selectedTherapist = useTherapistStore((state) => state.selectedTherapist);
  const closeModal = useTherapistStore((state) => state.closeTherapistModal);
  
  // Fetch detailed therapist data
  const { data: therapistDetails, isLoading } = useQuery({
    queryKey: ['therapist', selectedTherapist?.id],
    queryFn: () => therapistAPI.getTherapistById(selectedTherapist!.id),
    enabled: !!selectedTherapist?.id,
  });

  return (
    <Modal isOpen={!!selectedTherapist} onClose={closeModal}>
      {isLoading ? <Spinner /> : <TherapistDetails data={therapistDetails} />}
    </Modal>
  );
}
```

### Form with Validation
```tsx
import { Formik } from 'formik';
import { journalEntrySchema } from '@/utils/validators';

<Formik
  initialValues={{ content: '', mood: '', intensity: 5 }}
  validationSchema={journalEntrySchema}
  onSubmit={(values) => {
    // Handle submission
  }}
>
  {({ handleChange, handleSubmit, values, errors, touched }) => (
    <FormControl isInvalid={!!(touched.content && errors.content)}>
      <Input>
        <InputField
          value={values.content}
          onChangeText={handleChange('content')}
        />
      </Input>
      {touched.content && errors.content && (
        <FormControlError>
          <FormControlErrorText>{errors.content}</FormControlErrorErrorText>
        </FormControlError>
      )}
    </FormControl>
  )}
</Formik>
```

### Loading States
```tsx
import { Spinner } from '@gluestack-ui/themed';

{isLoading ? (
  <View className="flex-1 items-center justify-center">
    <Spinner size="large" />
  </View>
) : (
  <Content />
)}
```

### Error Boundaries
```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error) => logErrorToService(error)}
>
  <App />
</ErrorBoundary>
```

### Modals
```tsx
import { Modal, ModalBackdrop, ModalContent } from '@gluestack-ui/themed';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalBackdrop />
  <ModalContent className="p-6">
    {/* Modal content */}
  </ModalContent>
</Modal>
```

## Environment Variables

Create `.env` file:
```
# API Configuration
EXPO_PUBLIC_API_URL=https://api.haven.app

# AI Services
EXPO_PUBLIC_OPENAI_API_KEY=sk-xxx
EXPO_PUBLIC_ELEVENLABS_API_KEY=xxx

# Authentication
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxx
EXPO_PUBLIC_IOS_CLIENT_ID=xxx
EXPO_PUBLIC_ANDROID_CLIENT_ID=xxx

# Payment
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
EXPO_PUBLIC_COINBASE_COMMERCE_KEY=xxx
```

## Package Installation

```bash
# Core dependencies
npm install expo expo-router react-native

# Styling
npm install nativewind tailwindcss @gluestack-ui/themed

# State & Data Management
npm install zustand @tanstack/react-query axios

# Forms & Validation
npm install formik yup

# Authentication
npm install expo-auth-session expo-web-browser expo-apple-authentication

# Storage
npm install @react-native-async-storage/async-storage expo-secure-store

# Audio/Voice
npm install expo-av react-native-voice

# Animations
npm install react-native-reanimated lottie-react-native

# Payments
npm install @stripe/stripe-react-native

# Development
npm install --save-dev @types/react @types/react-native typescript
```

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
eas build --platform ios
eas build --platform android
```

## Priority Implementation Order

1. **Phase 1 - Foundation (Week 1-2)**
   - Authentication (OAuth)
   - Basic navigation structure
   - Main screen layout
   - API client setup

2. **Phase 2 - Core AI (Week 3-4)**
   - Text chat interface
   - AI conversation service
   - Message history
   - Decision engine basics

3. **Phase 3 - Voice & Animations (Week 5-6)**
   - Voice recording/playback
   - Blob animation
   - Speech-to-text integration
   - Text-to-speech

4. **Phase 4 - Interventions (Week 7-8)**
   - Breathing exercises
   - PMR implementation
   - Journaling feature
   - Gratitude practice

5. **Phase 5 - Therapist System (Week 9-10)**
   - Therapist list/cards
   - Modal implementation
   - Payment integration
   - Booking system

6. **Phase 6 - Polish (Week 11-12)**
   - Animations & transitions
   - Error handling
   - Testing
   - Performance optimization

## Resources & Documentation

- **Expo Docs:** https://docs.expo.dev/
- **NativeWind:** https://www.nativewind.dev/
- **Gluestack UI:** https://gluestack.io/ui/docs/home/overview/introduction
- **React Native:** https://reactnative.dev/
- **OpenAI API:** https://platform.openai.com/docs
- **Stripe Mobile:** https://stripe.com/docs/payments/accept-a-payment?platform=react-native

## Support & Questions

When stuck:
1. Check this prompt first
2. Review PRD for feature requirements
3. Check Gluestack component documentation
4. Search Expo documentation
5. Review similar implemented features

Remember: **Code with empathy** - this app helps people with their mental health. Every detail matters.