# Component Refactoring Plan
## Haven - Breaking Down Screens into Reusable Components

**Date:** January 2026  
**Purpose:** Systematically refactor all screens/pages into smaller, reusable components, functions, and buttons following the KISS principle and DRY (Don't Repeat Yourself) methodology.

---

## Table of Contents
1. [Overview](#overview)
2. [Refactoring Principles](#refactoring-principles)
3. [Screen-by-Screen Refactoring Plan](#screen-by-screen-refactoring-plan)
4. [Shared Component Library](#shared-component-library)
5. [Utility Functions](#utility-functions)
6. [Implementation Order](#implementation-order)

---

## Overview

This document outlines a detailed step-by-step plan to refactor all screens in the Haven app into smaller, reusable components. The goal is to:
- Improve code maintainability
- Reduce code duplication
- Enhance reusability
- Make testing easier
- Follow React best practices
- Maintain consistent UI/UX patterns

---

## Refactoring Principles

### 1. Component Size
- **Single Responsibility:** Each component should do one thing well
- **Max Lines:** Aim for components under 200 lines
- **Complexity:** If a component has >5 props, consider splitting it

### 2. Reusability
- **Extract Common Patterns:** Identify repeated UI patterns across screens
- **Generic Over Specific:** Create flexible components that can be configured
- **Composition:** Build complex components from simple ones

### 3. Naming Conventions
- **Components:** PascalCase (e.g., `MoodChip`, `GradientCard`)
- **Functions:** camelCase (e.g., `formatTime`, `getPhaseDuration`)
- **Files:** Match component name (e.g., `MoodChip.tsx`)

### 4. File Organization
```
components/
  ├── common/          # Shared across multiple features
  ├── breathing/       # Breathing exercise specific
  ├── journal/         # Journal specific
  ├── gratitude/       # Gratitude specific
  ├── therapist/       # Therapist specific
  └── ui/              # Base UI components
```

---

## Screen-by-Screen Refactoring Plan

### 1. Welcome Screen (`app/(auth)/welcome.tsx`)

#### Current State Analysis
- Video background with gradient overlays
- Logo container with gradient
- Title and subtitle
- Bottom sheet with OAuth buttons
- Terms text

#### Components to Extract

**1.1 `VideoBackground` Component**
- **Location:** `components/common/VideoBackground.tsx`
- **Props:**
  ```typescript
  interface VideoBackgroundProps {
    source: string | number;
    gradientColors?: string[];
    gradientLocations?: number[];
    darkOverlay?: boolean;
    overlayOpacity?: number;
  }
  ```
- **Functionality:**
  - Handles video loading and playback
  - Applies gradient overlays
  - Manages video player lifecycle
- **Reusable in:** Any screen needing video background

**1.2 `OAuthButton` Component**
- **Location:** `components/common/OAuthButton.tsx`
- **Props:**
  ```typescript
  interface OAuthButtonProps {
    provider: 'apple' | 'google';
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  }
  ```
- **Functionality:**
  - Renders Apple or Google OAuth button
  - Handles icon and styling
  - Consistent button appearance
- **Reusable in:** Welcome screen, future login screens

**1.3 `BottomSheet` Component (Already exists, enhance)**
- **Location:** `components/ui/BottomSheetModal.tsx` (existing)
- **Enhancements:**
  - Add gradient background prop
  - Add drag handle customization
  - Add header slot
- **Reusable in:** All modal screens

**1.4 `LogoContainer` Component**
- **Location:** `components/common/LogoContainer.tsx`
- **Props:**
  ```typescript
  interface LogoContainerProps {
    source: string | { uri: string };
    size?: number;
    gradientColor?: string;
    showAnimation?: boolean;
  }
  ```
- **Functionality:**
  - Displays logo with gradient overlay
  - Handles animation
  - Consistent logo styling
- **Reusable in:** Welcome screen, splash screen, profile

#### Functions to Extract

**1.5 `useVideoPlayer` Hook (Already exists, enhance)**
- **Location:** Custom hook or keep using expo-video
- **Enhancements:**
  - Better error handling
  - Loading states
  - Retry logic

---

### 2. Home Screen (`screens/HomeScreen.tsx`)

#### Current State Analysis
- Header with menu, title, notifications
- Greeting text
- Two primary action cards (Chat, Voice)
- Feature list (Mood Journal, Wellness, Profile)
- Recommendations carousel

#### Components to Extract

**2.1 `ScreenHeader` Component**
- **Location:** `components/common/ScreenHeader.tsx`
- **Props:**
  ```typescript
  interface ScreenHeaderProps {
    title?: string;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
    showMenu?: boolean;
    onMenuPress?: () => void;
    onNotificationsPress?: () => void;
    onProfilePress?: () => void;
  }
  ```
- **Functionality:**
  - Consistent header across all screens
  - Handles menu, notifications, profile buttons
  - Title display
- **Reusable in:** Home, Chat, Voice, Journal, Gratitude, etc.

**2.2 `PrimaryActionCard` Component**
- **Location:** `components/common/PrimaryActionCard.tsx`
- **Props:**
  ```typescript
  interface PrimaryActionCardProps {
    title: string;
    subtitle: string;
    icon: string;
    iconColor?: string;
    backgroundImage?: string;
    gradientColors?: string[];
    onPress: () => void;
    variant?: 'chat' | 'voice' | 'custom';
  }
  ```
- **Functionality:**
  - Displays action card with image background
  - Icon container with BlurView
  - Gradient overlay
  - Consistent styling
- **Reusable in:** Home screen (Chat, Voice cards)

**2.3 `FeatureActionButton` Component**
- **Location:** `components/common/FeatureActionButton.tsx`
- **Props:**
  ```typescript
  interface FeatureActionButtonProps {
    icon: string;
    iconColor: string;
    iconBgColor: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }
  ```
- **Functionality:**
  - Displays feature button with icon, title, subtitle
  - Chevron right icon
  - Consistent dark theme styling
- **Reusable in:** Home screen (Mood Journal, Wellness, Profile)

**2.4 `RecommendationCard` Component**
- **Location:** `components/common/RecommendationCard.tsx`
- **Props:**
  ```typescript
  interface RecommendationCardProps {
    title: string;
    type: 'audio' | 'video' | 'article' | 'gratitude';
    duration: string;
    imageUri?: string;
    onPress: () => void;
  }
  ```
- **Functionality:**
  - Displays recommendation with image
  - Type icon and duration
  - Play button overlay for audio/video
  - Consistent card styling
- **Reusable in:** Home screen recommendations

**2.5 `RecommendationsCarousel` Component**
- **Location:** `components/common/RecommendationsCarousel.tsx`
- **Props:**
  ```typescript
  interface RecommendationsCarouselProps {
    recommendations: Recommendation[];
    onRecommendationPress: (id: string, type: string) => void;
    title?: string;
  }
  ```
- **Functionality:**
  - Horizontal scrollable carousel
  - Section title
  - Renders RecommendationCard components
- **Reusable in:** Home screen, future content screens

**2.6 `GreetingText` Component**
- **Location:** `components/common/GreetingText.tsx`
- **Props:**
  ```typescript
  interface GreetingTextProps {
    name: string;
    message?: string;
  }
  ```
- **Functionality:**
  - Displays personalized greeting
  - Consistent typography and styling
- **Reusable in:** Home screen

#### Functions to Extract

**2.7 `getRecommendationIcon` Function**
- **Location:** `utils/recommendations.ts`
- **Functionality:**
  - Maps recommendation type to icon name
  - Centralized icon logic

**2.8 `getRecommendationMeta` Function**
- **Location:** `utils/recommendations.ts`
- **Functionality:**
  - Returns icon and duration for recommendation type

---

### 3. Chat Screen (`screens/ChatScreen.tsx`)

#### Current State Analysis
- ChatHeader component (already extracted)
- ChatBubble component (already extracted)
- ChatInput component (already extracted)
- TypingIndicator component (already extracted)
- Date separator
- Message list

#### Components to Extract

**3.1 `DateSeparator` Component**
- **Location:** `components/chat/DateSeparator.tsx`
- **Props:**
  ```typescript
  interface DateSeparatorProps {
    date: string;
    format?: 'full' | 'short' | 'relative';
  }
  ```
- **Functionality:**
  - Displays date badge
  - Formats date consistently
- **Reusable in:** Chat screen

**3.2 `MessageList` Component**
- **Location:** `components/chat/MessageList.tsx`
- **Props:**
  ```typescript
  interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
    onMessagePress?: (message: Message) => void;
  }
  ```
- **Functionality:**
  - Renders list of messages
  - Handles scrolling
  - Shows typing indicator
- **Reusable in:** Chat screen

**3.3 `GradientBackground` Component**
- **Location:** `components/common/GradientBackground.tsx`
- **Props:**
  ```typescript
  interface GradientBackgroundProps {
    variant?: 'default' | 'dark' | 'light';
    showBlobs?: boolean;
    blobColors?: string[];
  }
  ```
- **Functionality:**
  - Dark gradient with ambient blobs
  - Consistent background across screens
- **Reusable in:** Chat, Voice, Home, Journal, Gratitude, etc.

#### Functions to Extract

**3.4 `formatChatDate` Function**
- **Location:** `utils/date.ts`
- **Functionality:**
  - Formats date for chat display
  - "Today, 10:42 AM" format
- **Reusable in:** Chat screen, notifications

---

### 4. Voice Screen (`screens/VoiceScreen.tsx`)

#### Current State Analysis
- Blob animation with morphing
- Ripple effects
- Visualizer bars
- Live session badge
- Bottom controls with glass panel

#### Components to Extract

**4.1 `AnimatedBlob` Component**
- **Location:** `components/voice/AnimatedBlob.tsx`
- **Props:**
  ```typescript
  interface AnimatedBlobProps {
    size?: number;
    state?: 'listening' | 'speaking' | 'thinking' | 'idle';
    colors?: string[];
  }
  ```
- **Functionality:**
  - Morphing blob animation
  - State-based animations
  - Ripple effects
  - Inner glow
- **Reusable in:** Voice screen

**4.2 `VisualizerBars` Component**
- **Location:** `components/voice/VisualizerBars.tsx`
- **Props:**
  ```typescript
  interface VisualizerBarsProps {
    barCount?: number;
    height?: number;
    color?: string;
  }
  ```
- **Functionality:**
  - Animated audio visualizer bars
  - Individual pulse animations
- **Reusable in:** Voice screen

**4.3 `LiveSessionBadge` Component**
- **Location:** `components/voice/LiveSessionBadge.tsx`
- **Props:**
  ```typescript
  interface LiveSessionBadgeProps {
    isLive: boolean;
    text?: string;
  }
  ```
- **Functionality:**
  - Live indicator with pulsing dot
  - BlurView backdrop
- **Reusable in:** Voice screen

**4.4 `GlassControlPanel` Component**
- **Location:** `components/common/GlassControlPanel.tsx`
- **Props:**
  ```typescript
  interface GlassControlPanelProps {
    children: React.ReactNode;
    intensity?: number;
    tint?: 'light' | 'dark';
    borderRadius?: number;
  }
  ```
- **Functionality:**
  - Glassmorphism panel with BlurView
  - Rounded corners
  - Consistent styling
- **Reusable in:** Voice screen, other control panels

#### Functions to Extract

**4.5 `useBlobAnimation` Hook**
- **Location:** `hooks/useBlobAnimation.ts`
- **Functionality:**
  - Manages blob morphing animation
  - Returns animated styles
- **Reusable in:** Voice screen

**4.6 `useRippleAnimation` Hook**
- **Location:** `hooks/useRippleAnimation.ts`
- **Functionality:**
  - Manages ripple effects
  - Staggered animations
- **Reusable in:** Voice screen

---

### 5. Box Breathing Screen (`screens/BoxBreathingScreen.tsx`)

#### Current State Analysis
- Breathing box with animated path
- Traveling dot
- Breathing orb
- Phase labels
- Controls (reset, play/pause, mute)
- Progress display

#### Components to Extract

**5.1 `BreathingBox` Component**
- **Location:** `components/breathing/BreathingBox.tsx`
- **Props:**
  ```typescript
  interface BreathingBoxProps {
    size: number;
    radius?: number;
    currentPhase: BreathingPhase;
    phaseProgress: number;
    dotProgress: number;
  }
  ```
- **Functionality:**
  - Renders breathing box with border
  - Active path highlighting
  - Traveling dot animation
  - Phase labels
- **Reusable in:** Box Breathing screen

**5.2 `BreathingOrb` Component**
- **Location:** `components/breathing/BreathingOrb.tsx`
- **Props:**
  ```typescript
  interface BreathingOrbProps {
    scale: number;
    phase: BreathingPhase;
    count: number;
    showWave?: boolean;
  }
  ```
- **Functionality:**
  - Animated breathing orb
  - Phase text display
  - Countdown display
  - Wave pulsing effect
- **Reusable in:** Box Breathing screen

**5.3 `BreathingControls` Component**
- **Location:** `components/breathing/BreathingControls.tsx`
- **Props:**
  ```typescript
  interface BreathingControlsProps {
    isPaused: boolean;
    isMuted: boolean;
    onPause: () => void;
    onReset: () => void;
    onMute: () => void;
  }
  ```
- **Functionality:**
  - Reset button
  - Play/pause button
  - Mute button
  - Consistent control styling
- **Reusable in:** Box Breathing screen, future breathing exercises

**5.4 `BreathingProgress` Component**
- **Location:** `components/breathing/BreathingProgress.tsx`
- **Props:**
  ```typescript
  interface BreathingProgressProps {
    currentCycle: number;
    totalCycles: number;
    remainingTime: number;
  }
  ```
- **Functionality:**
  - Cycle counter display
  - Remaining time display
  - Progress bar
- **Reusable in:** Box Breathing screen

**5.5 `ActivePathIndicator` Component**
- **Location:** `components/breathing/ActivePathIndicator.tsx`
- **Props:**
  ```typescript
  interface ActivePathIndicatorProps {
    side: 'top' | 'right' | 'bottom' | 'left';
    isActive: boolean;
    progress: number;
    boxSize: number;
    radius: number;
  }
  ```
- **Functionality:**
  - Renders glowing path for active side
  - Animated opacity
  - Border radius handling
- **Reusable in:** Box Breathing screen

#### Functions to Extract

**5.6 `useBreathingAnimation` Hook**
- **Location:** `hooks/useBreathingAnimation.ts`
- **Functionality:**
  - Manages all breathing animations
  - Orb scale, dot progress, path progress
  - Returns animated styles
- **Reusable in:** Box Breathing screen

**5.7 `useBreathingCycle` Hook**
- **Location:** `hooks/useBreathingCycle.ts`
- **Functionality:**
  - Manages breathing cycle logic
  - Phase transitions
  - Countdown management
  - Returns phase state and handlers
- **Reusable in:** Box Breathing screen

**5.8 `formatTime` Function**
- **Location:** `utils/time.ts`
- **Functionality:**
  - Formats seconds to MM:SS
  - Reusable across app
- **Reusable in:** Box Breathing, other time displays

**5.9 `getPhaseDuration` Function**
- **Location:** `utils/breathing.ts`
- **Functionality:**
  - Calculates phase duration from settings
  - Returns duration in milliseconds
- **Reusable in:** Box Breathing screen

---

### 6. Box Breathing Settings Screen (`screens/BoxBreathingSettingsScreen.tsx`)

#### Current State Analysis
- Feature header with icon
- Rhythm duration sliders
- Experience toggles
- Background music section
- Reset button

#### Components to Extract

**6.1 `SettingsHeader` Component**
- **Location:** `components/common/SettingsHeader.tsx`
- **Props:**
  ```typescript
  interface SettingsHeaderProps {
    title: string;
    onBack: () => void;
    onDone: () => void;
    showBack?: boolean;
    showDone?: boolean;
  }
  ```
- **Functionality:**
  - Consistent settings header
  - Back and Done buttons
  - BlurView backdrop
- **Reusable in:** Box Breathing Settings, future settings screens

**6.2 `FeatureHeader` Component**
- **Location:** `components/common/FeatureHeader.tsx`
- **Props:**
  ```typescript
  interface FeatureHeaderProps {
    icon: string;
    iconColor?: string;
    title: string;
    subtitle?: string;
    gradientColors?: string[];
  }
  ```
- **Functionality:**
  - Displays feature icon, title, subtitle
  - Gradient icon background
  - Consistent styling
- **Reusable in:** Settings screens, feature screens

**6.3 `DurationSlider` Component**
- **Location:** `components/breathing/DurationSlider.tsx`
- **Props:**
  ```typescript
  interface DurationSliderProps {
    label: string;
    icon: string;
    value: number;
    min: number;
    max: number;
    unit?: string;
    onChange: (value: number) => void;
    showLabels?: boolean;
  }
  ```
- **Functionality:**
  - Slider with label, icon, value display
  - Optional min/max labels
  - Consistent slider styling
- **Reusable in:** Box Breathing Settings

**6.4 `ToggleSwitch` Component**
- **Location:** `components/ui/ToggleSwitch.tsx`
- **Props:**
  ```typescript
  interface ToggleSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
  }
  ```
- **Functionality:**
  - Animated toggle switch
  - Smooth transitions
  - Consistent styling
- **Reusable in:** Settings screens, feature toggles

**6.5 `SettingsSection` Component**
- **Location:** `components/common/SettingsSection.tsx`
- **Props:**
  ```typescript
  interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
    useGlassCard?: boolean;
  }
  ```
- **Functionality:**
  - Section title with uppercase styling
  - Wraps content in glass card or plain container
- **Reusable in:** Settings screens

**6.6 `MusicOptionButton` Component**
- **Location:** `components/breathing/MusicOptionButton.tsx`
- **Props:**
  ```typescript
  interface MusicOptionButtonProps {
    id: string;
    label: string;
    icon: string;
    isSelected: boolean;
    onPress: () => void;
  }
  ```
- **Functionality:**
  - Music selection button
  - Selected state with indicator dot
  - Pulse animation for selected
- **Reusable in:** Box Breathing Settings

**6.7 `SettingsToggleItem` Component**
- **Location:** `components/common/SettingsToggleItem.tsx`
- **Props:**
  ```typescript
  interface SettingsToggleItemProps {
    icon: string;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    showDivider?: boolean;
  }
  ```
- **Functionality:**
  - Toggle item with icon and label
  - Optional divider below
  - Consistent styling
- **Reusable in:** Settings screens

#### Functions to Extract

**6.8 `useToggleAnimation` Hook**
- **Location:** `hooks/useToggleAnimation.ts`
- **Functionality:**
  - Manages toggle switch animation
  - Returns animated styles
- **Reusable in:** ToggleSwitch component

---

### 7. Mood Journal Screen (`screens/MoodJournalScreen.tsx`)

#### Current State Analysis
- Header with back, title, history button
- AI prompt card
- Journal input
- Mood selection chips
- Intensity slider
- Save button

#### Components to Extract

**7.1 `JournalHeader` Component**
- **Location:** `components/journal/JournalHeader.tsx`
- **Props:**
  ```typescript
  interface JournalHeaderProps {
    date: string;
    onBack: () => void;
    onHistory: () => void;
  }
  ```
- **Functionality:**
  - Header with date, back, history buttons
  - BlurView backdrop
- **Reusable in:** Mood Journal screen

**7.2 `AIPromptCard` Component**
- **Location:** `components/journal/AIPromptCard.tsx`
- **Props:**
  ```typescript
  interface AIPromptCardProps {
    prompt: string;
    icon?: string;
  }
  ```
- **Functionality:**
  - Displays AI-generated prompt
  - Icon container
  - Card styling
- **Reusable in:** Mood Journal screen

**7.3 `MoodChip` Component**
- **Location:** `components/journal/MoodChip.tsx`
- **Props:**
  ```typescript
  interface MoodChipProps {
    id: string;
    label: string;
    icon: string;
    isSelected: boolean;
    onPress: () => void;
  }
  ```
- **Functionality:**
  - Mood selection chip
  - Active/inactive states
  - Icon and label
- **Reusable in:** Mood Journal screen

**7.4 `MoodChipsList` Component**
- **Location:** `components/journal/MoodChipsList.tsx`
- **Props:**
  ```typescript
  interface MoodChipsListProps {
    moods: Mood[];
    selectedMood: string;
    onMoodSelect: (id: string) => void;
  }
  ```
- **Functionality:**
  - Horizontal scrollable mood chips
  - Renders MoodChip components
- **Reusable in:** Mood Journal screen

**7.5 `IntensitySlider` Component**
- **Location:** `components/journal/IntensitySlider.tsx`
- **Props:**
  ```typescript
  interface IntensitySliderProps {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    showLabels?: boolean;
  }
  ```
- **Functionality:**
  - Intensity slider with dynamic colors
  - Badge showing current value
  - Color gradient based on value
- **Reusable in:** Mood Journal screen

**7.6 `IntensitySliderCard` Component**
- **Location:** `components/journal/IntensitySliderCard.tsx`
- **Props:**
  ```typescript
  interface IntensitySliderCardProps {
    value: number;
    onChange: (value: number) => void;
  }
  ```
- **Functionality:**
  - Wraps IntensitySlider in card
  - Label and badge
  - Mild/Intense labels
- **Reusable in:** Mood Journal screen

#### Functions to Extract

**7.7 `getIntensityColor` Function**
- **Location:** `utils/mood.ts`
- **Functionality:**
  - Returns color based on intensity value (1-10)
  - Cool blues to hot reds
- **Reusable in:** Mood Journal screen

**7.8 `hexToRgba` Function**
- **Location:** `utils/color.ts`
- **Functionality:**
  - Converts hex color to rgba
  - Reusable utility
- **Reusable in:** Multiple components

---

### 8. Mood History Screen (`screens/MoodHistoryScreen.tsx`)

#### Current State Analysis
- Header with back, title, filter
- Calendar view
- Legend
- Insights card with graph
- Recent entries list

#### Components to Extract

**8.1 `MoodCalendar` Component**
- **Location:** `components/journal/MoodCalendar.tsx`
- **Props:**
  ```typescript
  interface MoodCalendarProps {
    month: number;
    year: number;
    moodData: Record<string, MoodData>;
    onDatePress?: (date: Date) => void;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
  }
  ```
- **Functionality:**
  - Calendar grid with mood dots
  - Month navigation
  - Date selection
- **Reusable in:** Mood History screen

**8.2 `MoodLegend` Component**
- **Location:** `components/journal/MoodLegend.tsx`
- **Props:**
  ```typescript
  interface MoodLegendProps {
    moods: Mood[];
  }
  ```
- **Functionality:**
  - Displays mood color legend
  - Icon and label for each mood
- **Reusable in:** Mood History screen

**8.3 `MoodInsightsCard` Component**
- **Location:** `components/journal/MoodInsightsCard.tsx`
- **Props:**
  ```typescript
  interface MoodInsightsCardProps {
    insights: {
      graph: string; // SVG path
      text: string[];
    };
  }
  ```
- **Functionality:**
  - Displays AI insights with graph
  - Gradient background with blur
  - SVG graph rendering
- **Reusable in:** Mood History screen

**8.4 `MoodEntryCard` Component**
- **Location:** `components/journal/MoodEntryCard.tsx`
- **Props:**
  ```typescript
  interface MoodEntryCardProps {
    date: string;
    mood: Mood;
    intensity: number;
    description: string;
    onPress?: () => void;
  }
  ```
- **Functionality:**
  - Displays mood entry
  - Date, mood icon, intensity, description
- **Reusable in:** Mood History screen

**8.5 `CalendarDay` Component**
- **Location:** `components/journal/CalendarDay.tsx`
- **Props:**
  ```typescript
  interface CalendarDayProps {
    date: Date;
    dayNumber: number;
    mood?: MoodData;
    isCurrentMonth: boolean;
    isToday: boolean;
    onPress?: () => void;
  }
  ```
- **Functionality:**
  - Individual calendar day cell
  - Mood dot indicator
  - Today highlighting
- **Reusable in:** MoodCalendar component

#### Functions to Extract

**8.6 `getCalendarData` Function**
- **Location:** `utils/calendar.ts`
- **Functionality:**
  - Generates calendar days for month/year
  - Includes previous/next month days
  - Returns array of day objects
- **Reusable in:** Mood History screen

**8.7 `formatCalendarDate` Function**
- **Location:** `utils/date.ts`
- **Functionality:**
  - Formats date for calendar display
  - Month/year format
- **Reusable in:** Mood History screen

**8.8 `getMoodColor` Function**
- **Location:** `utils/mood.ts`
- **Functionality:**
  - Returns color for mood type
  - Centralized color mapping
- **Reusable in:** Mood components

---

### 9. Gratitude Screen (`screens/GratitudeScreen.tsx`)

#### Current State Analysis
- Header with back, title, streak badge
- Hero text
- Three numbered input fields
- Photo upload section
- Quote section
- Save button

#### Components to Extract

**9.1 `GratitudeHeader` Component**
- **Location:** `components/gratitude/GratitudeHeader.tsx`
- **Props:**
  ```typescript
  interface GratitudeHeaderProps {
    title: string;
    streak: number;
    onBack: () => void;
    onHistory: () => void;
  }
  ```
- **Functionality:**
  - Header with title and streak badge
  - Back button
  - Streak badge is pressable
- **Reusable in:** Gratitude screen

**9.2 `StreakBadge` Component**
- **Location:** `components/gratitude/StreakBadge.tsx`
- **Props:**
  ```typescript
  interface StreakBadgeProps {
    count: number;
    onPress?: () => void;
  }
  ```
- **Functionality:**
  - Displays streak count with fire icon
  - Pressable to view history
  - Shadow and styling
- **Reusable in:** Gratitude screen, profile

**9.3 `GratitudeInputField` Component**
- **Location:** `components/gratitude/GratitudeInputField.tsx`
- **Props:**
  ```typescript
  interface GratitudeInputFieldProps {
    index: number;
    value: string;
    placeholder: string;
    onChangeText: (text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    isFocused?: boolean;
  }
  ```
- **Functionality:**
  - Numbered input field
  - Focus indicator
  - Number badge
  - Consistent styling
- **Reusable in:** Gratitude screen

**9.4 `PhotoUploadButton` Component**
- **Location:** `components/gratitude/PhotoUploadButton.tsx`
- **Props:**
  ```typescript
  interface PhotoUploadButtonProps {
    onPress: () => void;
    label?: string;
  }
  ```
- **Functionality:**
  - Dashed border upload button
  - Icon container
  - Consistent styling
- **Reusable in:** Gratitude screen, journal

**9.5 `InspirationalQuote` Component**
- **Location:** `components/gratitude/InspirationalQuote.tsx`
- **Props:**
  ```typescript
  interface InspirationalQuoteProps {
    quote: string;
    author?: string;
  }
  ```
- **Functionality:**
  - Displays quote with icon
  - Author attribution
  - Centered layout
- **Reusable in:** Gratitude screen

#### Functions to Extract

**9.6 `getGratitudePlaceholders` Function**
- **Location:** `utils/gratitude.ts`
- **Functionality:**
  - Returns placeholder text for each input
  - Centralized placeholders
- **Reusable in:** Gratitude screen

---

### 10. Gratitude History Screen (`screens/GratitudeHistoryScreen.tsx`)

#### Current State Analysis
- Header with back, title, filter
- Insights card with bar chart
- Recent entries list

#### Components to Extract

**10.1 `GratitudeInsightsCard` Component**
- **Location:** `components/gratitude/GratitudeInsightsCard.tsx`
- **Props:**
  ```typescript
  interface GratitudeInsightsCardProps {
    insights: {
      chart: BarChartData[];
      text: string[];
    };
  }
  ```
- **Functionality:**
  - Displays growth insights
  - Bar chart visualization
  - Gradient background with blur
- **Reusable in:** Gratitude History screen

**10.2 `GratitudeEntryCard` Component**
- **Location:** `components/gratitude/GratitudeEntryCard.tsx`
- **Props:**
  ```typescript
  interface GratitudeEntryCardProps {
    date: string;
    title: string;
    description: string;
    tags?: string[];
    onPress?: () => void;
  }
  ```
- **Functionality:**
  - Displays gratitude entry
  - Date, icon, title, tags, description
- **Reusable in:** Gratitude History screen

**10.3 `BarChart` Component**
- **Location:** `components/common/BarChart.tsx`
- **Props:**
  ```typescript
  interface BarChartProps {
    data: BarChartData[];
    height?: number;
    color?: string;
    showLabels?: boolean;
  }
  ```
- **Functionality:**
  - Renders bar chart using SVG
  - Rounded top corners
  - Configurable styling
- **Reusable in:** Gratitude History, Mood History

#### Functions to Extract

**10.4 `generateBarChartData` Function**
- **Location:** `utils/charts.ts`
- **Functionality:**
  - Processes data for bar chart
  - Calculates bar heights
  - Returns SVG path data
- **Reusable in:** Gratitude History screen

---

### 11. Notifications Screen (`screens/NotificationsScreen.tsx`)

#### Current State Analysis
- Header with back, title, settings
- Today section with clear all
- Yesterday section
- Notification cards

#### Components to Extract

**11.1 `NotificationsHeader` Component**
- **Location:** `components/common/NotificationsHeader.tsx`
- **Props:**
  ```typescript
  interface NotificationsHeaderProps {
    onBack: () => void;
    onSettings?: () => void;
  }
  ```
- **Functionality:**
  - Header with back and settings buttons
  - Consistent styling
- **Reusable in:** Notifications screen

**11.2 `NotificationCard` Component**
- **Location:** `components/common/NotificationCard.tsx`
- **Props:**
  ```typescript
  interface NotificationCardProps {
    icon: string;
    iconColor: string;
    iconBgColor: string;
    title: string;
    description: string;
    time: string;
    isUnread: boolean;
    onPress?: () => void;
  }
  ```
- **Functionality:**
  - Displays notification
  - Icon container with color
  - Unread indicator with pulse
  - Time display
- **Reusable in:** Notifications screen

**11.3 `NotificationSection` Component**
- **Location:** `components/common/NotificationSection.tsx`
- **Props:**
  ```typescript
  interface NotificationSectionProps {
    title: string;
    notifications: Notification[];
    showClearAll?: boolean;
    onClearAll?: () => void;
    isRead?: boolean;
  }
  ```
- **Functionality:**
  - Groups notifications by date
  - Section title
  - Clear all button
  - Reduced opacity for read sections
- **Reusable in:** Notifications screen

**11.4 `UnreadIndicator` Component**
- **Location:** `components/common/UnreadIndicator.tsx`
- **Props:**
  ```typescript
  interface UnreadIndicatorProps {
    size?: number;
    color?: string;
  }
  ```
- **Functionality:**
  - Pulsing dot indicator
  - Animated scale and opacity
- **Reusable in:** NotificationCard, other unread indicators

#### Functions to Extract

**11.5 `groupNotificationsByDate` Function**
- **Location:** `utils/notifications.ts`
- **Functionality:**
  - Groups notifications by date
  - Returns sections (Today, Yesterday, etc.)
- **Reusable in:** Notifications screen

**11.6 `formatNotificationTime` Function**
- **Location:** `utils/date.ts`
- **Functionality:**
  - Formats time for notifications
  - "2 hours ago", "Yesterday", etc.
- **Reusable in:** Notifications screen

---

### 12. Profile Screen (`screens/ProfileScreen.tsx`)

#### Current State Analysis
- Header with back, title, menu
- Profile section with avatar
- Journey card
- Achievements grid
- Settings list

#### Components to Extract

**12.1 `ProfileHeader` Component**
- **Location:** `components/profile/ProfileHeader.tsx`
- **Props:**
  ```typescript
  interface ProfileHeaderProps {
    onBack: () => void;
    onMenu?: () => void;
  }
  ```
- **Functionality:**
  - Header with back and menu buttons
  - Consistent styling
- **Reusable in:** Profile screen

**12.2 `ProfileAvatar` Component**
- **Location:** `components/profile/ProfileAvatar.tsx`
- **Props:**
  ```typescript
  interface ProfileAvatarProps {
    source: string | { uri: string };
    size?: number;
    showEdit?: boolean;
    onEditPress?: () => void;
    gradientBorder?: boolean;
  }
  ```
- **Functionality:**
  - Circular avatar with gradient border
  - Edit button overlay
  - Shadow and styling
- **Reusable in:** Profile screen, therapist profile

**12.3 `JourneyCard` Component**
- **Location:** `components/profile/JourneyCard.tsx`
- **Props:**
  ```typescript
  interface JourneyCardProps {
    stats: {
      daysActive: number;
      sessionsCompleted: number;
      streaks: number;
      achievements: number;
    };
  }
  ```
- **Functionality:**
  - Glass panel card
  - Statistics display
  - BlurView backdrop
- **Reusable in:** Profile screen

**12.4 `AchievementCard` Component**
- **Location:** `components/profile/AchievementCard.tsx`
- **Props:**
  ```typescript
  interface AchievementCardProps {
    icon: string;
    title: string;
    description: string;
    isUnlocked: boolean;
    onPress?: () => void;
  }
  ```
- **Functionality:**
  - Achievement display
  - Locked/unlocked states
  - Icon, title, description
- **Reusable in:** Profile screen

**12.5 `AchievementsGrid` Component**
- **Location:** `components/profile/AchievementsGrid.tsx`
- **Props:**
  ```typescript
  interface AchievementsGridProps {
    achievements: Achievement[];
    columns?: number;
  }
  ```
- **Functionality:**
  - Grid layout for achievements
  - Renders AchievementCard components
- **Reusable in:** Profile screen

**12.6 `SettingsItem` Component**
- **Location:** `components/common/SettingsItem.tsx`
- **Props:**
  ```typescript
  interface SettingsItemProps {
    icon?: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    variant?: 'default' | 'destructive';
    showChevron?: boolean;
  }
  ```
- **Functionality:**
  - Settings list item
  - Icon, title, subtitle
  - Destructive variant for logout
- **Reusable in:** Profile screen, settings screens

#### Functions to Extract

**12.7 `formatJoinDate` Function**
- **Location:** `utils/date.ts`
- **Functionality:**
  - Formats join date
  - "Joined Jan 2026" format
- **Reusable in:** Profile screen

---

### 13. Therapist Recommendations Screen (`screens/TherapistRecommendationsScreen.tsx`)

#### Current State Analysis
- Modal presentation
- Header text
- Therapist cards list

#### Components to Extract

**13.1 `TherapistCard` Component (Already exists, enhance)**
- **Location:** `components/therapist/TherapistCard.tsx` (existing)
- **Enhancements:**
  - Ensure consistent styling
  - Add loading states
  - Add error handling
- **Reusable in:** Therapist Recommendations, search results

**13.2 `TherapistList` Component**
- **Location:** `components/therapist/TherapistList.tsx`
- **Props:**
  ```typescript
  interface TherapistListProps {
    therapists: Therapist[];
    onTherapistPress: (id: string) => void;
    loading?: boolean;
  }
  ```
- **Functionality:**
  - Renders list of therapist cards
  - Loading and empty states
- **Reusable in:** Therapist Recommendations, search

**13.3 `RecommendationsHeader` Component**
- **Location:** `components/therapist/RecommendationsHeader.tsx`
- **Props:**
  ```typescript
  interface RecommendationsHeaderProps {
    title: string;
    subtitle?: string;
  }
  ```
- **Functionality:**
  - Header text for recommendations
  - Title and subtitle
- **Reusable in:** Therapist Recommendations

---

### 14. Therapist Profile Screen (`screens/TherapistProfileScreen.tsx`)

#### Current State Analysis
- Header with back, title, share
- Profile section
- Stats cards
- About section
- Treatment approaches
- Education
- Location with map
- Bottom action bar

#### Components to Extract

**14.1 `TherapistProfileHeader` Component**
- **Location:** `components/therapist/TherapistProfileHeader.tsx`
- **Props:**
  ```typescript
  interface TherapistProfileHeaderProps {
    onBack: () => void;
    onShare?: () => void;
  }
  ```
- **Functionality:**
  - Header with back and share buttons
  - BlurView backdrop
- **Reusable in:** Therapist Profile screen

**14.2 `TherapistAvatar` Component**
- **Location:** `components/therapist/TherapistAvatar.tsx`
- **Props:**
  ```typescript
  interface TherapistAvatarProps {
    source: string | { uri: string };
    size?: number;
    showVerification?: boolean;
  }
  ```
- **Functionality:**
  - Large circular avatar
  - Verification badge
  - Shadow and styling
- **Reusable in:** Therapist Profile screen

**14.3 `StatCard` Component**
- **Location:** `components/therapist/StatCard.tsx`
- **Props:**
  ```typescript
  interface StatCardProps {
    icon: string;
    value: string;
    label: string;
    iconColor?: string;
  }
  ```
- **Functionality:**
  - Statistics card
  - Icon, value, label
  - Consistent styling
- **Reusable in:** Therapist Profile screen

**14.4 `StatsGrid` Component**
- **Location:** `components/therapist/StatsGrid.tsx`
- **Props:**
  ```typescript
  interface StatsGridProps {
    stats: Stat[];
  }
  ```
- **Functionality:**
  - Grid of stat cards
  - Renders StatCard components
- **Reusable in:** Therapist Profile screen

**14.5 `TreatmentTag` Component**
- **Location:** `components/therapist/TreatmentTag.tsx`
- **Props:**
  ```typescript
  interface TreatmentTagProps {
    approach: string;
  }
  ```
- **Functionality:**
  - Treatment approach tag
  - Primary color styling
- **Reusable in:** Therapist Profile screen

**14.6 `EducationItem` Component**
- **Location:** `components/therapist/EducationItem.tsx`
- **Props:**
  ```typescript
  interface EducationItemProps {
    icon: string;
    title: string;
    details: string;
  }
  ```
- **Functionality:**
  - Education entry
  - Icon, title, details
- **Reusable in:** Therapist Profile screen

**14.7 `LocationMap` Component**
- **Location:** `components/therapist/LocationMap.tsx`
- **Props:**
  ```typescript
  interface LocationMapProps {
    imageUri?: string;
    locationName: string;
    showOnlineBadge?: boolean;
  }
  ```
- **Functionality:**
  - Map display with pin
  - Location name
  - Online badge
- **Reusable in:** Therapist Profile screen

**14.8 `TherapistActionBar` Component**
- **Location:** `components/therapist/TherapistActionBar.tsx`
- **Props:**
  ```typescript
  interface TherapistActionBarProps {
    onMessage: () => void;
    onBookConsultation: () => void;
  }
  ```
- **Functionality:**
  - Bottom action bar
  - Message and Book buttons
  - BlurView backdrop
- **Reusable in:** Therapist Profile screen

---

### 15. Payment Screen (`screens/PaymentScreen.tsx`)

#### Current State Analysis
- Header with drag handle, secure checkout
- Price display
- Session details card
- Payment method buttons
- Crypto options
- Add payment method
- Footer with confirm button

#### Components to Extract

**15.1 `PaymentHeader` Component**
- **Location:** `components/payment/PaymentHeader.tsx`
- **Props:**
  ```typescript
  interface PaymentHeaderProps {
    showDragHandle?: boolean;
  }
  ```
- **Functionality:**
  - Header with drag handle
  - Secure checkout badge
  - BlurView backdrop
- **Reusable in:** Payment screen

**15.2 `PriceDisplay` Component**
- **Location:** `components/payment/PriceDisplay.tsx`
- **Props:**
  ```typescript
  interface PriceDisplayProps {
    amount: number;
    currency?: string;
    label?: string;
  }
  ```
- **Functionality:**
  - Large price display
  - Label and amount
  - Consistent typography
- **Reusable in:** Payment screen

**15.3 `SessionDetailsCard` Component**
- **Location:** `components/payment/SessionDetailsCard.tsx`
- **Props:**
  ```typescript
  interface SessionDetailsCardProps {
    therapist: {
      name: string;
      avatarUri: string;
      isOnline: boolean;
    };
    session: {
      date: string;
      time: string;
      duration: string;
    };
  }
  ```
- **Functionality:**
  - Session information card
  - Therapist avatar with online indicator
  - Date and time display
- **Reusable in:** Payment screen

**15.4 `PaymentMethodButton` Component**
- **Location:** `components/payment/PaymentMethodButton.tsx`
- **Props:**
  ```typescript
  interface PaymentMethodButtonProps {
    provider: 'apple' | 'google' | 'card';
    onPress: () => void;
  }
  ```
- **Functionality:**
  - Payment method button
  - Apple Pay, Google Pay, Card styling
  - Consistent button appearance
- **Reusable in:** Payment screen

**15.5 `CryptoOption` Component**
- **Location:** `components/payment/CryptoOption.tsx`
- **Props:**
  ```typescript
  interface CryptoOptionProps {
    id: string;
    name: string;
    amount: string;
    icon: string;
    color: string;
    isSelected: boolean;
    onPress: () => void;
  }
  ```
- **Functionality:**
  - Crypto payment option
  - Radio button selection
  - Selected state styling
- **Reusable in:** Payment screen

**15.6 `LiveRatesBadge` Component**
- **Location:** `components/payment/LiveRatesBadge.tsx`
- **Props:**
  ```typescript
  interface LiveRatesBadgeProps {
    showPulse?: boolean;
  }
  ```
- **Functionality:**
  - Live rates indicator
  - Pulsing dot animation
  - Badge styling
- **Reusable in:** Payment screen

**15.7 `SecurityBadge` Component**
- **Location:** `components/payment/SecurityBadge.tsx`
- **Props:**
  ```typescript
  interface SecurityBadgeProps {
    text: string;
  }
  ```
- **Functionality:**
  - Security information badge
  - Icon and text
  - Consistent styling
- **Reusable in:** Payment screen footer

---

## Shared Component Library

### Base UI Components (Already exist, enhance)

**1. `Button` Component** (`components/ui/Button.tsx`)
- **Enhancements:**
  - Add more variants (outline, ghost, destructive)
  - Add loading state
  - Add icon support (left, right, both)
  - Add size variants (small, medium, large)

**2. `Input` Component** (`components/ui/Input.tsx`)
- **Enhancements:**
  - Add error state
  - Add helper text
  - Add left/right icons
  - Add password visibility toggle

**3. `TextArea` Component** (`components/ui/TextArea.tsx`)
- **Enhancements:**
  - Add character counter
  - Add auto-resize
  - Add placeholder animation

**4. `Card` Component** (`components/ui/Card.tsx`)
- **Enhancements:**
  - Add variants (glass, solid, outline)
  - Add shadow presets
  - Add padding variants

**5. `Icon` Component** (`components/ui/Icon.tsx`)
- **Enhancements:**
  - Complete icon mapping
  - Add size presets
  - Add color presets

### New Base Components to Create

**6. `Badge` Component**
- **Location:** `components/ui/Badge.tsx`
- **Props:**
  ```typescript
  interface BadgeProps {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'small' | 'medium' | 'large';
    icon?: string;
  }
  ```
- **Reusable in:** Multiple screens

**7. `Chip` Component**
- **Location:** `components/ui/Chip.tsx`
- **Props:**
  ```typescript
  interface ChipProps {
    label: string;
    icon?: string;
    isSelected?: boolean;
    onPress?: () => void;
    variant?: 'default' | 'outline';
  }
  ```
- **Reusable in:** Mood selection, filters, tags

**8. `Slider` Component** (Wrapper around @react-native-community/slider)
- **Location:** `components/ui/Slider.tsx`
- **Props:**
  ```typescript
  interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    minimumTrackColor?: string;
    maximumTrackColor?: string;
    thumbColor?: string;
    showLabels?: boolean;
  }
  ```
- **Reusable in:** Settings, journal intensity

**9. `ProgressBar` Component**
- **Location:** `components/ui/ProgressBar.tsx`
- **Props:**
  ```typescript
  interface ProgressBarProps {
    progress: number; // 0-100
    height?: number;
    color?: string;
    showGradient?: boolean;
    animated?: boolean;
  }
  ```
- **Reusable in:** Breathing progress, loading states

**10. `Avatar` Component** (Enhance existing)
- **Location:** `components/ui/Avatar.tsx` (existing)
- **Enhancements:**
  - Add size variants
  - Add online indicator
  - Add badge support
  - Add gradient border option

---

## Utility Functions

### Date Utilities (`utils/date.ts`)

**1. `formatTime(seconds: number): string`**
- Formats seconds to MM:SS
- Used in: Box Breathing, timers

**2. `formatChatDate(date: Date): string`**
- Formats date for chat: "Today, 10:42 AM"
- Used in: Chat screen

**3. `formatNotificationTime(date: Date): string`**
- Formats time: "2 hours ago", "Yesterday"
- Used in: Notifications

**4. `formatCalendarDate(month: number, year: number): string`**
- Formats: "October 2023"
- Used in: Mood History calendar

**5. `formatJoinDate(date: Date): string`**
- Formats: "Joined Jan 2026"
- Used in: Profile

**6. `getCalendarData(month: number, year: number): CalendarDay[]`**
- Generates calendar days array
- Includes previous/next month days
- Used in: Mood History

**7. `isToday(date: Date): boolean`**
- Checks if date is today
- Used in: Calendar, date comparisons

**8. `isYesterday(date: Date): boolean`**
- Checks if date is yesterday
- Used in: Notifications grouping

### Color Utilities (`utils/color.ts`)

**1. `hexToRgba(hex: string, opacity: number): string`**
- Converts hex to rgba
- Used in: Multiple components

**2. `getIntensityColor(value: number): string`**
- Returns color based on intensity (1-10)
- Cool blues to hot reds
- Used in: Mood Journal intensity slider

**3. `getMoodColor(mood: string): string`**
- Returns color for mood type
- Used in: Mood components, calendar

**4. `interpolateColor(color1: string, color2: string, factor: number): string`**
- Interpolates between two colors
- Used in: Gradients, animations

### Breathing Utilities (`utils/breathing.ts`)

**1. `getPhaseDuration(phase: BreathingPhase, settings: Settings): number`**
- Calculates phase duration from settings
- Returns milliseconds
- Used in: Box Breathing screen

**2. `getPhaseIndex(phase: BreathingPhase): number`**
- Returns index for phase (0-3)
- Used in: Box Breathing animations

**3. `getNextPhase(current: BreathingPhase): BreathingPhase`**
- Returns next phase in cycle
- Used in: Box Breathing logic

**4. `calculateTotalTime(settings: Settings): number`**
- Calculates total exercise time
- Used in: Box Breathing, progress

### Mood Utilities (`utils/mood.ts`)

**1. `getMoodIcon(mood: string): string`**
- Returns icon name for mood
- Used in: Mood selection, display

**2. `getMoodLabel(mood: string): string`**
- Returns display label for mood
- Used in: Mood components

**3. `validateMoodEntry(entry: MoodEntry): boolean`**
- Validates mood journal entry
- Used in: Mood Journal save

### Gratitude Utilities (`utils/gratitude.ts`)

**1. `getGratitudePlaceholders(): string[]`**
- Returns placeholder texts
- Used in: Gratitude screen

**2. `calculateStreak(entries: GratitudeEntry[]): number`**
- Calculates current streak
- Used in: Gratitude screen, profile

**3. `validateGratitudeEntry(entry: GratitudeEntry): boolean`**
- Validates gratitude entry
- Used in: Gratitude save

### Notification Utilities (`utils/notifications.ts`)

**1. `groupNotificationsByDate(notifications: Notification[]): NotificationGroup[]`**
- Groups by Today, Yesterday, Older
- Used in: Notifications screen

**2. `markAsRead(notificationId: string): void`**
- Marks notification as read
- Used in: Notifications

**3. `clearAllToday(): void`**
- Clears all today's notifications
- Used in: Notifications

### Chart Utilities (`utils/charts.ts`)

**1. `generateBarChartData(data: number[]): BarChartData[]`**
- Processes data for bar chart
- Calculates heights, positions
- Used in: Gratitude History, Mood History

**2. `generateLineChartData(data: Point[]): string`**
- Generates SVG path for line chart
- Used in: Mood History graph

**3. `normalizeChartData(data: number[], maxHeight: number): number[]`**
- Normalizes data to fit chart height
- Used in: Chart components

### Animation Utilities (`utils/animations.ts`)

**1. `createPulseAnimation(duration?: number): AnimatedStyle`**
- Creates pulse animation style
- Used in: Multiple components

**2. `createFadeAnimation(duration?: number): AnimatedStyle`**
- Creates fade animation style
- Used in: Multiple components

**3. `interpolateValue(value: number, inputRange: number[], outputRange: number[]): number`**
- Interpolates animation value
- Used in: Reanimated animations

---

## Implementation Order

### Phase 1: Foundation (Week 1)
1. Create shared utility functions
2. Enhance base UI components (Button, Input, Card, etc.)
3. Create new base components (Badge, Chip, Slider, ProgressBar)
4. Create GradientBackground component
5. Create ScreenHeader component

### Phase 2: Common Components (Week 2)
1. Extract VideoBackground
2. Extract OAuthButton
3. Extract GlassControlPanel
4. Extract SettingsHeader
5. Extract FeatureHeader

### Phase 3: Home & Navigation (Week 3)
1. Extract PrimaryActionCard
2. Extract FeatureActionButton
3. Extract RecommendationCard
4. Extract RecommendationsCarousel
5. Extract GreetingText

### Phase 4: Chat & Voice (Week 4)
1. Extract DateSeparator
2. Extract MessageList
3. Extract AnimatedBlob
4. Extract VisualizerBars
5. Extract LiveSessionBadge

### Phase 5: Breathing Exercises (Week 5)
1. Extract BreathingBox
2. Extract BreathingOrb
3. Extract BreathingControls
4. Extract BreathingProgress
5. Extract ActivePathIndicator
6. Extract DurationSlider
7. Extract MusicOptionButton
8. Create useBreathingAnimation hook
9. Create useBreathingCycle hook

### Phase 6: Journal & Mood (Week 6)
1. Extract JournalHeader
2. Extract AIPromptCard
3. Extract MoodChip
4. Extract MoodChipsList
5. Extract IntensitySlider
6. Extract IntensitySliderCard
7. Extract MoodCalendar
8. Extract MoodLegend
9. Extract MoodInsightsCard
10. Extract MoodEntryCard

### Phase 7: Gratitude (Week 7)
1. Extract GratitudeHeader
2. Extract StreakBadge
3. Extract GratitudeInputField
4. Extract PhotoUploadButton
5. Extract InspirationalQuote
6. Extract GratitudeInsightsCard
7. Extract GratitudeEntryCard
8. Extract BarChart

### Phase 8: Notifications & Profile (Week 8)
1. Extract NotificationsHeader
2. Extract NotificationCard
3. Extract NotificationSection
4. Extract UnreadIndicator
5. Extract ProfileHeader
6. Extract ProfileAvatar
7. Extract JourneyCard
8. Extract AchievementCard
9. Extract AchievementsGrid
10. Extract SettingsItem

### Phase 9: Therapist & Payment (Week 9)
1. Enhance TherapistCard
2. Extract TherapistList
3. Extract RecommendationsHeader
4. Extract TherapistProfileHeader
5. Extract TherapistAvatar
6. Extract StatCard
7. Extract StatsGrid
8. Extract TreatmentTag
9. Extract EducationItem
10. Extract LocationMap
11. Extract TherapistActionBar
12. Extract PaymentHeader
13. Extract PriceDisplay
14. Extract SessionDetailsCard
15. Extract PaymentMethodButton
16. Extract CryptoOption
17. Extract LiveRatesBadge
18. Extract SecurityBadge

### Phase 10: Integration & Testing (Week 10)
1. Update all screens to use new components
2. Remove duplicate code
3. Test all screens
4. Fix any breaking changes
5. Update documentation
6. Code review and optimization

---

## Best Practices

### Component Design
1. **Props Interface:** Always define TypeScript interfaces for props
2. **Default Props:** Use default parameters for optional props
3. **Error Boundaries:** Wrap components in error boundaries where appropriate
4. **Loading States:** Always handle loading and error states
5. **Accessibility:** Add accessibility labels and hints

### Code Organization
1. **File Structure:** One component per file
2. **Exports:** Use named exports for components
3. **Imports:** Group imports (React, third-party, local, types)
4. **Comments:** Add JSDoc comments for complex components

### Performance
1. **Memoization:** Use React.memo for expensive components
2. **useCallback:** Memoize callbacks passed to children
3. **useMemo:** Memoize expensive calculations
4. **Lazy Loading:** Lazy load heavy components

### Testing
1. **Unit Tests:** Test each component in isolation
2. **Integration Tests:** Test component interactions
3. **Snapshot Tests:** Use for UI regression testing
4. **Accessibility Tests:** Test with screen readers

---

## Success Metrics

- **Code Reduction:** Target 30-40% reduction in total lines of code
- **Reusability:** 80% of UI elements should be reusable components
- **Maintainability:** Average component size <200 lines
- **Test Coverage:** >70% component test coverage
- **Performance:** No regression in render times
- **Consistency:** 100% UI consistency across screens

---

## Notes

- This is a living document and should be updated as refactoring progresses
- Components should be extracted incrementally, not all at once
- Always test after extracting each component
- Keep the original screen working while extracting components
- Use feature flags if needed for gradual rollout

---

**END OF DOCUMENT**
