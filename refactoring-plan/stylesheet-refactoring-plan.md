# Stylesheet Refactoring Plan
## Haven - Centralizing Styles and Creating a Design System

**Date:** January 2026  
**Purpose:** Systematically refactor all StyleSheet definitions into a centralized design system, extract common style patterns, and create reusable style utilities to ensure consistency and maintainability.

---

## Table of Contents
1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Design System Architecture](#design-system-architecture)
4. [Style Constants](#style-constants)
5. [Common Style Patterns](#common-style-patterns)
6. [Screen-by-Screen Refactoring](#screen-by-screen-refactoring)
7. [Implementation Order](#implementation-order)

---

## Overview

This document outlines a detailed plan to refactor all StyleSheet definitions across the Haven app into a centralized, reusable design system. The goals are:
- Create a single source of truth for design tokens
- Eliminate style duplication
- Ensure visual consistency
- Improve maintainability
- Enable easy theming
- Follow React Native best practices

---

## Current State Analysis

### Issues Identified
1. **Duplicated Colors:** Same hex colors repeated across multiple files
2. **Inconsistent Spacing:** Different padding/margin values for similar elements
3. **Repeated Shadow Definitions:** Same shadow styles duplicated
4. **Border Radius Inconsistency:** Different values for similar elements
5. **Typography Not Centralized:** Font sizes, weights scattered
6. **Gradient Definitions Repeated:** Same gradient colors in multiple places
7. **Blob Styles Duplicated:** Background blob styles repeated

### Statistics
- **Total StyleSheet.create calls:** ~15 screens
- **Estimated duplicate styles:** ~40-50%
- **Color definitions:** ~30+ unique colors (many duplicates)
- **Border radius values:** 8+ different values
- **Shadow definitions:** 20+ similar shadow styles

---

## Design System Architecture

### File Structure
```
styles/
  ├── theme.ts              # Design tokens (colors, spacing, typography)
  ├── shadows.ts            # Shadow presets
  ├── gradients.ts          # Gradient definitions
  ├── borders.ts            # Border radius presets
  ├── spacing.ts            # Spacing scale
  ├── typography.ts         # Typography scale
  ├── animations.ts         # Animation constants
  ├── components/           # Component-specific styles
  │   ├── buttons.ts
  │   ├── cards.ts
  │   ├── inputs.ts
  │   ├── headers.ts
  │   └── modals.ts
  └── screens/              # Screen-specific style utilities
      ├── home.ts
      ├── chat.ts
      ├── breathing.ts
      └── ...
```

---

## Style Constants

### 1. Theme (`styles/theme.ts`)

**Colors:**
```typescript
export const colors = {
  // Primary Colors
  primary: '#19b3e6',
  primaryDark: '#0ea5e9',
  primaryLight: '#38bdf8',
  
  // Background Colors
  backgroundDark: '#111d21',
  backgroundLight: '#ffffff',
  surfaceDark: '#1a2c32',
  surfaceLight: '#f8fafc',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#93bac8',
  textTertiary: '#6b7280',
  textMuted: '#9ca3af',
  
  // Accent Colors
  secondaryGreen: '#34d399',
  secondaryPurple: '#8b5cf6',
  secondaryOrange: '#f97316',
  mint: '#4fd1c5',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#19b3e6',
  
  // Border Colors
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderMedium: 'rgba(31, 41, 55, 0.8)',
  borderDark: 'rgba(55, 65, 81, 0.8)',
  
  // Overlay Colors
  overlayDark: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  
  // Gradient Colors (for reference)
  gradientStart: 'rgba(30, 41, 59, 0.4)',
  gradientEnd: 'rgba(15, 23, 42, 0.25)',
  
  // Mood Colors
  moodHappy: '#fbbf24',
  moodCalm: '#34d399',
  moodAnxious: '#f59e0b',
  moodSad: '#3b82f6',
  moodAngry: '#ef4444',
  
  // Gratitude Colors
  gratitudeGold: '#f59e0b',
  gratitudeAmber: '#fbbf24',
} as const;
```

**Spacing Scale:**
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;
```

**Border Radius:**
```typescript
export const borderRadius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  full: 9999,
  
  // Semantic names
  card: 24,
  button: 40,
  input: 24,
  modal: 40,
  badge: 9999,
  avatar: 9999,
} as const;
```

**Typography:**
```typescript
export const typography = {
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 30,
    '5xl': 36,
    '6xl': 48,
    '7xl': 80,
  },
  
  // Font Weights
  fontWeight: {
    light: '200',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 20,
    normal: 24,
    relaxed: 28,
    loose: 36,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.2,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;
```

### 2. Shadows (`styles/shadows.ts`)

```typescript
export const shadows = {
  // Elevation levels
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Colored shadows
  primary: {
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  primaryGlow: {
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 10,
  },
  
  // Text shadows
  text: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  textStrong: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
} as const;
```

### 3. Gradients (`styles/gradients.ts`)

```typescript
export const gradients = {
  // Background gradients
  backgroundDark: {
    colors: [
      'rgba(30, 41, 59, 0.4)',
      'rgba(15, 23, 42, 0.25)',
      'rgba(17, 29, 33, 0.15)',
      'rgba(17, 29, 33, 0.05)',
      'transparent',
    ],
    locations: [0, 0.2, 0.5, 0.8, 1],
  },
  
  backgroundLight: {
    colors: ['rgba(255, 255, 255, 0.95)', 'rgba(249, 250, 251, 0.85)'],
    locations: [0, 1],
  },
  
  // Bottom sheet gradients
  bottomSheetDark: {
    colors: [
      'rgba(17, 29, 33, 0.95)',
      'rgba(17, 29, 33, 0.92)',
      'rgba(15, 23, 42, 0.90)',
      'rgba(15, 23, 42, 0.88)',
    ],
    locations: [0, 0.3, 0.7, 1],
  },
  
  // Card gradients
  cardOverlay: {
    colors: ['rgba(25, 179, 230, 0.1)', 'rgba(17, 29, 33, 0.8)'],
    locations: [0, 1],
  },
  
  // Progress bar gradients
  progress: {
    colors: ['#19b3e6', '#34d399'],
    locations: [0, 1],
  },
  
  // Footer gradients
  footerFade: {
    colors: ['#111d21', 'rgba(17, 29, 33, 0.8)', 'transparent'],
    locations: [0, 0.5, 1],
  },
} as const;
```

### 4. Background Blobs (`styles/blobs.ts`)

```typescript
export const blobStyles = {
  // Blob positions and sizes
  topLeft: {
    position: 'absolute' as const,
    top: '-10%',
    left: '-5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.4,
  },
  
  bottomRight: {
    position: 'absolute' as const,
    bottom: '20%',
    right: '-5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.4,
  },
  
  topRight: {
    position: 'absolute' as const,
    top: '40%',
    right: '10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.3,
  },
  
  // Blob colors
  primary: 'rgba(25, 179, 230, 0.1)',
  purple: 'rgba(88, 28, 135, 0.15)',
  mint: 'rgba(79, 209, 197, 0.08)',
  amber: 'rgba(245, 158, 11, 0.1)',
} as const;
```

---

## Common Style Patterns

### 1. Button Styles (`styles/components/buttons.ts`)

```typescript
import { StyleSheet } from 'react-native';
import { colors, borderRadius, shadows, spacing, typography } from '../theme';

export const buttonStyles = StyleSheet.create({
  // Primary Button
  primary: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  
  primaryText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  
  // Secondary Button
  secondary: {
    height: 56,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  
  // Outline Button
  outline: {
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  outlineText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  
  // Icon Button
  icon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  
  // Small Button
  small: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  
  smallText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
```

### 2. Card Styles (`styles/components/cards.ts`)

```typescript
import { StyleSheet } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../theme';

export const cardStyles = StyleSheet.create({
  // Base Card
  base: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  
  // Glass Card (with blur)
  glass: {
    backgroundColor: 'rgba(26, 44, 50, 0.6)',
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },
  
  // Recommendation Card
  recommendation: {
    width: 240,
    borderRadius: borderRadius.md,
  },
  
  // Session Card
  session: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    ...shadows.sm,
  },
  
  // Stat Card
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    ...shadows.sm,
  },
});
```

### 3. Input Styles (`styles/components/inputs.ts`)

```typescript
import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

export const inputStyles = StyleSheet.create({
  // Base Input
  base: {
    width: '100%',
    minHeight: 100,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    color: colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.input,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: spacing.lg,
    ...shadows.sm,
  },
  
  // Focused Input
  focused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    ...shadows.primary,
  },
  
  // Text Area
  textArea: {
    minHeight: 200,
    textAlignVertical: 'top',
    paddingTop: spacing.lg,
  },
  
  // Number Input
  number: {
    height: 56,
    textAlign: 'center',
    fontSize: typography.fontSize['2xl'],
  },
});
```

### 4. Header Styles (`styles/components/headers.ts`)

```typescript
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const headerStyles = StyleSheet.create({
  // Screen Header
  screen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  
  // Modal Header
  modal: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(17, 29, 33, 0.95)',
  },
  
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  // Section Header
  section: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
```

### 5. Modal Styles (`styles/components/modals.ts`)

```typescript
import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

export const modalStyles = StyleSheet.create({
  // Bottom Sheet Container
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '35%',
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.xl,
    overflow: 'hidden',
  },
  
  // Drag Handle
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
    marginBottom: spacing['3xl'],
  },
  
  // Modal Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
});
```

---

## Screen-by-Screen Refactoring

### 1. Welcome Screen

**Current Issues:**
- Hardcoded colors in gradient
- Hardcoded border radius
- Duplicated button styles

**Refactored:**
```typescript
// styles/screens/welcome.ts
import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows, gradients } from '../theme';
import { buttonStyles } from '../components/buttons';

export const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '70%',
    overflow: 'hidden',
  },
  
  logoContainer: {
    width: 112,
    height: 112,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  
  title: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tighter,
    color: colors.textPrimary,
    textAlign: 'center',
    ...shadows.textStrong,
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
    textAlign: 'center',
    ...shadows.text,
  },
  
  bottomSheet: {
    ...modalStyles.bottomSheet,
    height: '35%',
  },
  
  appleButton: {
    ...buttonStyles.primary,
    backgroundColor: colors.backgroundLight,
    borderColor: colors.borderLight,
  },
  
  appleButtonText: {
    ...buttonStyles.primaryText,
    color: colors.backgroundDark,
  },
  
  googleButton: {
    ...buttonStyles.secondary,
  },
  
  googleButtonText: {
    ...buttonStyles.secondaryText,
  },
});
```

### 2. Home Screen

**Current Issues:**
- Duplicated gradient definition
- Hardcoded blob styles
- Repeated card styles

**Refactored:**
```typescript
// styles/screens/home.ts
import { StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows, gradients, blobStyles } from '../theme';
import { cardStyles } from '../components/cards';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    justifyContent: 'space-between',
  },
  
  headerTitle: {
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },
  
  greetingText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.loose,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xl,
    textAlign: 'left',
    color: colors.textPrimary,
    ...shadows.text,
  },
  
  cardContainer: {
    flex: 1,
    aspectRatio: 4 / 5,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  
  actionButtonDark: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  
  backgroundBlob1: {
    ...blobStyles.topLeft,
    backgroundColor: blobStyles.primary,
  },
  
  backgroundBlob2: {
    ...blobStyles.bottomRight,
    backgroundColor: blobStyles.purple,
  },
  
  backgroundBlob3: {
    ...blobStyles.topRight,
    backgroundColor: blobStyles.mint,
  },
});
```

### 3. Chat Screen

**Current Issues:**
- Duplicated background gradient
- Hardcoded blob styles
- Repeated date badge styles

**Refactored:**
```typescript
// styles/screens/chat.ts
import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows, gradients, blobStyles } from '../theme';

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  
  dateBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderMedium,
  },
  
  dateText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
  },
  
  backgroundBlob1: {
    ...blobStyles.topLeft,
    backgroundColor: 'rgba(25, 179, 230, 0.08)',
  },
  
  backgroundBlob2: {
    ...blobStyles.bottomRight,
    backgroundColor: 'rgba(88, 28, 135, 0.12)',
  },
});
```

### 4. Box Breathing Screen

**Current Issues:**
- Hardcoded box size calculations
- Repeated shadow definitions
- Duplicated label styles

**Refactored:**
```typescript
// styles/screens/breathing.ts
import { StyleSheet, Dimensions } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const BOX_SIZE = Math.min(380, SCREEN_WIDTH - 100);
export const BOX_RADIUS = 32;
export const DOT_SIZE = 12;

export const breathingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  
  boxBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BOX_RADIUS,
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.primaryGlow,
  },
  
  activePathTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: BOX_RADIUS,
    borderTopRightRadius: BOX_RADIUS,
    backgroundColor: colors.primary,
    ...shadows.primary,
  },
  
  label: {
    position: 'absolute',
    fontSize: typography.fontSize.sm,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.textTertiary,
  },
  
  phaseText: {
    fontSize: typography.fontSize.xl,
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  
  count: {
    fontSize: typography.fontSize['7xl'],
    fontWeight: typography.fontWeight.light,
    letterSpacing: typography.letterSpacing.tighter,
    color: colors.textPrimary,
  },
});
```

### 5. Mood Journal Screen

**Current Issues:**
- Duplicated card styles
- Hardcoded intensity color logic
- Repeated slider styles

**Refactored:**
```typescript
// styles/screens/journal.ts
import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../theme';
import { cardStyles, inputStyles } from '../components';

export const journalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  
  aiCard: {
    ...cardStyles.base,
    marginBottom: spacing['2xl'],
  },
  
  journalInput: {
    ...inputStyles.base,
    ...inputStyles.textArea,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  
  moodChip: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  
  moodChipActive: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  
  moodChipInactive: {
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  
  intensityCard: {
    ...cardStyles.base,
    marginBottom: spacing['3xl'],
  },
});
```

---

## Implementation Order

### Phase 1: Foundation (Week 1)
1. Create `styles/theme.ts` with all design tokens
2. Create `styles/shadows.ts` with shadow presets
3. Create `styles/gradients.ts` with gradient definitions
4. Create `styles/blobs.ts` with blob styles
5. Create `styles/spacing.ts`, `styles/borders.ts`, `styles/typography.ts`

### Phase 2: Component Styles (Week 2)
1. Create `styles/components/buttons.ts`
2. Create `styles/components/cards.ts`
3. Create `styles/components/inputs.ts`
4. Create `styles/components/headers.ts`
5. Create `styles/components/modals.ts`

### Phase 3: Screen Styles (Week 3-4)
1. Refactor Welcome Screen styles
2. Refactor Home Screen styles
3. Refactor Chat Screen styles
4. Refactor Voice Screen styles
5. Refactor Box Breathing Screen styles

### Phase 4: Feature Screens (Week 5-6)
1. Refactor Mood Journal Screen styles
2. Refactor Mood History Screen styles
3. Refactor Gratitude Screen styles
4. Refactor Gratitude History Screen styles
5. Refactor Box Breathing Settings Screen styles

### Phase 5: Remaining Screens (Week 7-8)
1. Refactor Notifications Screen styles
2. Refactor Profile Screen styles
3. Refactor Therapist Recommendations Screen styles
4. Refactor Therapist Profile Screen styles
5. Refactor Payment Screen styles

### Phase 6: Integration & Cleanup (Week 9-10)
1. Update all screen files to use new style imports
2. Remove old StyleSheet definitions
3. Test all screens for visual consistency
4. Fix any style regressions
5. Update documentation
6. Code review and optimization

---

## Style Utility Functions

### Color Utilities (`styles/utils/color.ts`)

```typescript
import { colors } from '../theme';

/**
 * Converts hex color to rgba
 */
export const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Gets intensity color (cool to hot)
 */
export const getIntensityColor = (value: number): string => {
  const colorStops = [
    '#19b3e6', '#22d3ee', '#34d399', '#65a30d', '#84cc16',
    '#eab308', '#fbbf24', '#fb923c', '#f97316', '#ef4444',
  ];
  const clamped = Math.max(1, Math.min(10, Math.round(value)));
  return colorStops[clamped - 1];
};

/**
 * Gets mood color
 */
export const getMoodColor = (mood: string): string => {
  const moodColors: Record<string, string> = {
    happy: colors.moodHappy,
    calm: colors.moodCalm,
    anxious: colors.moodAnxious,
    sad: colors.moodSad,
    angry: colors.moodAngry,
  };
  return moodColors[mood] || colors.textSecondary;
};
```

### Spacing Utilities (`styles/utils/spacing.ts`)

```typescript
import { spacing } from '../theme';

/**
 * Creates padding object
 */
export const padding = {
  xs: { padding: spacing.xs },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
  xl: { padding: spacing.xl },
  horizontal: (value: keyof typeof spacing) => ({
    paddingHorizontal: spacing[value],
  }),
  vertical: (value: keyof typeof spacing) => ({
    paddingVertical: spacing[value],
  }),
  top: (value: keyof typeof spacing) => ({
    paddingTop: spacing[value],
  }),
  bottom: (value: keyof typeof spacing) => ({
    paddingBottom: spacing[value],
  }),
};

/**
 * Creates margin object
 */
export const margin = {
  xs: { margin: spacing.xs },
  sm: { margin: spacing.sm },
  md: { margin: spacing.md },
  lg: { margin: spacing.lg },
  xl: { margin: spacing.xl },
  horizontal: (value: keyof typeof spacing) => ({
    marginHorizontal: spacing[value],
  }),
  vertical: (value: keyof typeof spacing) => ({
    marginVertical: spacing[value],
  }),
  top: (value: keyof typeof spacing) => ({
    marginTop: spacing[value],
  }),
  bottom: (value: keyof typeof spacing) => ({
    marginBottom: spacing[value],
  }),
};
```

---

## Best Practices

### 1. Import Organization
```typescript
// Always import in this order:
// 1. React Native
import { StyleSheet, View } from 'react-native';

// 2. Third-party
import { LinearGradient } from 'expo-linear-gradient';

// 3. Local components
import { Button } from '@/components/ui/Button';

// 4. Style imports
import { colors, spacing, typography } from '@/styles/theme';
import { buttonStyles } from '@/styles/components/buttons';
import { screenStyles } from '@/styles/screens/home';

// 5. Types
import type { HomeScreenProps } from './types';
```

### 2. Style Composition
```typescript
// ✅ Good: Compose styles
const styles = StyleSheet.create({
  button: {
    ...buttonStyles.primary,
    marginTop: spacing.lg,
  },
});

// ❌ Bad: Duplicate styles
const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: '#19b3e6',
    // ... duplicate code
  },
});
```

### 3. Conditional Styles
```typescript
// ✅ Good: Use theme values
const dynamicStyle = {
  backgroundColor: isActive ? colors.primary : colors.surfaceDark,
  borderColor: isActive ? colors.primary : colors.borderDark,
};

// ❌ Bad: Hardcode values
const dynamicStyle = {
  backgroundColor: isActive ? '#19b3e6' : '#1a2c32',
};
```

### 4. Style Naming
```typescript
// ✅ Good: Semantic names
container, header, content, footer, button, card

// ❌ Bad: Generic names
view1, view2, style1, style2
```

---

## Success Metrics

- **Style Reduction:** 50-60% reduction in StyleSheet code
- **Consistency:** 100% use of theme tokens
- **Maintainability:** Single source of truth for all design tokens
- **Performance:** No regression in render performance
- **Theming:** Easy to implement dark/light mode switching
- **Documentation:** Complete style guide documentation

---

## Notes

- This is a living document and should be updated as refactoring progresses
- Styles should be refactored incrementally, screen by screen
- Always test visual appearance after refactoring
- Keep original styles until new ones are verified
- Use TypeScript for type safety in style definitions

---

**END OF DOCUMENT**
