# Product Requirements Document (PRD)
## Haven - AI-Powered Therapy App

---

## 1. Product Overview

**Product Name:** Haven  
**Version:** 1.0  
**Date:** January 12, 2026  
**Product Type:** AI-Powered Mental Health & Therapy Platform

### 1.1 Purpose
Haven is an AI-powered therapy application that provides accessible mental health support through conversational AI, while seamlessly connecting users to human therapists when needed. The app combines AI-driven chat and voice therapy sessions with wellness resources and professional therapist matching.

### 1.2 Goals
- Provide immediate, 24/7 mental health support through AI
- Lower barriers to mental health care access
- Intelligently escalate users to human therapists when appropriate
- Offer holistic wellness tools and resources
- Create a safe, judgment-free space for mental health support

---

## 2. User Authentication

### 2.1 OAuth Login
**Feature ID:** AUTH-001

**Description:**  
Users can authenticate using OAuth providers for seamless, secure access.

**Welcome Screen Interface:**
- Video background (therapy/wellness themed)
- Gradient overlay (mint, primary, slate colors)
- Dark overlay for contrast
- Logo container with:
  - Circular logo image
  - Gradient overlay
  - Shadow and border styling
- Title: "Haven"
- Subtitle: "Your safe space for mental health"
- Bottom sheet with:
  - Dark gradient background (homogenous with VoiceScreen)
  - BlurView backdrop for glassmorphism
  - Drag handle
  - Apple Sign-In button (white background, black text)
  - Google Sign-In button (dark teal background, white text)
  - Terms and Privacy Policy text with links
  - Border radius: 40px (top corners)

**Requirements:**
- Support Google OAuth 2.0
- No traditional email/password registration required
- Session management with secure token handling
- Auto-login for returning users
- Video background playback (looped, muted)
- Smooth animations (logo fade-in)

**User Flow:**
1. User opens Haven app
2. Welcome screen displays with video background
3. Logo and title animate in
4. Bottom sheet slides up with OAuth options
5. User sees "Continue with Apple" and "Continue with Google" buttons
6. User selects provider
7. OAuth flow completes
8. User redirected to main screen

**Technical Specifications:**
- Use OAuth 2.0 protocol
- Store user tokens securely (encrypted storage)
- Implement token refresh mechanism
- HTTPS only for all authentication requests
- Session timeout: 30 days
- Video playback using expo-video
- Local video asset loading using expo-asset
- BlurView for bottom sheet backdrop
- LinearGradient for overlays and backgrounds

**Acceptance Criteria:**
- User can successfully authenticate with Google
- User can successfully authenticate with Apple
- Authentication persists across app restarts
- Failed authentication shows clear error messages
- Compliance with HIPAA privacy requirements
- Video background plays smoothly
- Bottom sheet has proper gradient and blur effects

---

## 3. Main Interface (Home Screen)

### 3.1 Unified Home Screen
**Feature ID:** UI-001

**Description:**  
Single-screen interface that serves as the hub for all AI therapy interactions and wellness resources.

**Layout Components:**

#### 3.1.1 Header Section
- Menu button (left)
- "Haven" title (center)
- Notifications button (right) - opens notifications modal
- Profile button accessible via menu or direct action

#### 3.1.2 Greeting Section
- Personalized greeting: "Hello, [Name]. How are you feeling today?"
- Large, bold typography with text shadow
- Dark gradient background with ambient blobs

#### 3.1.3 Primary Action Cards
- **Chat with Haven Card:**
  - Image background with gradient overlay
  - Icon container with BlurView (chat bubble icon)
  - Title and subtitle
  - Rounded-full icon container
  - Shadow and styling
  
- **Start Voice Session Card:**
  - Image background with gradient overlay
  - Icon container with BlurView (microphone icon)
  - Title and subtitle
  - Rounded-full icon container
  - Shadow and styling

#### 3.1.4 Feature List Section
- **Mood Journal:**
  - Action button with icon, title, subtitle
  - Orange accent color
  - Chevron right icon
  
- **Wellness Exercises:**
  - Action button with icon, title, subtitle
  - Green accent color
  - Chevron right icon
  
- **Your Profile:**
  - Action button with icon, title, subtitle
  - Purple accent color
  - Chevron right icon

#### 3.1.5 Wellness Recommendations Section
- Section title: "Recommended for You"
- Horizontal scrollable carousel
- Recommendation cards showing:
  - **Guided Meditation** (audio, 10 min)
  - **Managing Anxiety** (article)
  - **Box Breathing** (video)
  - **Gratitude Practice** (practice type)
- Each card displays:
  - Image thumbnail
  - Title
  - Type icon (headphones, videocam, article, favorite)
  - Duration/type label
  - Play button overlay for audio/video
- Card width: 240px
- Border radius: 12px

**Design Requirements:**
- Dark gradient background with ambient blobs (primary, purple, mint)
- Clean, calming aesthetic with soft colors
- Intuitive iconography for chat vs voice modes
- Smooth transitions between modes
- Text shadows for depth
- Card shadows for elevation
- Accessibility: Support for screen readers, high contrast mode

**Technical Specifications:**
- Single page application architecture
- Lazy loading for recommended content
- Cache wellness content for offline access
- Real-time sync of user interaction state
- Navigation to:
  - Chat screen
  - Voice screen
  - Journal screen
  - Wellness exercises (breathing)
  - Profile modal
  - Notifications modal
  - Gratitude practice

---

## 4. AI Therapy Modes

### 4.1 Text Chat Mode
**Feature ID:** AI-CHAT-001

**Description:**  
Traditional chat interface for text-based therapy conversations with AI.

**Requirements:**
- Real-time message streaming
- Conversation history persistence
- Typing indicators
- Message timestamps
- Support for long-form responses
- Markdown support for formatted text

**AI Capabilities:**
- Natural language understanding
- Empathetic response generation
- Context retention across sessions
- Crisis detection and escalation
- Sentiment analysis

**Technical Specifications:**
- WebSocket for real-time communication
- Message queue for reliability
- End-to-end encryption for messages
- Local message caching
- Maximum response time: 3 seconds

### 4.2 Voice Agent Mode
**Feature ID:** AI-VOICE-001

**Description:**  
Voice-based therapy sessions with animated visual feedback through an interactive blob interface.

**Requirements:**

#### Visual Component:
- Animated blob that responds to audio input/output
- Blob animations:
  - **Listening state:** Gentle pulsing, reactive to user voice volume/frequency
  - **Speaking state:** Dynamic movement synchronized with AI speech patterns
  - **Idle state:** Calm, breathing-like animation
  - **Thinking state:** Subtle shimmer or ripple effect

**Animation Specifications:**
- Frame rate: 60 FPS minimum
- Smooth transitions between states (200ms duration)
- Color palette: Calming blues and purples
- Size: Centered, occupying 40% of screen height

#### Audio Component:
- Real-time speech-to-text conversion
- Natural-sounding text-to-speech output
- Voice activity detection
- Echo cancellation
- Noise suppression

**Technical Specifications:**
- Web Audio API for voice processing
- WebGL/Canvas for blob animations
- Low latency audio streaming (<500ms)
- Automatic fallback to chat if audio fails
- Voice model: Natural, warm, empathetic tone
- Support for multiple languages (initial: English)

**User Flow:**
1. User taps "Voice" button
2. Microphone permission requested (if first time)
3. Blob appears in listening state
4. User speaks
5. Blob animates responsively
6. User stops speaking
7. Blob transitions to thinking state
8. AI responds with voice
9. Blob animates to speech pattern
10. Cycle continues

**Acceptance Criteria:**
- Voice recognition accuracy >95%
- Natural conversation flow without awkward pauses
- Blob animations feel organic and calming
- Clear visual indicators for each state
- Seamless handling of interruptions

---

## 5. AI-Triggered Actions

### 5.1 Therapist Referral System
**Feature ID:** AI-ACTION-001

**Description:**  
AI detects when user needs professional human support and presents therapist options.

**Trigger Conditions:**
- Crisis indicators (suicidal ideation, severe depression, immediate danger)
- Complex trauma requiring specialized care
- Medication management needs
- Legal or ethical situations beyond AI scope
- User explicitly requests human therapist
- Persistent symptoms over multiple sessions
- AI confidence score below threshold for handling situation

**Modal Interface Requirements:**

#### Initial View - Therapist List:
- Card-based layout
- Display per therapist:
  - Profile photo
  - Name and credentials (e.g., "Dr. Sarah Johnson, PhD, LMFT")
  - Specializations (e.g., "Anxiety, Depression, Trauma")
  - Star rating (if available)
  - Hourly rate
  - Next available appointment
  - "Learn More" button

#### Expanded View - Therapist Details:
- All information from card view
- Full biography (200-300 words)
- Education and certifications
- Years of experience
- Treatment approaches (e.g., CBT, DBT, EMDR)
- Languages spoken
- Availability calendar preview
- **Action Buttons:**
  - "Book Consultation" (primary CTA)
  - "Message Therapist" (secondary option)
  - "Back to List"

**Modal Implementation:**
- Bottom sheet modal presentation
- Slides up from bottom with backdrop blur
- Drag handle at top for dismissal
- Dark gradient background with ambient blobs
- Scrollable therapist list
- Header text: "Based on our talk, I think a specialist could help."
- Subtitle: "Here are 3 recommendations from Haven."

**Therapist Card Design:**
- Profile photo with online indicator
- Name, credentials, and specializations
- Star rating and review count
- Hourly rate display
- "Learn More" button
- Card styling with dark surface, borders, and shadows
- Border radius: 24px (rounded-xl)

**Therapist Profile Screen:**
- Full-screen detail view
- Header with back button, title, and share button
- Profile section with:
  - Large circular avatar with gradient border
  - Verification badge
  - Name with PhD badge
  - Title and specialization
- Quick stats cards (Experience, Rating, Price per session)
- About section with "Read more" link
- Treatment approaches with tags
- Education section with icons
- Location section with:
  - Map image background
  - Map pin with location name
  - "Online Available" badge
  - Visit info (Video & In-Person)
- Bottom action bar with:
  - Message button (outline style)
  - Book Consultation button (primary with shadow)
  - BlurView backdrop for glassmorphism effect

**User Flow:**
1. AI determines human therapist needed
2. Modal slides up from bottom with explanation: "Based on our talk, I think a specialist could help. Here are 3 recommendations from Haven."
3. User views therapist list in modal
4. User taps "Learn More" on therapist card
5. Navigate to full therapist profile screen
6. User views detailed information
7. User taps "Book Consultation"
8. Payment modal appears

### 5.2 Payment System
**Feature ID:** PAYMENT-001

**Description:**  
Secure payment processing for therapist consultations supporting both fiat and cryptocurrency.

**Payment Modal Requirements:**

**Modal Implementation:**
- Bottom sheet modal presentation
- Slides up from bottom with backdrop blur
- Drag handle at top
- Dark gradient background with ambient blobs
- Header with "Secure Checkout" badge and lock icon
- Scrollable content area

**Display Information:**
- Large price display ($150.00) with typography emphasis
- Session details card showing:
  - Therapist avatar with online indicator
  - Therapist name
  - Session date and time (e.g., "Oct 24, 10:00 - 10:50 AM")
  - Consultation badge
  - Card styling with dark surface, borders, and shadows
  - Border radius: 25px

**Payment Options:**
- **Fiat Currency:**
  - Apple Pay button (black background, iOS icon, rounded-40)
  - Google Pay button (white background, colored text, rounded-40)
  - Credit/Debit card option (future)
  - ACH bank transfer (for US users, future)
  
- **Cryptocurrency:**
  - Bitcoin (BTC) with icon and color
  - Ethereum (ETH) with icon and color
  - USDC (stablecoin) with icon and color
  - Radio button selection
  - Selected state with primary border and background
  - "Live Rates" badge with pulsing dot indicator
  - Display crypto amount with real-time conversion rate
  - Border radius: 30px for crypto option cards

**Additional Features:**
- "Add New Payment Method" button with dashed border
- Footer with:
  - "Confirm Payment" button (primary with shadow, rounded-40)
  - Security badge: "AES-256 Encrypted & HIPAA Compliant"
  - BlurView backdrop for glassmorphism effect

**Technical Specifications:**
- PCI DSS compliant payment processing
- Integration with Stripe for fiat payments
- Integration with crypto payment gateway (e.g., Coinbase Commerce)
- SSL/TLS encryption for all transactions
- Store only tokenized payment info, never raw card numbers
- Transaction receipts via email
- Refund capability for cancelled appointments

**Post-Payment Flow:**
1. Payment confirmed
2. Booking confirmation modal appears
3. Calendar invite sent to user email
4. Therapist booking page opens with pre-filled information
5. User receives therapist's contact information
6. Confirmation email with session details sent

**Acceptance Criteria:**
- Payment completes in <5 seconds for card payments
- Crypto payments confirmed within blockchain time constraints
- Clear error messages for failed payments
- Receipt generation for all transactions
- HIPAA-compliant data handling

### 5.3 Breathing Exercises
**Feature ID:** AI-ACTION-002

**Description:**  
Guided breathing exercises to help users manage anxiety, stress, and panic attacks.

**Trigger Conditions:**
- Elevated anxiety indicators in conversation
- Panic attack symptoms
- User mentions stress or feeling overwhelmed
- Pre-sleep routine (calming exercises)
- User requests relaxation techniques

**Exercise Types:**

1. **Box Breathing (4-4-4-4)**
   - Inhale: 4 seconds (customizable 1-10 seconds)
   - Hold: 4 seconds (customizable 1-10 seconds)
   - Exhale: 4 seconds (customizable 1-10 seconds)
   - Hold: 4 seconds (customizable 1-10 seconds)
   - Default: 4-4-4-4 pattern
   - Visual: Animated square box with glowing path indicator
   - Traveling dot animation around box perimeter
   - Breathing orb that scales with inhale/exhale
   - Wave-like pulsing effect inside the box

2. **4-7-8 Breathing (Sleep Aid)**
   - Inhale: 4 seconds
   - Hold: 7 seconds
   - Exhale: 8 seconds

3. **Progressive Relaxation Breathing**
   - Deep inhales with body part focus
   - Exhale while releasing tension

**Interface Requirements:**

**Visual Design:**
- Animated square box with rounded corners (Box Breathing)
- Glowing path indicator highlighting current phase (top, right, bottom, left)
- Traveling dot animation moving around box perimeter
- Breathing orb in center that expands/contracts with breath
- Wave-like pulsing effect inside the box
- Color changes: Calm blue (inhale) → Soft purple (hold) → Gentle green (exhale)
- Text instructions: "Breathe In", "Hold", "Breathe Out"
- Countdown timer for each phase (displays remaining seconds)
- Cycle counter (e.g., "Cycle 3 of 5")
- Progress bar showing overall completion
- Remaining time display

**Audio Component:**
- Optional soothing background music (Rain, Forest, Zen options)
- Voice guidance: "Breathe in through your nose..." (toggleable)
- Gentle chimes or tones marking transitions
- Volume controls (mute/unmute)
- Music selection (Rain, Forest, Zen)

**Customization Options (Settings Modal):**
- **Rhythm Duration:**
  - Inhale duration: 1-10 seconds (slider)
  - Hold duration: 1-10 seconds (slider)
  - Exhale duration: 1-10 seconds (slider)
- **Experience:**
  - Haptic feedback toggle (on/off)
  - Voice guidance toggle (on/off)
- **Background Music:**
  - Enable music toggle (on/off)
  - Music selection: Rain, Forest, Zen
- **Reset to Defaults** option

**Controls:**
- Restart button (resets cycle, animations, and timers)
- Play/Pause button (pauses/resumes breathing cycle)
- Volume/Mute button (toggles background music)

**Technical Specifications:**
- Smooth animations (60 FPS) using react-native-reanimated
- Haptic feedback on phase transitions and countdown seconds (mobile)
- Background music playback using expo-av
- Voice guidance using expo-speech (native) or Web Speech API (web)
- Settings persistence using AsyncStorage
- Offline capability
- Progress tracking and history
- Integration with health apps (Apple Health, Google Fit)
- Settings modal with bottom sheet presentation

**User Flow:**
1. AI suggests: "Would you like to try a breathing exercise? It might help you feel calmer."
2. User accepts
3. Navigate to breathing exercise screen
4. User selects exercise type (or AI recommends one)
5. Exercise begins with visual and audio guidance
6. User can access settings via settings button in header
7. User can pause, restart, or mute during exercise
8. User completes exercise
9. Return to main screen with option to log how they feel
10. AI continues conversation considering user's improved state

---

## 6. Additional AI-Recommended Actions

### 6.1 Mood Journaling
**Feature ID:** AI-ACTION-003

**Description:**  
Structured journaling prompts to help users process emotions and track mood patterns.

**Trigger Conditions:**
- User expresses confusion about their feelings
- Pattern of recurring negative thoughts
- Processing difficult experiences
- Daily check-in routine
- After significant life events

**Features:**

**Journaling Interface:**
- Guided prompts generated by AI based on conversation context
- Free-form writing space (large text area)
- Mood tagging (Happy, Calm, Anxious, Sad, Angry) with icons
- Intensity slider (1-10) with dynamic color gradient (cool blue to hot red)
- Optional image/photo attachment
- Voice-to-text capability
- Date display in header (e.g., "Today, Oct 24")
- History button in header to view past entries

**AI-Generated Prompts Examples:**
- "What's one thing that made you smile today?"
- "Describe the physical sensations you felt when..."
- "What would you say to a friend experiencing this?"
- "What's one small thing you can control right now?"

**Mood Selection:**
- Horizontal scrollable chip selection
- Active mood highlighted with primary color and shadow
- Inactive moods with dark surface and border
- Icon representation for each mood

**Intensity Slider:**
- Range: 1-10
- Dynamic color based on intensity value:
  - 1-3: Cool blues
  - 4-6: Yellow-greens
  - 7-9: Oranges
  - 10: Hot red
- Intensity badge showing current value with matching color
- "Mild" to "Intense" labels

**Mood History Screen:**
- Calendar view with mood dots for each day
- Month navigation (previous/next)
- Color-coded mood legend
- Haven Insights card with:
  - SVG graph showing mood trends
  - Textual insights about patterns
  - Gradient background with blur effect
- Recent Entries list showing:
  - Date and time
  - Mood icon and label
  - Intensity value
  - Entry description preview
- "End of history" marker
- Filter button in header

**Mood Tracking:**
- Visual mood calendar (color-coded days)
- Mood trend graphs (weekly/monthly) with SVG visualization
- Pattern recognition: AI identifies triggers and patterns
- Insights: "You tend to feel anxious on Sunday evenings"
- Calendar navigation (previous/next month)

**Technical Specifications:**
- Local-first storage with cloud backup
- End-to-end encryption for journal entries
- Export functionality (PDF, JSON)
- Reminder notifications (configurable)
- Search functionality across entries
- Maximum entry size: 10,000 characters
- Calendar generation with dynamic month/year support
- SVG graph rendering for mood trends

**User Flow:**
1. AI detects journaling would be beneficial
2. AI suggests: "Writing down your thoughts might help you process this. Would you like to try journaling?"
3. Navigate to journaling screen
4. AI provides personalized prompt (displayed in card)
5. User writes entry in text area
6. User selects mood from chips
7. User adjusts intensity slider
8. User saves entry
9. Entry saved to history
10. User can access history via History button
11. Option to share insights with AI for continued conversation

### 6.2 Progressive Muscle Relaxation (PMR)
**Feature ID:** AI-ACTION-004

**Description:**  
Guided progressive muscle relaxation exercises to reduce physical tension and anxiety.

**Trigger Conditions:**
- Physical tension mentioned (headaches, tight muscles, jaw clenching)
- Stress-related physical symptoms
- Before sleep (insomnia issues)
- Pre-anxiety-inducing event (public speaking, interview)
- Chronic pain management

**Exercise Structure:**

**Body Parts Sequence:**
1. Hands and forearms
2. Upper arms
3. Forehead
4. Face and jaw
5. Neck and shoulders
6. Chest and upper back
7. Abdomen
8. Hips and buttocks
9. Thighs
10. Lower legs
11. Feet

**Each Muscle Group:**
- Tense for 5-7 seconds
- Release and relax for 15-20 seconds
- Focus on the difference in sensation

**Interface Requirements:**

**Visual Component:**
- Body diagram highlighting current muscle group
- Animated outline showing tense vs relaxed state
- Progress bar showing exercise completion
- Calming background (customizable)

**Audio Guidance:**
- Soothing voice instructions
- Background nature sounds (optional): rain, ocean, forest
- Binaural beats option (for relaxation)
- Adjustable guidance pace (beginner, intermediate, advanced)

**Customization:**
- Full body (20 minutes) vs Quick version (10 minutes)
- Specific body areas (e.g., just shoulders and neck)
- Lying down vs seated position instructions
- Voice gender and accent preference

**Technical Specifications:**
- Offline capability essential
- Integration with Apple Health/Google Fit (stress relief session)
- Session completion tracking
- Haptic feedback for tense/release cues (mobile)
- Pause/resume functionality

**Post-Exercise:**
- "How do you feel now?" rating (1-10)
- Body map: "Tap areas that still feel tense"
- AI follows up: "I notice your shoulders still feel tight. Would you like to repeat that section?"

**User Flow:**
1. AI detects physical tension
2. AI suggests: "Your body seems to be holding a lot of tension. Progressive muscle relaxation can help release that. Would you like to try?"
3. Navigate to PMR screen
4. User selects exercise length and position
5. Exercise begins with audio and visual guidance
6. User completes exercise
7. Post-exercise check-in
8. Return to AI conversation with updated context

### 6.3 Gratitude Practice
**Feature ID:** AI-ACTION-005

**Description:**  
Daily gratitude exercises to shift focus toward positive aspects and build resilience.

**Trigger Conditions:**
- Persistent negative thought patterns
- Depression indicators
- Lack of motivation
- End-of-day wind-down routine
- After difficult day/week
- Building positive coping mechanisms

**Practice Formats:**

**1. Three Good Things (Primary Implementation):**
- List 3 good things from today
- Numbered input fields (1, 2, 3) with focus indicators
- Placeholder examples for each field
- Focus state with left border indicator and shadow glow
- Photo upload section (optional) with dashed border button
- Inspirational quote section at bottom

**2. Gratitude Letter:**
- Write letter to someone they're grateful for
- Option to send (via email) or keep private
- AI helps articulate appreciation

**3. Gratitude Prompt:**
- Daily rotating prompts
- Examples:
  - "Who made you feel supported recently?"
  - "What's something about your body you're grateful for?"
  - "What challenge helped you grow?"
  - "What's a small comfort you often take for granted?"

**4. Photo Gratitude:**
- Take or select photo representing gratitude
- Add brief caption
- Build visual gratitude gallery

**Interface Requirements:**

**Visual Design:**
- Warm, uplifting color palette (golds, warm yellows, soft oranges)
- Gradient background with ambient blobs (amber and primary color)
- Gratitude streak counter in header (fire icon + number)
- Streak badge is pressable and navigates to history
- Number badges for each input field (primary color)
- Focus indicators on active input fields
- Photo upload button with icon container
- Inspirational quote section with quote icon
- Save Entry button with gradient footer

**Gratitude History Screen:**
- Modal presentation (bottom sheet)
- AI Growth Insights card with:
  - Gradient background with blur effect
  - Bar chart visualization (SVG)
  - Textual insights about growth patterns
- Recent Entries list showing:
  - Date
  - Icon (favorite/heart)
  - Title/description
  - Optional tags
  - Entry description preview
- "End of history" marker
- Filter button in header

**Features:**
- Daily reminder notifications (customizable time)
- Gratitude history/archive accessible via streak badge
- Reflection on past gratitudes
- AI-generated insights: "You've expressed gratitude for nature 12 times this month"
- Option to revisit during difficult moments
- Streak tracking with visual badge

**Gamification Elements:**
- Streak tracking (displayed in header badge)
- Unlockable gratitude prompts
- Celebration animations for milestones
- Progress visualization (bar chart in history)

**Technical Specifications:**
- Push notification system for reminders
- Local storage with cloud sync
- Image optimization for photo gratitudes
- Export gratitude journal as PDF
- Privacy controls for community sharing
- SVG bar chart rendering for growth visualization
- Modal presentation using BottomSheetModal

**AI Integration:**
- Personalized prompt generation based on user history
- Recognition of gratitude patterns
- Gentle encouragement without pressure
- Celebrates authenticity over frequency

**User Flow:**
1. AI detects need for perspective shift
2. AI suggests: "Taking a moment to notice what's going well can be really helpful. Would you like to practice gratitude together?"
3. Navigate to gratitude practice
4. User sees hero text: "What went well today?"
5. User fills in three numbered input fields
6. Optional: User uploads photo
7. User views inspirational quote
8. User saves entry
9. Streak counter updates
10. User can tap streak badge to view history
11. Positive reinforcement from AI
12. Return to conversation with refreshed perspective

---

## 6.4 Notifications System
**Feature ID:** UI-002

**Description:**  
In-app notification system to keep users informed about reminders, updates, and important information.

**Interface Requirements:**

**Notifications Screen:**
- Modal presentation (bottom sheet)
- Header with back button, "Notifications" title, and settings button
- Background glow gradient at top
- Scrollable notification list

**Notification Sections:**
- **TODAY** section with "Clear All" button
- **YESTERDAY** section (read notifications with reduced opacity)

**Notification Card Design:**
- Colored icon container (matching notification type)
- Unread indicator with pulse animation (for unread notifications)
- Title text
- Time display (e.g., "2 hours ago")
- Description text
- Border radius: 16px (rounded-2xl)
- Icon container border radius: 12px (rounded-xl)

**Notification Types:**
- Journal reminders
- Gratitude practice reminders
- Breathing exercise suggestions
- Therapist appointment reminders
- System updates
- Achievement notifications

**Features:**
- Unread/read state management
- Pulse animation for unread indicators
- Clear all functionality for today's notifications
- Time-based grouping (Today, Yesterday, Older)
- Bottom gradient fade effect

**Technical Specifications:**
- Local notification storage
- Push notification integration (future)
- Notification settings (future)
- Modal presentation using BottomSheetModal

**User Flow:**
1. User taps notifications icon in header
2. Notifications modal slides up
3. User views notifications grouped by date
4. User can clear all today's notifications
5. User can tap individual notifications (future: navigate to related content)
6. User closes modal

---

## 6.5 User Profile & Journey
**Feature ID:** UI-003

**Description:**  
User profile screen displaying personal information, journey statistics, achievements, and settings.

**Interface Requirements:**

**Profile Screen:**
- Modal presentation (bottom sheet)
- Header with back button, "Profile" title, and menu button
- Dark gradient background with ambient blobs

**Profile Section:**
- Circular profile image with gradient border
- Edit button overlay
- User name display
- "Joined [Month] [Year]" badge
- Profile image shadow and styling

**Your Journey Section:**
- Glass panel card with BlurView backdrop
- Statistics display:
  - Days active
  - Sessions completed
  - Streaks maintained
  - Achievements unlocked
- Border radius: 32px (rounded-2xl)

**Achievements Section:**
- Section title: "ACHIEVEMENTS"
- 2x2 grid layout
- Achievement cards showing:
  - Icon
  - Title
  - Description
  - Locked/completed state
- Completed achievements: colored with icon
- Locked achievements: grayed out with lock icon
- Border radius: 24px (rounded-xl)

**Settings Section:**
- Section title: "SETTINGS"
- Settings items:
  - Account Privacy
  - Connected Apps
  - Log Out button (destructive style)
- Border radius: 24px (rounded-xl) for each item

**Technical Specifications:**
- User data management
- Achievement tracking
- Settings persistence
- Modal presentation using BottomSheetModal
- Glassmorphism effects with BlurView

**User Flow:**
1. User taps profile icon/button
2. Profile modal slides up
3. User views profile information
4. User can view journey statistics
5. User can view achievements
6. User can access settings
7. User can log out

---

## 7. AI Intelligence & Decision Engine

### 7.1 AI Decision Framework
**Feature ID:** AI-CORE-001

**AI Model Requirements:**
- Foundation model: Large language model with therapy/mental health fine-tuning
- Context window: Minimum 32k tokens for conversation history
- Response latency: <3 seconds for text, <1 second for voice response start
- Safety layers: Crisis detection, harm prevention, ethical boundaries

**Decision Categories & Thresholds:**

**1. Crisis Detection (Immediate Escalation):**
- Suicidal ideation (explicit or implicit)
- Self-harm intent
- Harm to others
- Severe psychotic symptoms
- Medical emergency
→ **Action:** Immediate therapist referral + crisis resources

**2. Professional Referral (High Priority):**
- Symptoms lasting >2 weeks with no improvement
- Trauma requiring specialized treatment (PTSD, complex trauma)
- Substance abuse issues
- Eating disorders
- Persistent sleep disturbances
- Request for medication management
→ **Action:** Therapist referral modal

**3. Active Interventions (Medium Priority):**
- Acute anxiety/panic
- Rumination loops
- Stress overload
- Physical tension
- Pre-event anxiety
→ **Action:** Breathing exercises, PMR, grounding techniques

**4. Reflective Practices (Ongoing Support):**
- Processing emotions
- Building coping skills
- Mood variability
- Life transitions
- Relationship challenges
→ **Action:** Journaling, gratitude practice

**5. Educational Resources (Supplementary):**
- Learning about mental health
- Understanding symptoms
- Building skills
- Psychoeducation
→ **Action:** Recommend articles/videos

### 7.2 Conversation Context Maintenance

**Session Management:**
- Maintain context within single session (until user exits)
- Store conversation summaries across sessions (encrypted)
- Reference previous sessions when relevant
- Track user progress over time

**User Profile Data:**
- Presenting concerns
- Triggers identified
- Coping strategies that work
- Therapy goals
- Preferred interventions
- Communication style preferences

### 7.3 Ethical Guardrails

**AI Limitations:**
- Never diagnoses mental health conditions
- Doesn't prescribe medication
- Doesn't replace therapy, complements it
- Acknowledges uncertainty
- Escalates appropriately

**Transparency:**
- Clear that user is talking to AI, not human
- Explains its reasoning when recommending actions
- Provides sources for educational content
- Acknowledges when beyond its scope

---

## 8. Content Recommendation System

### 8.1 Wellness Articles & Videos
**Feature ID:** CONTENT-001

**Content Types:**
- Mental health education (anxiety, depression, trauma, etc.)
- Coping strategies and techniques
- Self-care practices
- Relationship skills
- Stress management
- Sleep hygiene
- Mindfulness and meditation
- Personal growth and resilience

**Recommendation Engine:**
- Based on conversation context
- User history and preferences
- Current emotional state
- Identified goals
- Trending wellness topics

**Content Sources:**
- Curated from reputable sources (APA, NIMH, Psychology Today, etc.)
- Licensed therapist-created content
- Evidence-based practices
- Regularly updated and reviewed

**Interface:**
- Horizontal scrollable carousel
- Thumbnail image + headline
- Estimated read/watch time
- Relevance tag: "Recommended for you: Anxiety Management"
- Save for later functionality
- Share options

**Technical Specifications:**
- Content API integration
- Caching for offline access
- Reading progress tracking
- Video streaming optimization
- Content rating system
- Report inappropriate content option

---

## 9. Data Privacy & Security

### 9.1 Compliance Requirements
**Feature ID:** SECURITY-001

**Regulatory Compliance:**
- **HIPAA** (Health Insurance Portability and Accountability Act)
- **GDPR** (General Data Protection Regulation)
- **COPPA** (Children's Online Privacy Protection Act - no users under 13)
- **CCPA** (California Consumer Privacy Act)

**Data Encryption:**
- End-to-end encryption for all conversations
- At-rest encryption for stored data (AES-256)
- In-transit encryption (TLS 1.3)
- Encrypted backups

**Data Storage:**
- Conversation history: Encrypted cloud storage
- User credentials: Tokenized, never stored in plain text
- Payment information: PCI DSS compliant, tokenized
- Journal entries: User device first, encrypted cloud backup

**User Data Rights:**
- Right to access data
- Right to delete data (complete erasure within 30 days)
- Right to export data
- Data portability
- Transparent privacy policy

### 9.2 Safety Features

**Crisis Resources:**
- Always accessible crisis hotline numbers
- Emergency contact quick dial
- Location-based emergency services
- Crisis text line integration

**Content Moderation:**
- Inappropriate content detection
- Spam prevention
- Abuse reporting mechanism

---

## 10. Analytics & Monitoring

### 10.1 User Analytics
**Feature ID:** ANALYTICS-001

**Usage Metrics:**
- Session frequency and duration
- Feature utilization (chat vs voice, exercise completion)
- Intervention effectiveness (user ratings post-action)
- Drop-off points
- Conversion to paid therapy

**AI Performance Metrics:**
- Response accuracy and relevance
- Escalation rate (appropriate vs inappropriate)
- User satisfaction scores
- Model hallucination detection
- Conversation depth metrics

**Mental Health Outcomes:**
- Self-reported mood trends
- Symptom improvement over time
- Coping skill development
- User goal achievement
- Engagement consistency

**Privacy Considerations:**
- All analytics aggregated and anonymized
- No individual conversation content in analytics
- Opt-out available for analytics tracking
- Compliant with all privacy regulations

---

## 11. Technical Architecture

### 11.1 System Architecture

**Frontend:**
- **Mobile:** React Native (iOS and Android)
- **Web:** React.js (Progressive Web App)
- State management: Redux or Context API
- Real-time updates: WebSockets

**Backend:**
- **API Gateway:** Node.js with Express or FastAPI (Python)
- **AI Services:**
  - LLM Integration: OpenAI GPT-4, Anthropic Claude, or open-source alternative
  - Speech-to-Text: Whisper API or Google Cloud Speech-to-Text
  - Text-to-Speech: ElevenLabs or Azure Cognitive Services
- **Database:**
  - Primary: PostgreSQL (user data, therapist profiles, transactions)
  - Cache: Redis (session data, real-time state)
  - Vector DB: Pinecone or Weaviate (conversation embeddings, context retrieval)

**Infrastructure:**
- Cloud Provider: AWS or Google Cloud Platform
- CDN: Cloudflare for content delivery
- Container orchestration: Kubernetes
- CI/CD: GitHub Actions or GitLab CI

**Third-Party Integrations:**
- **Authentication:** Firebase Auth or Auth0
- **Payment Processing:**
  - Fiat: Stripe
  - Crypto: Coinbase Commerce or BitPay
- **Analytics:** Mixpanel, Amplitude
- **Monitoring:** Sentry (error tracking), DataDog (APM)
- **Email:** SendGrid
- **Push Notifications:** Firebase Cloud Messaging

### 11.2 API Endpoints (Key Examples)

```
Authentication:
POST /api/v1/auth/google
POST /api/v1/auth/apple
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

AI Conversation:
POST /api/v1/conversation/message
POST /api/v1/conversation/voice
GET /api/v1/conversation/history
DELETE /api/v1/conversation/{id}

Therapist:
GET /api/v1/therapists
GET /api/v1/therapists/{id}
POST /api/v1/therapists/{id}/book

Payment:
POST /api/v1/payment/intent
POST /api/v1/payment/confirm
GET /api/v1/payment/history

Interventions:
GET /api/v1/exercises/breathing
GET /api/v1/exercises/pmr
POST /api/v1/journal/entry
GET /api/v1/journal/history

Content:
GET /api/v1/content/recommendations
GET /api/v1/content/{id}
POST /api/v1/content/{id}/save

User:
GET /api/v1/user/profile
PUT /api/v1/user/profile
DELETE /api/v1/user/account
GET /api/v1/user/analytics
```

### 11.3 Performance Requirements

**Response Times:**
- Page load: <2 seconds
- AI text response: <3 seconds
- AI voice response start: <1 second
- API endpoints: <500ms (p95)
- Payment processing: <5 seconds

**Availability:**
- Uptime: 99.9% SLA
- Graceful degradation for non-critical features
- Offline mode for breathing exercises, PMR, journaling

**Scalability:**
- Support 100,000 concurrent users
- Horizontal scaling for AI inference
- Database read replicas for performance
- CDN for global content delivery

---

## 12. Testing Requirements

### 12.1 Testing Strategy

**Unit Testing:**
- All backend services (coverage >80%)
- Frontend components (coverage >70%)
- AI decision logic
- Payment processing flows

**Integration Testing:**
- OAuth flows
- AI conversation continuity
- Payment gateway integration
- Third-party API integrations

**End-to-End Testing:**
- Complete user journeys
- Cross-platform consistency (iOS, Android, Web)
- Crisis escalation workflows
- Payment and booking flows

**AI Testing:**
- Response quality evaluation
- Crisis detection accuracy
- Escalation appropriateness
- Bias detection and mitigation
- Hallucination monitoring

**Security Testing:**
- Penetration testing
- HIPAA compliance audit
- Data encryption verification
- Authentication security

**Accessibility Testing:**
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios

**User Acceptance Testing:**
- Beta testing with real users
- Mental health professional review
- Crisis scenario simulations

---

## 13. Launch Plan

### 13.1 Phased Rollout

**Phase 1: Alpha (Internal - Weeks 1-4)**
- Core team testing
- AI conversation quality validation
- Basic feature functionality

**Phase 2: Beta (Limited - Weeks 5-12)**
- Invite-only (500-1000 users)
- Mental health professionals as advisors
- Collect feedback on AI quality and features
- Iterate on UX/UI

**Phase 3: Soft Launch (Controlled - Weeks 13-20)**
- Geographic limit (e.g., US only initially)
- Scale infrastructure gradually
- Monitor AI performance and safety
- Onboard therapist partners

**Phase 4: Public Launch (Week 21+)**
- Full release
- Marketing campaign
- Press coverage
- App store optimization
- Continuous improvement

### 13.2 Success Metrics

**User Acquisition:**
- Downloads: 10,000 in first month
- Monthly Active Users (MAU): 7,000
- Retention: 40% Day 30

**Engagement:**
- Average session duration: >10 minutes
- Sessions per week: >3
- Feature adoption: 60% use at least one exercise/intervention

**Quality:**
- User satisfaction: >4.5/5 stars
- AI response quality: >4.0/5 user rating
- Crisis escalation accuracy: >95%
- Inappropriate escalation: <5%

**Business:**
- Conversion to paid therapy: 15%
- Revenue from consultations: $50,000 in first 3 months
- Cost per acquisition: <$20

**Safety:**
- Zero unaddressed crisis situations
- Rapid response time to escalations: <1 minute
- Privacy incidents: Zero

---

## 14. Future Enhancements (Post-Launch)

### 14.1 Potential Features

**Enhanced Personalization:**
- AI learns user's therapy style preferences
- Customizable AI personality/tone
- Long-term therapy plans with AI

**Community Features:**
- Anonymous support groups
- Moderated forums
- Peer support matching
- Shared journaling circles (opt-in)

**Advanced Interventions:**
- CBT worksheets and exercises
- Exposure therapy guidance
- Sleep therapy programs
- Relationship counseling tools

**Therapist Portal:**
- Dashboard for therapists
- Access to client AI conversation summaries (with consent)
- Treatment plan collaboration
- Scheduling and payment management

**Integration:**
- Wearable device data (stress levels, sleep, heart rate)
- Calendar integration for stress predictions
- Other health apps ecosystem

**AI Capabilities:**
- Multi-language support
- Cultural competency improvements
- Specialized AI models (trauma, addiction, etc.)
- Family therapy mode

**Insurance Integration:**
- Insurance verification
- Claims submission
- Coverage checking

---

## 15. Roles & Responsibilities

### 15.1 Development Team

**Product Manager:**
- PRD ownership and updates
- Stakeholder communication
- Prioritization and roadmap

**Engineering:**
- **Frontend Engineers (2):** UI implementation, mobile/web
- **Backend Engineers (2):** API development, infrastructure
- **AI/ML Engineers (2):** AI model integration, fine-tuning, safety
- **DevOps Engineer (1):** Infrastructure, CI/CD, monitoring

**Design:**
- **UI/UX Designer (1):** Interface design, user flows
- **Motion Designer (1):** Blob animations, micro-interactions

**Quality:**
- **QA Engineers (2):** Testing strategy, automation, manual testing

**Mental Health:**
- **Clinical Advisor:** AI safety, ethical review, crisis protocols
- **Content Specialist:** Wellness content curation

**Legal & Compliance:**
- **Privacy Officer:** HIPAA compliance, data protection
- **Legal Counsel:** Terms of service, liability

---

## 16. Risks & Mitigation

### 16.1 Key Risks

**Risk 1: AI Provides Harmful Advice**
- **Mitigation:** 
  - Extensive safety testing and red-teaming
  - Clear limitations messaging
  - Immediate escalation protocols
  - Human oversight and monitoring
  - Regular AI model updates and fine-tuning

**Risk 2: Privacy Breach**
- **Mitigation:**
  - End-to-end encryption
  - Regular security audits
  - Compliance certifications
  - Incident response plan
  - Cyber insurance

**Risk 3: User in Crisis Not Escalated**
- **Mitigation:**
  - Conservative escalation thresholds
  - Multiple detection methods
  - Always-available crisis resources
  - Clear "Talk to Human Now" button
  - Post-crisis follow-up system

**Risk 4: Poor AI Response Quality**
- **Mitigation:**
  - Continuous user feedback collection
  - A/B testing of prompts and models
  - Fallback to better (slower) models when needed
  - Human review of flagged conversations

**Risk 5: Low Therapist Availability**
- **Mitigation:**
  - Partner with therapist networks
  - Incentives for early-adopting therapists
  - Waitlist system with expected wait times
  - Geographic expansion planning

**Risk 6: Payment Fraud**
- **Mitigation:**
  - Robust payment provider with fraud detection
  - Transaction monitoring
  - User verification for high-value transactions
  - Clear refund policy

**Risk 7: Regulatory Changes**
- **Mitigation:**
  - Legal team monitoring regulations
  - Flexible architecture for compliance updates
  - Geographic-specific features
  - Terms of service that allow updates

---

## 17. Appendices

### 17.1 Glossary

- **OAuth:** Open standard for access delegation
- **HIPAA:** Health Insurance Portability and Accountability Act
- **CBT:** Cognitive Behavioral Therapy
- **DBT:** Dialectical Behavior Therapy
- **EMDR:** Eye Movement Desensitization and Reprocessing
- **PMR:** Progressive Muscle Relaxation
- **LLM:** Large Language Model
- **API:** Application Programming Interface
- **SLA:** Service Level Agreement
- **MAU:** Monthly Active Users

### 17.2 References

- American Psychological Association (APA) Guidelines
- National Institute of Mental Health (NIMH) Resources
- HIPAA Privacy Rule
- WCAG 2.1 Accessibility Standards
- PCI DSS Payment Security Standards

---

## Document Control

**Version:** 1.0  
**Last Updated:** January 12, 2026  
**Next Review:** February 12, 2026  
**Owner:** Product Manager, Haven  
**Approvers:** Engineering Lead, Clinical Advisor, Legal Counsel

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 12, 2026 | Product Manager | Initial PRD creation |

---

**END OF DOCUMENT**