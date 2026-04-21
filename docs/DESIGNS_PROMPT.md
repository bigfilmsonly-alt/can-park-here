# Park — "Can I Park Here?" · Designs Prompt

Paste everything below into your designs tool. It's self-contained — no prior context needed.

---

## Project

**Park** is a mobile-first Progressive Web App that tells users whether they can legally park at their current location, and backs every recommendation with a **Ticket Protection Guarantee** (if you follow Park's guidance and still get a ticket, Park reimburses up to $100; Pro plan covers 3 claims/year).

Tagline: *"Clear answers. No tickets. No confusion."*

Core loop: User opens the app → taps **Check Parking** → geolocation + rule engine return a plain-English answer (Allowed / Restricted / Prohibited) with time limits, warnings, and optional timer.

## Stage & Scope

- Prototype in progress (Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Supabase-ready, Stripe, Leaflet maps, Anthropic SDK for sign-scanning).
- I need design work across three surfaces, in this priority order:
  1. **Web app** (PWA — mobile-first, runs in browser and installs to home screen)
  2. **iOS app** (future native version, but I want iOS-native mockups now to guide the PWA visual language)
  3. **Marketing site** (conversion-focused landing page)

## Deliverables (all four)

1. **Full UI mockups** — high-fidelity screens for the flows listed below
2. **User flows / wireframes** — low-fi structure before committing to high-fi
3. **Branding / visual identity** — logomark, wordmark, color system, type scale, spacing, tone-of-voice swatches
4. **Icon & illustration set** — custom app icon, status icons (allowed/restricted/prohibited), empty-state illustrations, badge illustrations for gamification

## Design Philosophy — Non-Negotiable

- **Jony Ive / Apple-inspired.** Radical simplicity and clarity.
- Generous whitespace. Minimal color palette (3–5 colors total). SF-style typography.
- No visual noise. One primary action per screen. Status-driven color, not decorative color.
- Status colors should feel **soft and calm**, not alarming — we're reducing anxiety, not adding it.
- Every screen should answer one question instantly. The hero screen's question: *Can I park here?* The answer must be readable in under half a second.

## Existing Color Tokens (match these)

```css
--background: oklch(0.995 0 0);   /* near-white */
--foreground: oklch(0.15 0 0);    /* near-black */
--card: oklch(1 0 0);
--muted: oklch(0.965 0 0);
--muted-foreground: oklch(0.5 0 0);
--border: oklch(0.93 0 0);

/* Status — soft, calm */
--status-success: oklch(0.75 0.14 145);  /* green */
--status-warning: oklch(0.82 0.12 85);   /* amber */
--status-error:   oklch(0.75 0.12 25);   /* red */
```

Expand this into a full system (hover, pressed, disabled, dark mode variants) but don't deviate from the mood.

## Key Screens to Mock (Web App / iOS)

Grouped by flow. Assume mobile-first 390×844 canvas for app screens.

**Onboarding**
- Welcome / value-prop slides (3–4 slides)
- Permission requests (location, notifications)
- Sign up / Sign in / "Skip for now"

**Home / Check Parking (most important screen)**
- Big primary action: Check Parking
- Secondary actions: Scan Sign, Set Timer
- Current location, saved spots, last check
- Voice button

**Status Result Screen (the "answer")**
- Three variants: Allowed / Restricted / Prohibited
- Plain-English headline, one-sentence explanation
- Time remaining until restriction changes
- Active warnings (street cleaning, tow zone, permit required, etc.)
- Confidence indicator
- CTA: Start session / Set timer / Navigate away

**Scan Sign (AI camera flow)**
- Camera viewfinder with sign-frame overlay
- Parsing state → interpreted result card

**Timer**
- Set timer modal (preset chips: 30m / 1h / 2h / custom)
- Active timer display (color-coded urgency: green → yellow → red)
- Notification previews (20m, 10m, 5m, 0m)

**Map Screen**
- Live parking availability pins
- Garage + EV station toggles
- Filter chips, bottom sheet for selected spot

**Community**
- Nearby enforcement sightings (meter maid, tow truck, police)
- Upvote/downvote, auto-expire after 2h
- Report sighting modal
- Meter status (working / broken / card-only)

**History**
- List of past checks with status pill, location, time
- Empty state

**Rewards / Gamification**
- Karma total, streak counter
- Badge grid (21 badges, 4 categories: Milestone, Streak, Community, Special)
- Leaderboard toggle (Global / Local / Friends)
- Money-saved tracker

**Settings + Account**
- Profile, plan (Free / Pro), referral code
- Accessibility: high contrast, large text, reduced motion, dyslexia font, language (8 langs: en, es, fr, zh, ko, ja, de, pt)
- Handicap placard setup (Permanent / Temporary / Disabled Veteran)
- Notifications, biometric lock

**Pro Upgrade**
- Free vs Pro comparison ($4.99/mo)
- Ticket Protection Guarantee callout
- Checkout sheet (Stripe)

**Photo Vault**
- Evidence photos grid for ticket disputes
- Add / delete flow

**Fleet Dashboard (web-only, desktop canvas)**
- Business account overview
- Vehicle list, active sessions map, analytics
- Pricing tiers: Starter $99, Pro $249, Enterprise $499+

**Widget Previews**
- Small / medium / large home-screen widgets showing live status

## Marketing Site (desktop-first, with responsive)

- Hero: phone mockup + tagline + "Install / Get it" CTA
- Ticket Protection Guarantee as the primary differentiator, front and center
- How it works (3 steps, animated)
- Feature grid (scan signs, timers, community, map, gamification)
- Pricing (Free / Pro / Fleet)
- Testimonials / press / trust strip
- Footer with partner pitch (Cities, Insurance, Fleet)

## Icon & Illustration Set

- **App icon**: should work at 16px–1024px. A single glyph that reads as "parking + protection / clarity." Avoid the literal P-in-a-square cliché if possible.
- **Status icons**: allowed (green check-shield), restricted (amber clock), prohibited (red no-entry)
- **Empty states**: illustrations for empty history, no saved spots, offline mode, no sightings nearby
- **Badge illustrations**: 21 badges across Milestone / Streak / Community / Special — consistent character, feel earned but not childish
- **Sign-type icons**: street cleaning, permit zone, tow-away, meter, loading zone, fire hydrant, handicap, EV, school zone, construction

## Branding Brief

- Name: **Park**
- Voice: calm, confident, direct. Never snarky. Never alarmed. "Don't park here" not "DANGER TICKET RISK."
- Personality: a quietly competent friend who just knows the answer.
- Wordmark: explore both a lowercase geometric sans and a more humanist treatment. Avoid anything that screams "tech startup."
- Suggest one primary brand color beyond the grayscale + status palette — something that can own the app icon and a few brand moments without fighting the neutral UI.

## Accessibility Requirements (must be designed for from the start)

- WCAG AAA contrast in high-contrast mode
- Large-text mode (118.75% base)
- Reduced motion mode (no fade/slide, instant transitions)
- Dyslexia-friendly font option (OpenDyslexic)
- Screen-reader focus states (visible, generous)
- Full keyboard nav
- Hit targets ≥ 44×44pt

Please show light + dark + high-contrast variants for at least the Home and Status Result screens.

## Constraints

- Must match existing code's shadcn/ui component vocabulary (Button, Card, Badge, Switch, Tabs, Dialog, Sheet, Skeleton, Toast).
- Status result screen must support the data shape: `{ status, message, explanation, timeRemaining, warnings[], confidence }`.
- Every screen must work offline-gracefully (show cached / last-known state, not a blocking error).
- Keep screen density low — users are standing on a sidewalk in a hurry.

## What I'd Like Back

1. Wireframes for the flows above (rough first, then refined)
2. High-fidelity mockups of at minimum: Onboarding slides (3), Home, Status Result (all 3 variants), Scan Sign, Timer (set + active), Map, Community, Rewards, Pro Upgrade, Settings, Marketing landing hero
3. Full brand system: logo + wordmark, color tokens (with dark + high-contrast), type scale, spacing, motion principles
4. Complete icon + illustration set per the list above
5. A tokens export (Figma variables or JSON) that I can hand back to a Tailwind config

If anything above conflicts, default to **simpler, calmer, more confident.**
