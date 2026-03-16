# Park - Can I Park Here?

> Clear answers. No tickets. No confusion.

Park is a comprehensive mobile-first parking assistant app that helps users avoid parking tickets through real-time parking rule checking, AI-powered sign scanning, community-reported data, and a unique ticket protection guarantee.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Value Proposition](#core-value-proposition)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Features by Phase](#features-by-phase)
6. [Detailed Feature Documentation](#detailed-feature-documentation)
7. [Data Architecture](#data-architecture)
8. [Component Library](#component-library)
9. [Hooks](#hooks)
10. [Libraries & Utilities](#libraries--utilities)
11. [Styling & Design System](#styling--design-system)
12. [Authentication System](#authentication-system)
13. [Gamification System](#gamification-system)
14. [Accessibility Features](#accessibility-features)
15. [Multi-Language Support](#multi-language-support)
16. [Revenue Model](#revenue-model)
17. [API Structure](#api-structure)
18. [Local Storage Schema](#local-storage-schema)
19. [Environment Variables](#environment-variables)
20. [Deployment](#deployment)
21. [Future Roadmap](#future-roadmap)
22. [Development Notes](#development-notes)

---

## Overview

Park is a Progressive Web App (PWA) built with Next.js 16 that provides real-time parking guidance. The app uses geolocation to determine a user's position, evaluates parking rules for that location, and provides clear yes/no answers with time limits and warnings.

**Key Differentiator:** The Ticket Protection Guarantee - if a user follows Park's guidance and still receives a ticket, Park will reimburse the ticket cost (up to $100 per ticket, 3 claims per year for Pro users).

---

## Core Value Proposition

1. **Clarity** - One-tap parking checks with plain English answers
2. **Confidence** - Ticket protection guarantee backs every recommendation
3. **Convenience** - Timer reminders, wallet passes, voice commands
4. **Community** - Crowd-sourced enforcement sightings and meter status
5. **Compliance** - Handicap parking support, permit zone detection

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| State Management | React useState/useEffect + localStorage |
| PWA | Web App Manifest + Service Worker ready |
| Authentication | Custom auth with localStorage (Supabase-ready) |
| Database | localStorage abstraction layer (migration-ready for Supabase) |
| Geolocation | Browser Geolocation API + OpenStreetMap Nominatim |
| Notifications | Web Notifications API |
| Voice | Web Speech API |
| Biometrics | WebAuthn API |

---

## Project Structure

```
/
├── app/
│   ├── globals.css              # Global styles, CSS variables, animations, accessibility modes
│   ├── layout.tsx               # Root layout with metadata, fonts, OG tags
│   ├── page.tsx                 # Main app entry point (750+ lines)
│   ├── fleet/page.tsx           # Fleet management dashboard
│   ├── insurance/page.tsx       # Insurance integration page
│   ├── partners/page.tsx        # City/Enterprise API partnership page
│   └── widget/page.tsx          # PWA widget preview page
│
├── components/
│   ├── auth/
│   │   └── auth-screen.tsx      # Sign up/login screens
│   │
│   ├── onboarding/
│   │   ├── onboarding-flow.tsx  # First-time user walkthrough
│   │   └── permission-request.tsx # Location/notification permissions
│   │
│   ├── screens/
│   │   ├── home-screen.tsx      # Main home screen with actions
│   │   ├── status-screen.tsx    # Parking result display
│   │   ├── history-screen.tsx   # Parking check history
│   │   ├── settings-screen.tsx  # App settings (500+ lines)
│   │   ├── community-screen.tsx # Community reports & sightings
│   │   ├── account-screen.tsx   # User account management
│   │   ├── rewards-screen.tsx   # Gamification & badges
│   │   ├── predictions-screen.tsx # AI parking predictions
│   │   ├── map-screen.tsx       # Live parking map
│   │   ├── fleet-screen.tsx     # Business fleet management
│   │   ├── insurance-screen.tsx # Insurance integration
│   │   └── accessibility-screen.tsx # Accessibility settings
│   │
│   ├── ui/
│   │   ├── button.tsx           # shadcn button
│   │   ├── input.tsx            # shadcn input
│   │   ├── toast-notification.tsx # Custom toast system
│   │   ├── protection-badge.tsx # Ticket protection indicator
│   │   ├── skeleton-loaders.tsx # Loading skeletons
│   │   ├── empty-states.tsx     # Empty state components
│   │   └── error-states.tsx     # Error handling components
│   │
│   ├── bottom-nav.tsx           # Tab navigation
│   ├── timer-display.tsx        # Countdown timer component
│   ├── timer-modal.tsx          # Set timer modal
│   ├── scan-sign-modal.tsx      # AI sign scanning
│   ├── upgrade-modal.tsx        # Pro subscription upsell
│   ├── wallet-pass.tsx          # Apple/Google Wallet pass
│   ├── photo-vault.tsx          # Evidence photo storage
│   ├── report-issue-modal.tsx   # Report incorrect data
│   ├── meter-payment-modal.tsx  # Pay parking meters
│   ├── alerts-panel.tsx         # Smart alerts display
│   ├── voice-button.tsx         # Voice command button
│   ├── install-prompt.tsx       # PWA install prompt
│   ├── offline-indicator.tsx    # Offline status banner
│   ├── lock-screen.tsx          # Biometric lock
│   └── page-transition.tsx      # Animation wrapper
│
├── hooks/
│   ├── use-geolocation.ts       # Location tracking
│   ├── use-timer.ts             # Countdown timer with notifications
│   ├── use-saved-locations.ts   # Favorite locations
│   ├── use-voice-commands.ts    # Speech recognition
│   ├── use-biometric-auth.ts    # Face ID / Touch ID
│   ├── use-haptics.ts           # Vibration feedback
│   ├── use-offline.ts           # Offline detection
│   └── use-mobile.ts            # Mobile detection (shadcn)
│
├── lib/
│   ├── db.ts                    # Database abstraction layer (450+ lines)
│   ├── auth.ts                  # Authentication system
│   ├── parking-rules.ts         # Parking rule engine (660+ lines)
│   ├── protection.ts            # Ticket protection system
│   ├── community.ts             # Community data management
│   ├── gamification.ts          # Karma, badges, leaderboards
│   ├── predictions.ts           # AI parking predictions
│   ├── smart-alerts.ts          # Proactive alert system
│   ├── sign-parser.ts           # AI sign text parsing
│   ├── mapping.ts               # Map data & navigation
│   ├── fleet.ts                 # Fleet management
│   ├── accessibility.ts         # Accessibility utilities (460+ lines)
│   └── utils.ts                 # General utilities (cn function)
│
└── public/
    ├── manifest.json            # PWA manifest
    └── og-image.jpg             # Social sharing image
```

---

## Features by Phase

### Phase 1: Accessibility & Safety
- Handicap parking support with placard types (Permanent, Temporary, Disabled Veteran)
- Tow zone alerts with estimated fees ($300-500+)
- Street cleaning alerts (warning when starts within 2 hours)
- Permit zone detection with fine amounts

### Phase 2: Smart Features
- AI-powered street sign scanning with camera
- Voice commands ("Can I park here?", "Set timer", etc.)
- Apple/Google Wallet parking passes
- Home screen widget components (small/medium/large)

### Phase 3: Community & Data
- User-reported enforcement sightings (auto-expire after 2 hours)
- Crowd-sourced meter status (working/broken/card-only)
- Photo evidence vault for ticket disputes
- Report incorrect data feature

### Phase 4: Monetization & Scale
- Fleet/business account management
- Meter payment integration
- Insurance integration with compliance scoring
- City/Enterprise API partnership dashboard

### Phase 5: Native Mobile App (PWA)
- PWA manifest with install prompt
- Offline mode with cached data
- Biometric login (Face ID / Touch ID)
- Native-like transitions and haptics

### Phase 6: Predictive AI & Smart Alerts
- ML parking predictions (best/worst times)
- Proactive street cleaning alerts
- Weather-based parking suggestions
- Habit-based smart reminders

### Phase 7: Gamification & Rewards
- Karma points system
- 21 unlockable badges across 4 categories
- Global/local/friends leaderboards
- Referral program with bonus karma
- Money saved tracker

### Phase 8: Live Mapping
- Real-time parking availability map
- Parking garage integration with capacity
- EV charging station finder
- Navigation to open spots (Apple/Google Maps)

### Phase 9: Financial Tools (Planned)
- Automated ticket dispute letter generator
- Expense tracking and monthly reports
- Receipt scanning and organization
- Tax deduction helper for business parking

### Phase 10: Accessibility
- WCAG AAA compliance features
- High contrast mode
- Large text mode
- Reduced motion mode
- Dyslexia-friendly font option
- Screen reader optimization
- Multi-language support (8 languages)

---

## Detailed Feature Documentation

### Parking Check Flow

1. User taps "Check Parking" button
2. App requests geolocation permission (if not granted)
3. Browser Geolocation API returns coordinates
4. Reverse geocoding via OpenStreetMap Nominatim API
5. `checkParking()` evaluates rules for location
6. Result displayed with status (allowed/restricted/prohibited)
7. Session started if parking is allowed
8. History item created
9. Gamification stats updated

### Parking Rule Engine (`/lib/parking-rules.ts`)

The rule engine evaluates parking based on:

```typescript
interface ParkingResult {
  status: "allowed" | "restricted" | "prohibited"
  message: string
  explanation: string
  timeRemaining?: number // seconds until restriction
  warnings: ParkingWarning[]
  confidence: number // 0-100
}
```

**Rule Types:**
- Time-based restrictions (e.g., no parking 8am-6pm)
- Day-based restrictions (e.g., no parking Mon/Wed)
- Street cleaning schedules
- Metered parking with time limits
- Permit-only zones
- Handicap spaces (requires placard)
- Tow-away zones
- Fire hydrant proximity
- Loading zones
- Construction zones

**Zone System:**
```typescript
type ZoneType = 
  | "residential"
  | "commercial" 
  | "downtown"
  | "school"
  | "hospital"
  | "industrial"
```

### Timer System (`/hooks/use-timer.ts`)

- Persists to localStorage (survives page refresh)
- Notifications at 20min, 10min, 5min, and 0min
- Visual countdown with urgency colors
- Cancel functionality

### Voice Commands (`/hooks/use-voice-commands.ts`)

Supported commands:
- "Check parking" / "Can I park here"
- "Scan sign" / "Read sign"
- "Set timer" / "Start timer"
- "Cancel timer" / "Stop timer"
- "History" / "Show history"
- "Settings"
- "Home"
- "Community"
- "Help"

### Sign Parser (`/lib/sign-parser.ts`)

Parses common parking sign patterns:
- "NO PARKING" / "NO STOPPING"
- "2 HOUR PARKING"
- Time ranges (e.g., "8AM-6PM")
- Days (e.g., "MON THRU FRI")
- "EXCEPT SUNDAY"
- "STREET CLEANING"
- "PERMIT ONLY"
- "LOADING ZONE"

---

## Data Architecture

### Database Abstraction Layer (`/lib/db.ts`)

The app uses a database abstraction layer that currently implements localStorage but is designed for easy migration to Supabase or another backend.

```typescript
// User operations
dbCreateUser(user: Omit<DBUser, "id" | "createdAt">): Promise<DBUser>
dbGetUser(): Promise<DBUser | null>
dbUpdateUser(updates: Partial<DBUser>): Promise<DBUser | null>
dbDeleteUser(): Promise<void>

// Session operations
dbCreateSession(session: Omit<DBSession, "id">): Promise<DBSession>
dbGetActiveSession(): Promise<DBSession | null>
dbUpdateSession(id: string, updates: Partial<DBSession>): Promise<DBSession | null>
dbEndSession(id: string): Promise<void>
dbGetSessionHistory(limit?: number): Promise<DBSession[]>

// Community operations
dbCreateSighting(sighting: Omit<DBSighting, "id" | "createdAt">): Promise<DBSighting>
dbGetSightings(location?: { lat: number; lng: number }, radiusKm?: number): Promise<DBSighting[]>
dbVoteSighting(id: string, vote: "up" | "down"): Promise<void>

// Meter operations
dbUpdateMeterStatus(meterId: string, status: MeterStatus): Promise<void>
dbGetNearbyMeters(lat: number, lng: number, radiusKm?: number): Promise<DBMeter[]>

// Photo vault operations
dbSavePhoto(photo: Omit<DBPhoto, "id" | "createdAt">): Promise<DBPhoto>
dbGetPhotos(): Promise<DBPhoto[]>
dbDeletePhoto(id: string): Promise<void>
```

### Type Definitions

```typescript
interface DBUser {
  id: string
  email: string
  name: string
  createdAt: Date
  plan: "free" | "pro"
  handicapPlacard?: {
    enabled: boolean
    type: "permanent" | "temporary" | "veteran"
  }
  stats: {
    checks: number
    ticketsAvoided: number
    moneySaved: number
  }
}

interface DBSession {
  id: string
  userId: string
  location: string
  coordinates: { lat: number; lng: number }
  startTime: Date
  endTime?: Date
  status: "allowed" | "restricted" | "prohibited"
  protectionActive: boolean
  reminderSet: boolean
  reminderTime?: Date
}

interface DBSighting {
  id: string
  type: "enforcement" | "tow_truck" | "meter_maid" | "police"
  location: { lat: number; lng: number }
  address: string
  reportedBy: string
  createdAt: Date
  expiresAt: Date
  upvotes: number
  downvotes: number
}
```

---

## Component Library

### Core UI Components (shadcn/ui)

- `Button` - Primary, secondary, outline, ghost, destructive variants
- `Input` - Text inputs with validation states
- `Card` - Content containers
- `Badge` - Status indicators
- `Switch` - Toggle controls
- `Select` - Dropdown selections
- `Tabs` - Tab navigation
- `Dialog` - Modal dialogs
- `Sheet` - Bottom sheets (mobile)
- `Skeleton` - Loading placeholders
- `Toast` - Notifications

### Custom Components

#### `ToastNotification`
```typescript
interface Toast {
  type: "success" | "error" | "info" | "warning"
  title: string
  message?: string
  duration?: number
}

showToast(type, title, message)
```

#### `ProtectionBadge`
Displays ticket protection status with shield icon and animated checkmark.

#### `TimerDisplay`
Countdown timer with color-coded urgency (green > yellow > red).

#### `AlertsPanel`
Renders active alerts for the current location.

---

## Hooks

### `useGeolocation`
```typescript
const {
  loading: boolean,
  error: string | null,
  getCurrentLocation: () => Promise<{
    latitude: number
    longitude: number
    address: string
    street: string
  }>
} = useGeolocation()
```

### `useTimer`
```typescript
const {
  isActive: boolean,
  remainingSeconds: number,
  startTimer: (minutes: number) => Promise<void>,
  cancelTimer: () => void,
  formatTimeDisplay: (seconds: number) => string
} = useTimer()
```

### `useSavedLocations`
```typescript
const {
  savedLocations: SavedLocation[],
  saveLocation: (location: SavedLocation) => void,
  removeLocation: (id: string) => void,
  isLocationSaved: (lat: number, lng: number) => boolean,
  getLocationByCoords: (lat: number, lng: number) => SavedLocation | undefined
} = useSavedLocations()
```

### `useVoiceCommands`
```typescript
const {
  isListening: boolean,
  isSupported: boolean,
  transcript: string,
  toggleListening: () => void
} = useVoiceCommands(onCommand: (action: string) => void)
```

### `useBiometricAuth`
```typescript
const {
  isSupported: boolean,
  isEnabled: boolean,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
  authenticate: () => Promise<boolean>,
  enable: () => Promise<void>,
  disable: () => void
} = useBiometricAuth()
```

### `useHaptics`
```typescript
const {
  vibrate: (pattern?: number | number[]) => void,
  lightTap: () => void,
  mediumTap: () => void,
  heavyTap: () => void,
  success: () => void,
  error: () => void
} = useHaptics()
```

### `useOffline`
```typescript
const {
  isOffline: boolean,
  cachedLocations: number
} = useOffline()
```

---

## Libraries & Utilities

### `parking-rules.ts` (660+ lines)
- `checkParking(lat, lng, userAccessibility?)` - Main parking check
- `getUserAccessibility()` - Get user's accessibility settings
- `setUserAccessibility(settings)` - Update accessibility settings
- `formatTimeRemaining(seconds)` - Human-readable time

### `protection.ts` (230+ lines)
- `startParkingSession(location, coordinates, result)` - Start protection
- `endParkingSession(id)` - End protection
- `getActiveSessionSync()` - Get current session
- `getSessionTimeRemaining()` - Time left in session
- `setSessionReminder(sessionId, minutes)` - Set reminder
- `getRemainingChecks()` - Free tier check count
- `canMakeCheck()` - Check if user can make another check
- `upgradeToProTier()` - Upgrade user
- `getProtectionStatus()` - Get protection tier info

### `community.ts` (370+ lines)
- `getEnforcementSightings()` - Get nearby sightings
- `reportEnforcementSighting(type, location, address)` - Report sighting
- `voteSighting(id, vote)` - Upvote/downvote
- `getNearbyMeters(lat, lng)` - Get meter status
- `updateMeterStatus(meterId, status)` - Update meter

### `gamification.ts` (390+ lines)
- `getGamificationState()` - Get user's gamification data
- `updateStreak()` - Update daily streak
- `incrementGamificationStat(stat)` - Add to stat
- `getUserBadges()` - Get all badges with unlock status
- `getLeaderboard(type)` - Get leaderboard
- `getReferralStats()` - Get referral data
- `generateReferralCode()` - Create referral code
- `applyReferralCode(code)` - Apply friend's code
- `getMoneySavedStats()` - Get savings data

### `predictions.ts`
- `getParkingPredictions(location)` - Get hourly predictions
- `getBestParkingTimes(location)` - Get optimal times
- `getWeeklyOverview(location)` - Weekly availability

### `smart-alerts.ts`
- `getActiveAlerts(location?)` - Get current alerts
- `subscribeToAlerts(callback)` - Real-time alerts
- `dismissAlert(id)` - Dismiss alert

### `sign-parser.ts`
- `parseSignText(text)` - Parse sign image text
- `interpretSign(parsedSign)` - Get parking rules from sign

### `mapping.ts` (280+ lines)
- `getNearbyParkingSpots(lat, lng)` - Get street parking
- `getNearbyGarages(lat, lng)` - Get parking garages
- `getNearbyEVStations(lat, lng)` - Get EV chargers
- `getNavigationUrl(lat, lng, label)` - Get maps URL

### `fleet.ts` (300+ lines)
- `getFleetAccount()` - Get business account
- `getFleetVehicles()` - Get all vehicles
- `addVehicle(vehicle)` - Add vehicle
- `removeVehicle(id)` - Remove vehicle
- `getFleetSessions()` - Get all active sessions
- `getFleetAnalytics()` - Get business analytics

### `accessibility.ts` (460+ lines)
- `getAccessibilitySettings()` - Get current settings
- `updateAccessibilitySettings(settings)` - Update settings
- `applyAccessibilityStyles(settings)` - Apply CSS classes
- `translate(key, language?)` - Get translated string
- `getSupportedLanguages()` - Get available languages

---

## Styling & Design System

### Design Philosophy
- **Johnny Ive / Apple-inspired** aesthetic
- Radical simplicity and clarity
- Generous whitespace
- Minimal color palette (3-5 colors)
- SF-style typography
- No visual noise

### Color Tokens (globals.css)

```css
:root {
  --background: oklch(0.995 0 0);
  --foreground: oklch(0.15 0 0);
  --card: oklch(1 0 0);
  --muted: oklch(0.965 0 0);
  --muted-foreground: oklch(0.5 0 0);
  --border: oklch(0.93 0 0);
  
  /* Status colors - soft and calm */
  --status-success: oklch(0.75 0.14 145);
  --status-warning: oklch(0.82 0.12 85);
  --status-error: oklch(0.75 0.12 25);
}
```

### Animation Classes

```css
.animate-fade-in
.animate-fade-in-up
.animate-fade-in-down
.animate-scale-in
.animate-slide-in-right
.animate-slide-in-left
.animate-slide-in-up
.animate-pulse-soft
.animate-bounce-soft
.animate-shake
.stagger-children
.press-effect
.transition-smooth
.hover-lift
```

### Accessibility Modes (CSS classes on body)

```css
.high-contrast    /* Black/white, underlined links */
.large-text       /* 118.75% base font size */
.reduced-motion   /* Disables animations */
.dyslexia-font    /* OpenDyslexic font */
.screen-reader-mode /* Enhanced focus indicators */
```

---

## Authentication System

### User Model
```typescript
interface User {
  id: string
  email: string
  name: string
  plan: "free" | "pro"
  createdAt: Date
  stats: {
    checks: number
    ticketsAvoided: number
    moneySaved: number
  }
}
```

### Auth Functions
```typescript
signUp(email, password, name): Promise<User | null>
signIn(email, password): Promise<User | null>
signOut(): Promise<void>
getCurrentUserSync(): User | null
updateUser(updates): Promise<User | null>
isOnboardingComplete(): boolean
completeOnboarding(): void
incrementStats(stat, amount?): void
```

### Auth Flow
1. First launch → Onboarding slides
2. Permission requests (location, notifications)
3. Sign up / Sign in (or skip)
4. Main app with optional biometric lock

---

## Gamification System

### Karma Points
- +10 per parking check
- +25 per community report
- +5 per upvoted sighting
- +50 per successful referral

### Badges (21 total)

**Milestone Badges:**
- First Check (1 check)
- Regular Parker (10 checks)
- Parking Pro (50 checks)
- Parking Master (100 checks)
- Parking Legend (500 checks)

**Streak Badges:**
- Week Warrior (7-day streak)
- Month Master (30-day streak)
- Streak Legend (100-day streak)

**Community Badges:**
- First Report (1 report)
- Community Helper (10 reports)
- Neighborhood Watch (50 reports)
- Community Champion (100 reports)

**Special Badges:**
- Early Adopter (join in first month)
- Referral Rookie (1 referral)
- Referral Pro (5 referrals)
- Referral Legend (25 referrals)
- Money Saver ($100 saved)
- Big Saver ($500 saved)
- Mega Saver ($1000 saved)
- Ticket Dodger (10 tickets avoided)
- Ticket Master (50 tickets avoided)

### Leaderboard
- Global ranking by karma
- Local ranking (same city)
- Friends ranking (connected users)

---

## Accessibility Features

### Settings
```typescript
interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  dyslexiaFont: boolean
  language: string
  hapticFeedback: boolean
  voiceAnnouncements: boolean
}
```

### Screen Reader Support
- All interactive elements have aria-labels
- Focus management for modals
- Live regions for status updates
- Skip-to-main-content link

### Keyboard Navigation
- Full tab navigation
- Enter/Space for buttons
- Escape to close modals
- Arrow keys for lists

---

## Multi-Language Support

### Supported Languages
| Code | Language |
|------|----------|
| en | English |
| es | Spanish (Español) |
| fr | French (Français) |
| zh | Chinese (中文) |
| ko | Korean (한국어) |
| ja | Japanese (日本語) |
| de | German (Deutsch) |
| pt | Portuguese (Português) |

### Translation Keys
```typescript
const translations = {
  "app.name": "Park",
  "app.tagline": "Can I park here?",
  "home.checkParking": "Check Parking",
  "home.scanSign": "Scan Sign",
  "home.setTimer": "Set Timer",
  "status.allowed": "You can park here",
  "status.restricted": "Limited parking",
  "status.prohibited": "Don't park here",
  // ... 100+ keys
}
```

---

## Revenue Model

### Subscription Tiers

| Feature | Free | Pro ($4.99/mo) |
|---------|------|----------------|
| Parking checks | 10/month | Unlimited |
| Ticket protection | No | Yes ($100/ticket, 3/year) |
| Ad-free | No | Yes |
| Priority support | No | Yes |
| Offline mode | Limited | Full |

### Fleet Plans

| Plan | Price | Vehicles | Features |
|------|-------|----------|----------|
| Starter | $99/mo | Up to 10 | Basic tracking |
| Professional | $249/mo | Up to 50 | Analytics, reports |
| Enterprise | $499+/mo | Unlimited | API access, custom |

### Additional Revenue Streams
- Meter payment fees (2-3% per transaction)
- City API partnerships ($10K-50K/month per city)
- Insurance data licensing ($25-100K/year per partner)

---

## API Structure

### External APIs Used

**OpenStreetMap Nominatim** (Reverse Geocoding)
```
GET https://nominatim.openstreetmap.org/reverse
  ?lat={latitude}
  &lon={longitude}
  &format=json
```

**Navigation URLs**
```
// Apple Maps
https://maps.apple.com/?daddr={lat},{lng}&dirflg=d

// Google Maps
https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=driving
```

### Internal API Structure (Ready for Backend)

```typescript
// Parking
POST /api/parking/check
GET  /api/parking/history
POST /api/parking/session/start
POST /api/parking/session/end

// Community
GET  /api/community/sightings
POST /api/community/sightings
POST /api/community/sightings/:id/vote
GET  /api/community/meters
POST /api/community/meters/:id/status

// User
GET  /api/user
PUT  /api/user
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout

// Gamification
GET  /api/gamification/state
GET  /api/gamification/badges
GET  /api/gamification/leaderboard
POST /api/gamification/referral

// Fleet
GET  /api/fleet/account
GET  /api/fleet/vehicles
POST /api/fleet/vehicles
GET  /api/fleet/analytics
```

---

## Local Storage Schema

```typescript
// Keys
park_user              // User object
park_session           // Active parking session
park_history           // Array of history items
park_saved_locations   // Saved favorite spots
park_timer             // Active timer state
park_gamification      // Karma, badges, streaks
park_sightings         // Community sightings
park_meters            // Meter statuses
park_photos            // Photo vault
park_accessibility     // Accessibility settings
park_notifications     // Notification preference
park_selected_city     // Selected city
park_onboarding_complete // Onboarding flag
park_biometric_enabled // Biometric auth flag
```

---

## Environment Variables

Currently none required (localStorage-based).

**For Supabase Migration:**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**For Stripe Integration:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Deploy with default Next.js settings
3. No environment variables needed for MVP

### PWA Installation
- iOS: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Install App

### OG Image
`/public/og-image.jpg` - 1200x630 social sharing image

---

## Future Roadmap

### Phase 9: Financial Tools
- [ ] Automated ticket dispute letter generator
- [ ] Expense tracking with categories
- [ ] Receipt scanning (OCR)
- [ ] Tax deduction calculator
- [ ] Monthly/annual reports
- [ ] Export to PDF/CSV

### Native App Conversion
- [ ] React Native / Expo build
- [ ] Native push notifications
- [ ] Background location tracking
- [ ] Apple Watch / Wear OS companion
- [ ] CarPlay / Android Auto integration

### Advanced AI
- [ ] Real parking data integration
- [ ] Machine learning predictions
- [ ] Computer vision sign reading
- [ ] Natural language parking queries

### Partnerships
- [ ] City government data feeds
- [ ] Parking garage APIs (SpotHero, ParkWhiz)
- [ ] Insurance company integrations
- [ ] Fleet management software integrations

---

## Development Notes

### Key Patterns

**Async/Sync Variants:**
Many functions have both async (for future backend) and sync (for current localStorage) versions:
- `getCurrentUser()` (async) vs `getCurrentUserSync()` (sync)
- `getActiveSession()` (async) vs `getActiveSessionSync()` (sync)

**Toast Notifications:**
```typescript
import { showToast } from "@/components/ui/toast-notification"
showToast("success", "Title", "Optional message")
```

**State Management:**
The app uses React's built-in state with localStorage persistence. Main state lives in `/app/page.tsx` and is passed down via props.

**Type Safety:**
All major data structures have TypeScript interfaces. Check `/lib/db.ts` for database types.

### Common Issues

1. **Async function called without await:**
   - Check if using sync variant when needed
   - Add `await` or use sync version

2. **Type mismatch on navigation:**
   - Tab types defined in `/components/bottom-nav.tsx`
   - Must match in main page state

3. **Missing props:**
   - Components often gain new required props
   - Check interface definitions when adding features

### Testing Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

For mobile testing, use network IP or ngrok for HTTPS (required for geolocation).

---

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [OpenStreetMap](https://www.openstreetmap.org/)

---

## License

Proprietary - All rights reserved.

---

## Contact

For questions about this codebase or partnership inquiries, contact the development team.

---

*Last updated: March 2026*
