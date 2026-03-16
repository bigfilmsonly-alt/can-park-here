# PARK APP - COMPLETE PROJECT DOCUMENTATION

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Complete File Structure](#complete-file-structure)
4. [Design System](#design-system)
5. [All Components](#all-components)
6. [All Hooks](#all-hooks)
7. [All Libraries](#all-libraries)
8. [Data Types & Interfaces](#data-types--interfaces)
9. [State Management](#state-management)
10. [Feature Documentation](#feature-documentation)
11. [Authentication System](#authentication-system)
12. [Database Layer](#database-layer)
13. [Accessibility System](#accessibility-system)
14. [Internationalization](#internationalization)
15. [PWA Configuration](#pwa-configuration)
16. [Revenue Model](#revenue-model)
17. [Deployment](#deployment)
18. [Future Roadmap](#future-roadmap)

---

## PROJECT OVERVIEW

### What is Park?
Park is a mobile-first parking assistant app that answers one question: "Can I park here?" It provides real-time parking rule checking, ticket protection guarantees, AI sign scanning, community reports, and predictive analytics.

### Core Value Proposition
- **Clear answers** - Instant yes/no with time limits
- **Ticket protection** - We pay if you get a ticket following our guidance
- **No confusion** - Plain English explanations of complex parking rules

### Target Users
- Urban drivers
- Delivery drivers
- Fleet managers
- Anyone who parks in cities

### Business Model
- Freemium: 10 free checks/month
- Pro: $4.99/month - unlimited checks + ticket protection
- Fleet: $99-499/month - business accounts
- City API: $10K-50K/month per city partnership

---

## TECH STACK

### Core Framework
```
Next.js 16 (App Router)
React 19.2
TypeScript 5.x
```

### Styling
```
Tailwind CSS v4
CSS Variables for theming
Custom animations in globals.css
```

### UI Components
```
shadcn/ui (Button, Card, Input, etc.)
Lucide React (icons)
Custom components built on top
```

### State Management
```
React useState/useEffect
localStorage for persistence
Custom hooks for shared state
SWR pattern for data fetching
```

### APIs & Services
```
OpenStreetMap Nominatim (reverse geocoding)
Web Speech API (voice commands)
Notification API (browser notifications)
Geolocation API (location services)
WebAuthn (biometric authentication)
Vibration API (haptic feedback)
```

---

## COMPLETE FILE STRUCTURE

```
/
├── app/
│   ├── globals.css              # Tailwind config + custom CSS + accessibility styles
│   ├── layout.tsx               # Root layout with metadata, fonts, viewport
│   ├── page.tsx                 # Main app entry point (750+ lines)
│   ├── fleet/
│   │   └── page.tsx             # Fleet management dashboard
│   ├── insurance/
│   │   └── page.tsx             # Insurance integration page
│   ├── partners/
│   │   └── page.tsx             # City/Enterprise API partnership page
│   └── widget/
│       └── page.tsx             # PWA widget preview page
│
├── components/
│   ├── auth/
│   │   └── auth-screen.tsx      # Sign up/Login screens
│   │
│   ├── onboarding/
│   │   ├── onboarding-flow.tsx  # First-time user intro slides
│   │   └── permission-request.tsx # Location/notification permission requests
│   │
│   ├── screens/
│   │   ├── home-screen.tsx      # Main home screen with actions
│   │   ├── status-screen.tsx    # Parking result display
│   │   ├── history-screen.tsx   # Past parking checks
│   │   ├── settings-screen.tsx  # App settings
│   │   ├── community-screen.tsx # Community reports & sightings
│   │   ├── account-screen.tsx   # User profile management
│   │   ├── rewards-screen.tsx   # Gamification dashboard
│   │   ├── predictions-screen.tsx # AI predictions
│   │   ├── map-screen.tsx       # Live parking map
│   │   ├── fleet-screen.tsx     # Fleet management UI
│   │   ├── insurance-screen.tsx # Insurance integration UI
│   │   ├── saved-screen.tsx     # Saved locations
│   │   └── accessibility-screen.tsx # Accessibility settings
│   │
│   ├── ui/
│   │   ├── button.tsx           # shadcn button
│   │   ├── card.tsx             # shadcn card
│   │   ├── input.tsx            # shadcn input
│   │   ├── toast-notification.tsx # Custom toast system
│   │   ├── protection-badge.tsx # Ticket protection indicator
│   │   ├── skeleton-loaders.tsx # Loading skeletons
│   │   ├── empty-states.tsx     # Empty state components
│   │   └── error-states.tsx     # Error display components
│   │
│   ├── alerts-panel.tsx         # Smart alerts display
│   ├── biometric-lock.tsx       # Face ID/Touch ID lock screen
│   ├── bottom-nav.tsx           # Tab navigation
│   ├── install-prompt.tsx       # PWA install prompt
│   ├── lock-screen.tsx          # App lock screen
│   ├── meter-payment-modal.tsx  # Meter payment UI
│   ├── offline-banner.tsx       # Offline indicator
│   ├── offline-indicator.tsx    # Offline status
│   ├── page-transition.tsx      # Page transition animations
│   ├── photo-vault.tsx          # Photo evidence storage
│   ├── report-issue-modal.tsx   # Report incorrect data
│   ├── scan-sign-modal.tsx      # AI sign scanning
│   ├── timer-display.tsx        # Countdown timer
│   ├── timer-modal.tsx          # Set timer UI
│   ├── upgrade-modal.tsx        # Pro upgrade prompt
│   ├── voice-button.tsx         # Voice command button
│   └── wallet-pass.tsx          # Apple/Google Wallet pass
│
├── hooks/
│   ├── use-biometric.ts         # Biometric authentication
│   ├── use-biometric-auth.ts    # WebAuthn integration
│   ├── use-geolocation.ts       # Location services
│   ├── use-haptics.ts           # Vibration feedback
│   ├── use-mobile.ts            # Mobile detection
│   ├── use-offline.ts           # Offline detection
│   ├── use-saved-locations.ts   # Saved spots management
│   ├── use-timer.ts             # Countdown timer logic
│   ├── use-toast.ts             # Toast notifications
│   └── use-voice-commands.ts    # Voice recognition
│
├── lib/
│   ├── accessibility.ts         # Accessibility settings & translations
│   ├── auth.ts                  # Authentication functions
│   ├── community.ts             # Community reports & sightings
│   ├── db.ts                    # Database abstraction layer
│   ├── fleet.ts                 # Fleet management
│   ├── gamification.ts          # Karma, badges, leaderboards
│   ├── mapping.ts               # Parking spots, garages, EV stations
│   ├── parking-rules.ts         # Parking rule engine
│   ├── predictions.ts           # AI predictions
│   ├── protection.ts            # Ticket protection system
│   ├── sign-parser.ts           # AI sign scanning
│   ├── smart-alerts.ts          # Proactive alerts
│   └── utils.ts                 # Utility functions (cn)
│
├── public/
│   ├── manifest.json            # PWA manifest
│   └── og-image.jpg             # Social sharing image
│
├── README.md                    # Basic readme
├── CLAUDE_CODE_CONTEXT.md       # Claude Code specific docs
└── PARK_APP_COMPLETE_DOCUMENTATION.md # This file
```

---

## DESIGN SYSTEM

### Color Palette (CSS Variables in globals.css)

```css
:root {
  /* Base colors */
  --background: oklch(0.995 0 0);      /* Near white */
  --foreground: oklch(0.15 0 0);       /* Near black */
  --card: oklch(1 0 0);                /* Pure white */
  --card-foreground: oklch(0.15 0 0);
  
  /* Muted/Secondary */
  --muted: oklch(0.965 0 0);           /* Light gray */
  --muted-foreground: oklch(0.5 0 0);  /* Medium gray */
  
  /* Borders */
  --border: oklch(0.93 0 0);           /* Light border */
  
  /* Status colors - soft and calm */
  --status-success: oklch(0.75 0.14 145);
  --status-success-foreground: oklch(0.35 0.1 145);
  --status-warning: oklch(0.82 0.12 85);
  --status-warning-foreground: oklch(0.4 0.1 85);
  --status-error: oklch(0.75 0.12 25);
  --status-error-foreground: oklch(0.45 0.1 25);
  
  /* Radius */
  --radius: 0.75rem;
}
```

### Typography
- Font: Geist (sans-serif), Geist Mono (monospace)
- Headings: text-2xl to text-4xl, font-semibold
- Body: text-base, leading-relaxed
- Small: text-sm, text-muted-foreground

### Spacing Pattern
- Container padding: px-6 py-8
- Card padding: p-6
- Gap between elements: gap-4, gap-6
- Section margins: mt-6, mt-8

### Border Radius
- Buttons: rounded-2xl
- Cards: rounded-2xl
- Inputs: rounded-xl
- Small elements: rounded-lg

### Animation Classes (globals.css)
```css
.animate-fade-in          /* Fade in */
.animate-fade-in-up       /* Fade in + slide up */
.animate-scale-in         /* Scale from 95% to 100% */
.animate-slide-in-up      /* Slide up from bottom */
.animate-pulse-soft       /* Subtle pulse */
.animate-shake            /* Error shake */
.stagger-children         /* Stagger child animations */
.press-effect             /* Button press scale */
.hover-lift               /* Card hover lift */
```

---

## ALL COMPONENTS

### Home Screen (`/components/screens/home-screen.tsx`)
```typescript
interface HomeScreenProps {
  onCheckParking: () => void
  onResumeSession: () => void
  onScanSign: () => void
  onSetTimer: () => void
  onOpenPredictions: () => void
  onOpenRewards: () => void
  onOpenMap: () => void
  loading?: boolean
  error?: string | null
  activeSession: ProtectionSession | null
  sessionTimeRemaining: number | null
  remainingChecks: number
  onUpgrade: () => void
  currentLocation?: { lat: number; lng: number }
  timerActive: boolean
  timerRemainingSeconds: number
  formatTimerDisplay: (seconds: number) => string
  onCancelTimer: () => void
}
```

**Features:**
- Main "Check Parking" button
- 5 action buttons: Scan, Timer, Map, Predict, Rewards
- Active session banner with resume
- Active timer countdown display
- Smart alerts panel
- Protection badge
- Pro upgrade CTA

### Status Screen (`/components/screens/status-screen.tsx`)
```typescript
interface StatusScreenProps {
  result: ParkingResult
  location: string
  fullAddress?: string
  coordinates?: { lat: number; lng: number }
  isSaved: boolean
  onBack: () => void
  onSetReminder: () => void
  onEndSession: () => void
  onSaveLocation: () => void
  onRemoveLocation: () => void
  isProtected: boolean
  reminderSet: boolean
}
```

**Features:**
- Status display (allowed/restricted/prohibited)
- Time remaining countdown
- Warning cards (tow zone, street cleaning, etc.)
- Set reminder button
- Save location toggle
- Add to Wallet button
- Protection status indicator

### Settings Screen (`/components/screens/settings-screen.tsx`)
```typescript
interface SettingsScreenProps {
  onUpgrade: () => void
  user?: User | null
  onOpenAccount?: () => void
  onSignIn?: () => void
  onOpenAccessibilitySettings?: () => void
}
```

**Sections:**
- Account (sign in or view profile)
- Subscription status
- Notifications toggle
- City selection dropdown
- Accessibility settings
- Handicap parking toggle + placard type
- Vehicle information
- How it works (expandable)
- Terms & Privacy (expandable)
- Business links (Fleet, Insurance, Partners)
- Support contact

### Community Screen (`/components/screens/community-screen.tsx`)
```typescript
interface CommunityScreenProps {
  currentLocation?: { lat: number; lng: number }
  currentAddress?: string
  onOpenPhotoVault: () => void
  onOpenReportIssue: () => void
  showToast: (type: string, title: string, message: string) => void
}
```

**Features:**
- Enforcement sightings list
- Report enforcement button
- Nearby meters status
- Report meter status
- Photo vault access
- Report incorrect data

### Rewards Screen (`/components/screens/rewards-screen.tsx`)
```typescript
interface RewardsScreenProps {
  onBack: () => void
}
```

**Features:**
- Karma points display with level
- Progress to next level
- Badges grid (locked/unlocked)
- Leaderboard with rankings
- Referral program with shareable code
- Money saved stats

### Map Screen (`/components/screens/map-screen.tsx`)
```typescript
interface MapScreenProps {
  onBack: () => void
  currentLocation?: { lat: number; lng: number }
}
```

**Features:**
- Filter tabs: All, Street, Garages, EV
- Sortable list by distance
- Spot detail panel
- Navigation to Apple/Google Maps
- Real-time availability indicators

### Auth Screen (`/components/auth/auth-screen.tsx`)
```typescript
interface AuthScreenProps {
  onSuccess: (user: User) => void
  onSkip: () => void
}
```

**Features:**
- Toggle between Sign Up and Login
- Email/password fields
- Password visibility toggle
- Forgot password link
- Form validation
- Skip option

### Accessibility Screen (`/components/screens/accessibility-screen.tsx`)
```typescript
interface AccessibilityScreenProps {
  onBack: () => void
}
```

**Settings:**
- High Contrast Mode
- Large Text Mode
- Reduced Motion
- Dyslexia-friendly Font
- Screen Reader Mode
- Language Selection (8 languages)

---

## ALL HOOKS

### useGeolocation (`/hooks/use-geolocation.ts`)
```typescript
interface GeolocationHook {
  location: LocationData | null
  loading: boolean
  error: string | null
  getCurrentLocation: () => Promise<LocationData>
}

interface LocationData {
  latitude: number
  longitude: number
  address: string
  street: string
  city: string
  accuracy: number
}
```

**Functionality:**
- Get current position via Geolocation API
- Reverse geocode via OpenStreetMap Nominatim
- Error handling for permission denied, timeout, etc.

### useTimer (`/hooks/use-timer.ts`)
```typescript
interface TimerHook {
  isActive: boolean
  remainingSeconds: number
  startTimer: (minutes: number) => Promise<void>
  cancelTimer: () => void
  formatTimeDisplay: (seconds: number) => string
}
```

**Functionality:**
- Start countdown timer
- Persist to localStorage
- Send notifications at 20min, 10min, 5min
- Format display as HH:MM:SS or MM:SS

### useVoiceCommands (`/hooks/use-voice-commands.ts`)
```typescript
interface VoiceCommandsHook {
  isListening: boolean
  isSupported: boolean
  transcript: string
  toggleListening: () => void
}
```

**Commands recognized:**
- "check parking" / "can I park"
- "scan sign"
- "set timer"
- "cancel timer"
- "history"
- "settings"
- "home"
- "community"
- "help"

### useBiometric (`/hooks/use-biometric.ts`)
```typescript
interface BiometricHook {
  isSupported: boolean
  isEnabled: boolean
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  authenticate: () => Promise<boolean>
  enable: () => void
  disable: () => void
}
```

### useOffline (`/hooks/use-offline.ts`)
```typescript
interface OfflineHook {
  isOffline: boolean
  cachedLocations: number
}
```

### useHaptics (`/hooks/use-haptics.ts`)
```typescript
interface HapticsHook {
  vibrate: (pattern?: number | number[]) => void
  lightTap: () => void
  mediumTap: () => void
  heavyTap: () => void
  success: () => void
  error: () => void
}
```

### useSavedLocations (`/hooks/use-saved-locations.ts`)
```typescript
interface SavedLocationsHook {
  savedLocations: SavedLocation[]
  saveLocation: (location: SavedLocation) => void
  removeLocation: (id: string) => void
  isLocationSaved: (lat: number, lng: number) => boolean
  getLocationByCoords: (lat: number, lng: number) => SavedLocation | null
}
```

---

## ALL LIBRARIES

### parking-rules.ts (`/lib/parking-rules.ts`)

**Main Function:**
```typescript
function checkParking(
  lat: number,
  lng: number,
  userAccessibility?: UserAccessibility
): ParkingResult
```

**Returns:**
```typescript
interface ParkingResult {
  status: "allowed" | "restricted" | "prohibited"
  message: string
  explanation: string
  timeRemaining?: number  // seconds
  restrictions: string[]
  warnings: ParkingWarning[]
  confidence: number      // 0-100
  zone?: ParkingZone
}

interface ParkingWarning {
  type: "tow_zone" | "street_cleaning" | "meter_expires" | "permit_required" | "rush_hour" | "event" | "handicap_only"
  severity: "critical" | "warning" | "info"
  message: string
  timeUntil?: number
}
```

**Other Exports:**
- `getUserAccessibility(): UserAccessibility`
- `setUserAccessibility(settings: Partial<UserAccessibility>): void`
- `formatTimeRemaining(seconds: number): string`

### protection.ts (`/lib/protection.ts`)

**Functions:**
```typescript
function startParkingSession(location: string, coordinates: {lat: number, lng: number}, result: ParkingResult): ProtectionSession
function getActiveSession(): Promise<ProtectionSession | null>
function getActiveSessionSync(): ProtectionSession | null
function endParkingSession(): Promise<void>
function getSessionTimeRemaining(): number | null
function setSessionReminder(): void
function getProtectionStatus(): UserProtection
function getRemainingChecks(): number
function canMakeCheck(): boolean
function upgradeToProTier(): void
```

**Types:**
```typescript
interface ProtectionSession {
  id: string
  location: string
  coordinates: { lat: number; lng: number }
  startTime: Date
  endTime?: Date
  result: ParkingResult
  isProtected: boolean
  reminderSet: boolean
}

interface UserProtection {
  tier: "free" | "pro" | "fleet"
  checksUsed: number
  checksLimit: number
  claimsUsed: number
  claimsLimit: number
  protectionAmount: number
}
```

### auth.ts (`/lib/auth.ts`)

**Functions:**
```typescript
function signUp(email: string, password: string, name: string): Promise<User | null>
function signIn(email: string, password: string): Promise<User | null>
function signOut(): Promise<void>
function getCurrentUser(): Promise<User | null>
function getCurrentUserSync(): User | null
function updateUser(updates: Partial<User>): Promise<User | null>
function isOnboardingComplete(): boolean
function completeOnboarding(): void
function incrementStats(stat: "checks" | "ticketsAvoided" | "moneySaved", amount?: number): void
```

**Types:**
```typescript
interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  tier: "free" | "pro" | "fleet"
  stats: {
    checks: number
    ticketsAvoided: number
    moneySaved: number
  }
}
```

### gamification.ts (`/lib/gamification.ts`)

**Functions:**
```typescript
function getGamificationState(): GamificationState
function getUserBadges(): Badge[]
function updateStreak(): { streakUpdated: boolean; newBadges: Badge[] }
function incrementGamificationStat(stat: string): { newBadges: Badge[] }
function getLeaderboard(type?: "global" | "local" | "friends"): Promise<LeaderboardEntry[]>
function getReferralStats(): ReferralStats
function getReferralCode(): string
function applyReferralCode(code: string): boolean
function getMoneySavedStats(): SavingsStats
```

**Types:**
```typescript
interface GamificationState {
  karma: number
  level: number
  levelName: string
  nextLevelKarma: number
  streak: number
  longestStreak: number
  badges: string[]
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: "milestone" | "streak" | "community" | "special"
  requirement: number
  unlocked: boolean
  unlockedAt?: Date
}
```

**All 21 Badges:**
1. first_check - First Check
2. checks_10 - Regular Parker
3. checks_50 - Parking Pro
4. checks_100 - Parking Master
5. checks_500 - Parking Legend
6. streak_3 - On a Roll (3 day streak)
7. streak_7 - Week Warrior (7 day streak)
8. streak_30 - Monthly Master (30 day streak)
9. streak_100 - Streak Legend (100 day streak)
10. report_1 - Community Helper
11. reports_10 - Active Reporter
12. reports_50 - Community Champion
13. upvotes_10 - Trusted Source
14. upvotes_100 - Community Leader
15. photo_1 - Evidence Collector
16. photos_10 - Photo Pro
17. referral_1 - Friend Finder
18. referrals_5 - Social Star
19. no_tickets - Perfect Record
20. early_adopter - Early Adopter
21. night_owl - Night Owl (check after midnight)

### community.ts (`/lib/community.ts`)

**Functions:**
```typescript
function reportEnforcement(type: EnforcementType, location: {lat: number, lng: number}, notes?: string): Promise<EnforcementSighting>
function getEnforcementSightings(): Promise<EnforcementSighting[]>
function voteOnSighting(id: string, vote: "up" | "down"): Promise<void>
function reportMeterStatus(meterId: string, status: MeterStatus): Promise<void>
function getNearbyMeters(lat: number, lng: number): Promise<MeterReport[]>
function savePhoto(photo: PhotoEvidence): Promise<void>
function getPhotos(): Promise<PhotoEvidence[]>
function deletePhoto(id: string): Promise<void>
function reportIssue(issue: DataIssueReport): Promise<void>
```

**Types:**
```typescript
type EnforcementType = "parking_officer" | "tow_truck" | "meter_maid" | "police"
type MeterStatus = "working" | "broken" | "card_only" | "coins_only" | "free"

interface EnforcementSighting {
  id: string
  type: EnforcementType
  location: { lat: number; lng: number }
  reportedAt: Date
  expiresAt: Date
  upvotes: number
  downvotes: number
  notes?: string
}

interface PhotoEvidence {
  id: string
  dataUrl: string
  location?: { lat: number; lng: number }
  address?: string
  timestamp: Date
  tags: string[]
  notes?: string
}
```

### mapping.ts (`/lib/mapping.ts`)

**Functions:**
```typescript
function getNearbyParkingSpots(lat: number, lng: number, radius?: number): ParkingSpot[]
function getNearbyGarages(lat: number, lng: number, radius?: number): ParkingGarage[]
function getNearbyEVStations(lat: number, lng: number, radius?: number): EVStation[]
function getNavigationUrl(lat: number, lng: number, label?: string): string
```

**Types:**
```typescript
interface ParkingSpot {
  id: string
  type: "street" | "lot" | "garage"
  location: { lat: number; lng: number }
  address: string
  available: boolean
  price?: number
  timeLimit?: number
  distance?: number
}

interface ParkingGarage {
  id: string
  name: string
  location: { lat: number; lng: number }
  address: string
  totalSpaces: number
  availableSpaces: number
  pricePerHour: number
  isOpen: boolean
  hours: string
  distance?: number
}

interface EVStation {
  id: string
  name: string
  location: { lat: number; lng: number }
  address: string
  connectorTypes: string[]
  available: number
  total: number
  pricePerKwh: number
  distance?: number
}
```

### accessibility.ts (`/lib/accessibility.ts`)

**Functions:**
```typescript
function getAccessibilitySettings(): AccessibilitySettings
function setAccessibilitySettings(settings: Partial<AccessibilitySettings>): void
function applyAccessibilityStyles(settings: AccessibilitySettings): void
function translate(key: string, language?: string): string
function getSupportedLanguages(): { code: string; name: string; nativeName: string }[]
```

**Types:**
```typescript
interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  dyslexiaFont: boolean
  screenReaderMode: boolean
  language: string
}
```

**Supported Languages:**
- en (English)
- es (Spanish)
- fr (French)
- zh (Chinese)
- ko (Korean)
- ja (Japanese)
- de (German)
- pt (Portuguese)

### db.ts (`/lib/db.ts`)

**Database Abstraction Layer Functions:**
```typescript
// Users
function dbGetUser(): Promise<DbUser | null>
function dbGetUserSync(): DbUser | null
function dbCreateUser(user: Omit<DbUser, "id" | "createdAt">): Promise<DbUser>
function dbUpdateUser(id: string, updates: Partial<DbUser>): Promise<DbUser | null>

// Sessions
function dbGetSessions(): Promise<DbSession[]>
function dbCreateSession(session: Omit<DbSession, "id">): Promise<DbSession>
function dbUpdateSession(id: string, updates: Partial<DbSession>): Promise<DbSession | null>
function dbDeleteSession(id: string): Promise<void>

// History
function dbGetHistory(): Promise<DbHistoryItem[]>
function dbAddHistory(item: Omit<DbHistoryItem, "id">): Promise<DbHistoryItem>
function dbClearHistory(): Promise<void>

// Community
function dbGetSightings(): Promise<DbSighting[]>
function dbAddSighting(sighting: Omit<DbSighting, "id">): Promise<DbSighting>
function dbUpdateSighting(id: string, updates: Partial<DbSighting>): Promise<void>

// Photos
function dbGetPhotos(): Promise<DbPhoto[]>
function dbAddPhoto(photo: Omit<DbPhoto, "id">): Promise<DbPhoto>
function dbDeletePhoto(id: string): Promise<void>

// Meters
function dbGetMeters(): Promise<DbMeter[]>
function dbUpdateMeter(id: string, status: string): Promise<void>
```

---

## DATA TYPES & INTERFACES

### Main App State (page.tsx)
```typescript
type Tab = "home" | "community" | "history" | "settings"
type View = "home" | "status"

interface HistoryItem {
  id: string
  location: string
  street: string
  date: Date
  status: "allowed" | "restricted" | "prohibited"
  result: ParkingResult
  coordinates: { lat: number; lng: number }
}
```

### localStorage Keys
```typescript
const STORAGE_KEYS = {
  // Auth
  "park_user": User,
  "park_onboarding_complete": boolean,
  
  // Settings
  "park_notifications": "on" | "off",
  "park_selected_city": string,
  "park_accessibility": AccessibilitySettings,
  "park_user_accessibility": UserAccessibility,
  
  // Protection
  "park_protection": UserProtection,
  "park_active_session": ProtectionSession,
  "park_checks_this_month": number,
  "park_month_key": string,
  
  // Timer
  "park_timer": { endTime: number, notified20: boolean, notified10: boolean, notified5: boolean },
  
  // Gamification
  "park_gamification": GamificationState,
  "park_referral_code": string,
  "park_referred_by": string,
  
  // Community
  "park_sightings": EnforcementSighting[],
  "park_meters": MeterReport[],
  "park_photos": PhotoEvidence[],
  
  // History
  "park_history": HistoryItem[],
  
  // Saved Locations
  "park_saved_locations": SavedLocation[],
  
  // Biometric
  "park_biometric_enabled": boolean,
  "park_biometric_credential": string,
}
```

---

## STATE MANAGEMENT

### Main Page State Flow
```
1. App loads
2. Check auth state (getCurrentUserSync)
3. Check onboarding status (isOnboardingComplete)
4. Apply accessibility settings (applyAccessibilityStyles)
5. Update daily streak (updateStreak)
6. Load active session (getActiveSessionSync)
7. Start session update interval (60s)
```

### Parking Check Flow
```
1. User clicks "Check Parking"
2. Get current location (useGeolocation)
3. Check parking rules (checkParking)
4. Increment stats (incrementStats, incrementGamificationStat)
5. Add to history
6. Start protection session (startParkingSession)
7. Navigate to status screen
```

### Toast Notification Pattern
```typescript
import { showToast } from "@/components/ui/toast-notification"

showToast("success", "Title", "Description")
showToast("error", "Title", "Description")
showToast("warning", "Title", "Description")
showToast("info", "Title", "Description")
```

---

## FEATURE DOCUMENTATION

### Phase 1: Accessibility & Safety
- **Handicap Parking**: Toggle in settings, placard types (Permanent, Temporary, Disabled Veteran)
- **Tow Zone Alerts**: Critical warnings with estimated towing fees
- **Street Cleaning Alerts**: Warnings when cleaning starts within 2 hours
- **Permit Zone Detection**: Detection and messaging for permit-only areas

### Phase 2: Smart Features
- **AI Sign Scanning**: Camera capture → OCR simulation → rule interpretation
- **Voice Commands**: Web Speech API with 10+ recognized commands
- **Apple/Google Wallet**: Visual pass generation with QR code
- **PWA Widget**: /widget page with small/medium/large widget previews

### Phase 3: Community & Data
- **Enforcement Sightings**: Report and view with 2-hour expiry, voting
- **Meter Status**: Crowd-sourced reporting (working, broken, card-only, etc.)
- **Photo Evidence Vault**: Save photos with tags and location for disputes
- **Report Incorrect Data**: Submit corrections with optional photo

### Phase 4: Monetization & Scale
- **Fleet Management**: /fleet - vehicle tracking, driver management, analytics
- **Meter Payments**: Modal for paying meters with time selection
- **Insurance Integration**: /insurance - compliance scoring, activity history
- **City API**: /partners - B2B partnership landing page

### Phase 5: Native Mobile App (PWA)
- **Install Prompt**: Smart prompt after 30-60 seconds
- **Offline Mode**: Banner, cached location count
- **Biometric Login**: WebAuthn Face ID/Touch ID
- **Native Transitions**: CSS animations for page transitions

### Phase 6: Predictive AI
- **Parking Predictions**: Hourly availability based on patterns
- **Street Cleaning Alerts**: Proactive detection
- **Weather Suggestions**: Rain → covered, heat → shade, snow → restrictions
- **Smart Alerts Panel**: Real-time alerts on home screen

### Phase 7: Gamification
- **Karma Points**: Accumulate from checks and contributions
- **21 Badges**: Milestone, streak, community, special categories
- **Leaderboards**: Global rankings
- **Referral Program**: Shareable codes, bonus karma
- **Money Saved Tracker**: Total savings visualization

### Phase 8: Live Mapping
- **Real-time Map**: List of nearby spots
- **Filter Tabs**: All, Street, Garages, EV
- **Parking Garages**: Live capacity, pricing
- **EV Stations**: Connector types, availability
- **Navigation**: Deep links to Apple/Google Maps

### Phase 9: Financial Tools (Future)
- Ticket dispute generator
- Expense tracking
- Receipt scanning
- Tax deduction helper

### Phase 10: Accessibility
- **High Contrast Mode**: Black/white with thick borders
- **Large Text Mode**: 118.75% base font size
- **Reduced Motion**: Disables all animations
- **Dyslexia Font**: OpenDyslexic with extra spacing
- **Screen Reader Mode**: Enhanced focus indicators
- **8 Languages**: EN, ES, FR, ZH, KO, JA, DE, PT

---

## AUTHENTICATION SYSTEM

### Flow
```
1. First Launch → Onboarding (4 slides)
2. Onboarding Complete → Permission Requests
3. Permissions Complete → Auth Screen (Sign Up/Login)
4. Auth Success → Main App
5. Auth Skip → Main App (limited features)
```

### Session Management
- User stored in localStorage
- Sync version (getCurrentUserSync) for initial load
- Async version (getCurrentUser) for updates
- Password hashing simulated (would use bcrypt in production)

---

## DATABASE LAYER

### Architecture
```
Application Code
      ↓
lib/db.ts (Database Abstraction Layer)
      ↓
localStorage (Current Implementation)
      ↓
[Future: Supabase/PostgreSQL]
```

### Migration Path
1. All data operations go through db.ts functions
2. Functions are async to support real DB
3. Types mirror database schema
4. Swap localStorage calls for Supabase client calls

---

## ACCESSIBILITY SYSTEM

### CSS Classes Applied to <html>
```html
<html class="high-contrast large-text reduced-motion dyslexia-font screen-reader-mode">
```

### High Contrast Mode
- Pure black on white
- Thick borders
- Underlined links/buttons
- Strong status colors

### Large Text Mode
- 118.75% base font
- Scaled headings
- Increased line height

### Reduced Motion
- Animation duration: 0.01ms
- Transition duration: 0.01ms

### Screen Reader Mode
- 3px focus outlines
- Box shadow on focus
- Skip link visible on focus

---

## INTERNATIONALIZATION

### Translation Function
```typescript
import { translate } from "@/lib/accessibility"

const text = translate("canIParkHere") // Returns translated string
```

### Translation Keys
- canIParkHere
- checkParking
- scanSign
- setTimer
- parkingAllowed
- parkingRestricted
- parkingProhibited
- timeRemaining
- setReminder
- protection
- settings
- history
- community
- rewards
- map

---

## PWA CONFIGURATION

### manifest.json
```json
{
  "name": "Park - Can I park here?",
  "short_name": "Park",
  "description": "Clear answers. No tickets. No confusion.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

### Metadata (layout.tsx)
```typescript
export const metadata: Metadata = {
  title: "Park — Can I park here?",
  description: "Clear answers. No tickets. No confusion.",
  openGraph: {
    title: "Park — Can I park here?",
    description: "Clear answers. No tickets. No confusion.",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
}
```

---

## REVENUE MODEL

### Tiers
| Tier | Price | Checks | Protection | Claims |
|------|-------|--------|------------|--------|
| Free | $0 | 10/month | None | 0 |
| Pro | $4.99/mo | Unlimited | $100/ticket | 3/year |
| Fleet | $99-499/mo | Unlimited | $500/ticket | Unlimited |

### Revenue Streams
1. Pro Subscriptions
2. Fleet/Business Plans
3. Meter Payment Fees (2-3%)
4. City API Partnerships ($10K-50K/mo)
5. Insurance Data Licensing

---

## DEPLOYMENT

### Vercel (Recommended)
1. Connect GitHub repo
2. Deploy automatically on push
3. Environment variables (for future integrations):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm run start
```

---

## FUTURE ROADMAP

### Immediate (Backend Integration)
- [ ] Supabase for real data persistence
- [ ] Stripe for payments
- [ ] Real parking data API integration

### Short-term
- [ ] Push notifications (Firebase)
- [ ] Real-time meter payment integration
- [ ] City partnership data feeds

### Medium-term
- [ ] React Native mobile app
- [ ] CarPlay/Android Auto integration
- [ ] ML-based sign recognition

### Long-term
- [ ] City-wide parking optimization
- [ ] Autonomous vehicle integration
- [ ] Real-time spot reservation

---

## CODING CONVENTIONS

### Component Pattern
```typescript
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  prop1: string
  onAction: () => void
}

export function Component({ prop1, onAction }: ComponentProps) {
  const [state, setState] = useState(initialValue)
  
  useEffect(() => {
    // Effects
  }, [dependencies])
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

### Hook Pattern
```typescript
"use client"

import { useState, useEffect, useCallback } from "react"

interface HookReturn {
  value: string
  action: () => void
}

export function useCustomHook(): HookReturn {
  const [value, setValue] = useState("")
  
  const action = useCallback(() => {
    // Logic
  }, [])
  
  return { value, action }
}
```

### Async Function Pattern
```typescript
// Always provide sync version for initial load
export function getDataSync(): Data | null {
  const stored = localStorage.getItem(KEY)
  return stored ? JSON.parse(stored) : null
}

// Async version for updates
export async function getData(): Promise<Data | null> {
  // Future: Replace with Supabase call
  return getDataSync()
}
```

---

## DEBUGGING TIPS

### Console Logging
```typescript
console.log("[v0] Component mounted", { props })
console.log("[v0] State updated", { newState })
console.log("[v0] API response", { data })
```

### Common Issues
1. **Async/Sync mismatch**: Use sync versions for initial load, async for updates
2. **localStorage not available**: Check `typeof window !== "undefined"`
3. **Geolocation denied**: Show fallback UI with error message
4. **Notification permission**: Request only after user interaction

---

## CONTACT & SUPPORT

This documentation was created for the Park parking assistant app. For questions about implementation or extending the codebase, refer to the specific component or library documentation above.

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Total Lines of Code**: ~15,000+
**Total Components**: 35+
**Total Hooks**: 10
**Total Libraries**: 13
