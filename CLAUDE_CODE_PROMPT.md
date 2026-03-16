# Claude Code Analysis Prompt for Park App

## Instructions for Claude Code

I need you to analyze this complete parking app codebase and create a comprehensive blueprint for the next development phase. Review everything below, identify gaps, missing integrations, and provide a prioritized roadmap to make this production-ready.

---

## PROJECT SUMMARY

**App Name:** Park
**Tagline:** "Can I park here?" - Clear answers. No tickets. No confusion.
**Core Value Proposition:** A mobile-first parking assistant that tells users if they can park somewhere, for how long, and guarantees ticket protection if the app is wrong.

---

## WHAT HAS BEEN BUILT (Complete Feature List)

### Phase 1: Accessibility & Safety
- Handicap parking support with placard types (Permanent, Temporary, Disabled Veteran)
- Tow zone detection with fee estimates ($300-500+)
- Street cleaning alerts (2-hour warning, active alerts)
- Permit zone detection with fine amounts
- User accessibility settings stored in localStorage

### Phase 2: Smart Features
- AI-powered street sign scanning (simulated OCR with confidence scores)
- Voice commands using Web Speech API ("Check parking", "Scan sign", "Set timer", "History", "Settings", "Help")
- Apple/Google Wallet pass generation with visual preview
- Home screen widget component at /widget route
- PWA install prompt with iOS-specific instructions

### Phase 3: Community & Data
- User-reported enforcement sightings (meter maid, tow truck, police, parking enforcement)
- Crowd-sourced meter status (working, broken, card-only, coins-only, free)
- Photo evidence vault for ticket disputes
- Report incorrect data feature with photo upload
- Upvote/downvote system for community reports
- Auto-expiring sightings (2 hours)

### Phase 4: Monetization & Scale
- Fleet/business account management with vehicle tracking
- Three fleet tiers: Starter ($99/mo), Professional ($249/mo), Enterprise ($499/mo)
- Meter payment integration modal with time selection
- Insurance integration with compliance scoring
- City/Enterprise API partnership landing page at /partners

### Phase 5: Native Mobile App (PWA)
- Full PWA manifest with app icons
- Offline mode with cached location data
- Biometric authentication (Face ID/Touch ID) using WebAuthn
- Native-like page transitions
- Haptic feedback hooks
- Install prompt component

### Phase 6: Predictive AI & Smart Alerts
- ML parking predictions (hourly availability based on patterns)
- Proactive street cleaning alerts
- Weather-based parking suggestions
- Habit-based smart reminders
- Alerts panel on home screen

### Phase 7: Gamification & Rewards
- Karma points system (10 per check, 25 per report, etc.)
- 21 unlockable badges across 4 categories (milestone, streak, community, special)
- Global leaderboard with user rankings
- Referral program with shareable codes and bonus karma
- Money saved tracker
- Daily streak tracking with multipliers

### Phase 8: Live Mapping
- Real-time parking availability map (list-based, no external map library)
- Parking garage integration with live capacity
- EV charging station finder
- Navigation links to Apple/Google Maps
- Filter tabs (All, Street, Garages, EV)
- Distance-based sorting

### Phase 9: Financial Tools (NOT BUILT YET)
- Ticket dispute letter generator - NOT DONE
- Expense tracking - NOT DONE
- Receipt scanning - NOT DONE
- Tax deduction helper - NOT DONE

### Phase 10: Accessibility & Internationalization
- Screen reader optimization with ARIA labels
- High contrast mode
- Large text mode
- Reduced motion mode
- Dyslexia-friendly font option
- Multi-language support (8 languages: EN, ES, FR, ZH, KO, JA, DE, PT)
- Accessibility settings screen

### Additional Features Built
- Complete onboarding flow (4 slides)
- Permission request screens (location, notifications)
- Full authentication system (sign up, sign in, forgot password)
- Account management screen with profile editing
- Parking timer with countdown and multi-interval notifications (20min, 10min, 5min)
- History tracking with status indicators
- Settings screen with all preferences
- Toast notification system
- Skeleton loaders for all screens
- Empty states for all screens
- Error states with retry actions
- CSS animations (15+ types)

---

## COMPLETE FILE STRUCTURE

```
/app
├── globals.css (447 lines - design tokens, animations, accessibility modes)
├── layout.tsx (metadata, OG tags, fonts)
├── page.tsx (750+ lines - main app orchestration)
├── fleet/page.tsx
├── insurance/page.tsx
├── partners/page.tsx
├── widget/page.tsx

/components
├── bottom-nav.tsx
├── install-prompt.tsx
├── voice-button.tsx
├── timer-display.tsx
├── timer-modal.tsx
├── scan-sign-modal.tsx
├── upgrade-modal.tsx
├── meter-payment-modal.tsx
├── report-issue-modal.tsx
├── photo-vault.tsx
├── wallet-pass.tsx
├── alerts-panel.tsx
├── lock-screen.tsx
├── page-transition.tsx
├── offline-indicator.tsx
├── auth/
│   └── auth-screen.tsx
├── onboarding/
│   ├── onboarding-flow.tsx
│   └── permission-request.tsx
├── screens/
│   ├── home-screen.tsx
│   ├── status-screen.tsx
│   ├── history-screen.tsx
│   ├── settings-screen.tsx
│   ├── community-screen.tsx
│   ├── account-screen.tsx
│   ├── rewards-screen.tsx
│   ├── predictions-screen.tsx
│   ├── map-screen.tsx
│   ├── fleet-screen.tsx
│   ├── insurance-screen.tsx
│   └── accessibility-screen.tsx
├── ui/
│   ├── toast-notification.tsx
│   ├── protection-badge.tsx
│   ├── skeleton-loaders.tsx
│   ├── empty-states.tsx
│   └── error-states.tsx

/hooks
├── use-geolocation.ts
├── use-saved-locations.ts
├── use-timer.ts
├── use-voice-commands.ts
├── use-biometric-auth.ts
├── use-biometric.ts
├── use-haptics.ts
├── use-offline.ts

/lib
├── db.ts (database abstraction layer)
├── auth.ts (authentication)
├── parking-rules.ts (parking logic engine)
├── protection.ts (ticket protection system)
├── community.ts (community features)
├── gamification.ts (rewards system)
├── predictions.ts (AI predictions)
├── smart-alerts.ts (proactive alerts)
├── mapping.ts (map data)
├── fleet.ts (business accounts)
├── sign-parser.ts (OCR simulation)
├── accessibility.ts (a11y settings)

/public
├── manifest.json
├── og-image.jpg
```

---

## TECH STACK

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State:** React useState/useEffect + localStorage
- **Data Fetching:** Client-side with custom hooks
- **PWA:** Custom manifest + service worker hooks

---

## DATA STORAGE (Currently localStorage)

All data persisted in localStorage with these keys:
- `park_user` - User account
- `park_session` - Active parking session
- `park_history` - Parking check history
- `park_protection` - Protection/subscription status
- `park_gamification` - Karma, badges, streaks
- `park_community_*` - Community reports
- `park_photos` - Photo vault
- `park_timer` - Active timer
- `park_notifications` - Notification preferences
- `park_selected_city` - Selected city
- `park_accessibility` - Accessibility settings
- `park_onboarding_complete` - Onboarding status

---

## CURRENT LIMITATIONS & GAPS

### Not Connected to Real Backend
1. No real database (Supabase/Neon/PostgreSQL)
2. No real authentication (Auth0/Supabase Auth/NextAuth)
3. No real payment processing (Stripe)
4. No real parking data API
5. No real OCR for sign scanning
6. No real map integration (Mapbox/Google Maps)

### Features Not Built
1. Phase 9: Financial Tools (ticket disputes, expense tracking, receipts, tax helper)
2. Real push notifications (only browser notifications)
3. Actual ticket protection claims processing
4. Real fleet vehicle tracking
5. Real meter payment processing
6. Real insurance API integration
7. Real city data partnerships

### Missing Infrastructure
1. No API routes (all client-side)
2. No server actions
3. No email system (password reset, notifications)
4. No analytics/tracking
5. No error monitoring (Sentry)
6. No rate limiting
7. No GDPR compliance tools

---

## WHAT I NEED FROM YOU (Claude Code)

### 1. Gap Analysis
Review all code and identify:
- Missing error handling
- Security vulnerabilities
- Performance issues
- Accessibility gaps
- Type safety issues

### 2. Integration Blueprint
Create a prioritized plan for:
- Database integration (recommend Supabase vs Neon vs other)
- Authentication system (recommend approach)
- Payment processing (Stripe integration plan)
- Real parking data sources (APIs to integrate)
- Map integration (Mapbox vs Google Maps)
- Push notification service

### 3. Mobile App Conversion Plan
I will use Cursor to build the React Native/Expo version. Provide:
- Component mapping (web to native)
- Navigation structure for mobile
- Native-specific features to add
- Shared logic that can be reused
- Platform-specific considerations

### 4. Production Readiness Checklist
What's needed before launch:
- Security hardening
- Performance optimization
- SEO improvements
- Legal requirements (privacy policy, terms)
- App store requirements

### 5. Monetization Implementation
Step-by-step plan for:
- Stripe subscription setup
- In-app purchase flow
- Fleet billing system
- Revenue tracking

### 6. Data Architecture
Design the real database schema:
- Users table
- Sessions table
- History table
- Community reports table
- Subscriptions table
- Fleet/vehicles table

---

## REVENUE MODEL TO IMPLEMENT

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 10 checks/month, no protection |
| Pro | $4.99/mo | Unlimited checks, ticket protection ($100 limit), 3 claims/year |
| Fleet Starter | $99/mo | Up to 10 vehicles, basic analytics |
| Fleet Pro | $249/mo | Up to 50 vehicles, full analytics |
| Fleet Enterprise | $499+/mo | Unlimited vehicles, API access, dedicated support |

Additional Revenue:
- Meter payment fees: 2-3% per transaction
- City API access: $10K-50K/month per city
- Insurance data licensing: $25-100K/year per partner

---

## DESIGN SYSTEM REFERENCE

### Colors (CSS Variables)
```css
--background: oklch(0.995 0 0)
--foreground: oklch(0.15 0 0)
--primary: oklch(0.15 0 0)
--muted: oklch(0.965 0 0)
--muted-foreground: oklch(0.5 0 0)
--border: oklch(0.93 0 0)
--status-success: oklch(0.75 0.14 145)
--status-warning: oklch(0.82 0.12 85)
--status-error: oklch(0.75 0.12 25)
```

### Design Philosophy
- Apple/iOS inspired (Johnny Ive aesthetic)
- Minimal, calm, premium
- Generous whitespace
- Large readable typography
- Soft status colors (not aggressive)
- No visual noise

---

## QUESTIONS FOR CLAUDE CODE TO ANSWER

1. What is the most critical gap to address first?
2. What's the fastest path to a working MVP with real data?
3. How should we structure the codebase for both web and mobile?
4. What's the recommended testing strategy?
5. How do we handle the ticket protection guarantee legally?
6. What parking data APIs exist and how do we integrate them?
7. How do we build the AI sign scanning feature for real?
8. What's the best approach for offline-first architecture?
9. How do we handle multi-city expansion?
10. What analytics should we track from day one?

---

## DELIVERABLE REQUESTED

Please provide:

1. **Gap Analysis Report** - All issues found in current codebase
2. **Integration Blueprint** - Prioritized integration plan with timelines
3. **Database Schema** - Complete SQL schema for all tables
4. **API Design** - All endpoints needed
5. **Mobile Conversion Guide** - How to port to React Native
6. **Security Audit** - Vulnerabilities and fixes
7. **Launch Checklist** - Everything needed for production
8. **Cost Estimate** - Infrastructure costs at different scales

---

## CONTEXT FILES TO REVIEW

The following files contain the most important logic:

1. `/app/page.tsx` - Main app orchestration (750+ lines)
2. `/lib/parking-rules.ts` - Core parking logic
3. `/lib/protection.ts` - Ticket protection system
4. `/lib/db.ts` - Database abstraction
5. `/lib/gamification.ts` - Rewards system
6. `/lib/auth.ts` - Authentication
7. `/lib/community.ts` - Community features
8. `/app/globals.css` - Complete design system

---

## END OF PROMPT

Please analyze this entire codebase and provide a comprehensive blueprint for taking Park from prototype to production. Focus on practical, actionable steps with clear priorities.
