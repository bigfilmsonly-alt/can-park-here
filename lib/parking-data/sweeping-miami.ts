import type { SweepingSchedule } from "./types"

/**
 * Miami metro street sweeping schedules.
 *
 * Key differences from SF:
 * - Miami Beach does OVERNIGHT sweeping (2-6 AM, 3-7 AM, etc.)
 * - City of Miami sweeps are typically daytime
 * - Coral Gables has its own schedule
 * - Fines vary by city ($50-$65 in Miami, $65+ in Miami Beach)
 *
 * Miami Beach is organized into zones. South Beach zones sweep more frequently.
 */

export const MIAMI_SWEEPING: SweepingSchedule[] = [
  // ══════════════════════════════════════════════════════════════
  // MIAMI BEACH — SOUTH BEACH (south of 23rd St)
  // Most of South Beach sweeps 6 nights/week
  // ══════════════════════════════════════════════════════════════

  // Collins Ave (South Beach) — overnight sweeping
  ...[1, 2, 3, 4, 5, 6].map((day, i) => ({
    id: `mb-sb-collins-${day}`,
    city: "miami-beach" as const,
    neighborhood: "South Beach",
    streetPattern: "collins ave",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const, // every week
    startTime: "03:00",
    endTime: "07:00",
    fine: 65,
  })),

  // Washington Ave (South Beach) — overnight sweeping
  ...[1, 2, 3, 4, 5, 6].map((day) => ({
    id: `mb-sb-wash-${day}`,
    city: "miami-beach" as const,
    neighborhood: "South Beach",
    streetPattern: "washington ave",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "02:00",
    endTime: "06:00",
    fine: 65,
  })),

  // Ocean Drive — overnight sweeping
  ...[1, 2, 3, 4, 5, 6].map((day) => ({
    id: `mb-sb-ocean-${day}`,
    city: "miami-beach" as const,
    neighborhood: "South Beach",
    streetPattern: "ocean dr",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "04:00",
    endTime: "07:00",
    fine: 65,
  })),

  // Alton Rd (South Beach)
  ...[1, 3, 5].map((day) => ({
    id: `mb-sb-alton-${day}`,
    city: "miami-beach" as const,
    neighborhood: "South Beach",
    streetPattern: "alton rd",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "03:00",
    endTime: "06:00",
    fine: 65,
  })),

  // West Ave
  ...[2, 4].map((day) => ({
    id: `mb-sb-west-${day}`,
    city: "miami-beach" as const,
    neighborhood: "South Beach",
    streetPattern: "west ave",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "03:00",
    endTime: "06:00",
    fine: 65,
  })),

  // Meridian Ave
  ...[1, 3, 5].map((day) => ({
    id: `mb-sb-merid-${day}`,
    city: "miami-beach" as const,
    neighborhood: "South Beach",
    streetPattern: "meridian ave",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "02:00",
    endTime: "06:00",
    fine: 65,
  })),

  // ══════════════════════════════════════════════════════════════
  // MIAMI BEACH — MID BEACH (23rd - 63rd St)
  // ══════════════════════════════════════════════════════════════
  ...[1, 3, 5].map((day) => ({
    id: `mb-mid-collins-${day}`,
    city: "miami-beach" as const,
    neighborhood: "Mid Beach",
    streetPattern: "collins ave",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "03:00",
    endTime: "06:00",
    fine: 65,
  })),

  ...[2, 4].map((day) => ({
    id: `mb-mid-indian-${day}`,
    city: "miami-beach" as const,
    neighborhood: "Mid Beach",
    streetPattern: "indian creek dr",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "03:00",
    endTime: "06:00",
    fine: 65,
  })),

  // ══════════════════════════════════════════════════════════════
  // MIAMI BEACH — NORTH BEACH (63rd+)
  // Less frequent sweeping — 2x/week
  // ══════════════════════════════════════════════════════════════
  ...[2, 5].map((day) => ({
    id: `mb-north-collins-${day}`,
    city: "miami-beach" as const,
    neighborhood: "North Beach",
    streetPattern: "collins ave",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "06:00",
    endTime: "09:00",
    fine: 65,
  })),

  ...[1, 4].map((day) => ({
    id: `mb-north-harding-${day}`,
    city: "miami-beach" as const,
    neighborhood: "North Beach",
    streetPattern: "harding ave",
    side: "both" as const,
    day: day as 0|1|2|3|4|5|6,
    weekOfMonth: 0 as const,
    startTime: "06:00",
    endTime: "09:00",
    fine: 65,
  })),

  // ══════════════════════════════════════════════════════════════
  // CITY OF MIAMI — DOWNTOWN / BRICKELL
  // Daytime sweeping, typically twice per month
  // ══════════════════════════════════════════════════════════════
  { id: "mia-dt-brickell-e", city: "miami", neighborhood: "Brickell", streetPattern: "brickell ave", side: "even", day: 2, weekOfMonth: 1, startTime: "09:00", endTime: "12:00", fine: 50 },
  { id: "mia-dt-brickell-e3", city: "miami", neighborhood: "Brickell", streetPattern: "brickell ave", side: "even", day: 2, weekOfMonth: 3, startTime: "09:00", endTime: "12:00", fine: 50 },
  { id: "mia-dt-brickell-o", city: "miami", neighborhood: "Brickell", streetPattern: "brickell ave", side: "odd", day: 4, weekOfMonth: 2, startTime: "09:00", endTime: "12:00", fine: 50 },
  { id: "mia-dt-brickell-o4", city: "miami", neighborhood: "Brickell", streetPattern: "brickell ave", side: "odd", day: 4, weekOfMonth: 4, startTime: "09:00", endTime: "12:00", fine: 50 },

  { id: "mia-dt-flagler-e", city: "miami", neighborhood: "Downtown", streetPattern: "flagler st", side: "even", day: 1, weekOfMonth: 0, startTime: "07:00", endTime: "10:00", fine: 50 }, // weekly
  { id: "mia-dt-miami-e", city: "miami", neighborhood: "Downtown", streetPattern: "miami ave", side: "even", day: 3, weekOfMonth: 0, startTime: "07:00", endTime: "10:00", fine: 50 }, // weekly
  { id: "mia-dt-bisc-e", city: "miami", neighborhood: "Downtown", streetPattern: "biscayne blvd", side: "even", day: 2, weekOfMonth: 0, startTime: "07:00", endTime: "10:00", fine: 50 }, // weekly

  // ══════════════════════════════════════════════════════════════
  // WYNWOOD
  // ══════════════════════════════════════════════════════════════
  { id: "mia-wyn-2nd-e", city: "miami", neighborhood: "Wynwood", streetPattern: "nw 2nd ave", side: "even", day: 1, weekOfMonth: 1, startTime: "08:00", endTime: "11:00", fine: 50 },
  { id: "mia-wyn-2nd-e3", city: "miami", neighborhood: "Wynwood", streetPattern: "nw 2nd ave", side: "even", day: 1, weekOfMonth: 3, startTime: "08:00", endTime: "11:00", fine: 50 },
  { id: "mia-wyn-3rd-e", city: "miami", neighborhood: "Wynwood", streetPattern: "nw 3rd ave", side: "even", day: 3, weekOfMonth: 2, startTime: "08:00", endTime: "11:00", fine: 50 },
  { id: "mia-wyn-3rd-e4", city: "miami", neighborhood: "Wynwood", streetPattern: "nw 3rd ave", side: "even", day: 3, weekOfMonth: 4, startTime: "08:00", endTime: "11:00", fine: 50 },

  // ══════════════════════════════════════════════════════════════
  // COCONUT GROVE
  // ══════════════════════════════════════════════════════════════
  { id: "mia-cg-grand-e", city: "miami", neighborhood: "Coconut Grove", streetPattern: "grand ave", side: "even", day: 2, weekOfMonth: 1, startTime: "09:00", endTime: "12:00", fine: 50 },
  { id: "mia-cg-grand-e3", city: "miami", neighborhood: "Coconut Grove", streetPattern: "grand ave", side: "even", day: 2, weekOfMonth: 3, startTime: "09:00", endTime: "12:00", fine: 50 },
  { id: "mia-cg-main-e", city: "miami", neighborhood: "Coconut Grove", streetPattern: "main hwy", side: "even", day: 4, weekOfMonth: 2, startTime: "09:00", endTime: "12:00", fine: 50 },
  { id: "mia-cg-main-e4", city: "miami", neighborhood: "Coconut Grove", streetPattern: "main hwy", side: "even", day: 4, weekOfMonth: 4, startTime: "09:00", endTime: "12:00", fine: 50 },

  // ══════════════════════════════════════════════════════════════
  // LITTLE HAVANA
  // ══════════════════════════════════════════════════════════════
  { id: "mia-lh-calle-e", city: "miami", neighborhood: "Little Havana", streetPattern: "sw 8th st", side: "even", day: 3, weekOfMonth: 0, startTime: "07:00", endTime: "10:00", fine: 50 }, // weekly (commercial)
  { id: "mia-lh-calle-o", city: "miami", neighborhood: "Little Havana", streetPattern: "sw 8th st", side: "odd", day: 4, weekOfMonth: 0, startTime: "07:00", endTime: "10:00", fine: 50 }, // weekly

  // ══════════════════════════════════════════════════════════════
  // CORAL GABLES
  // ══════════════════════════════════════════════════════════════
  { id: "cg-miracle-e", city: "coral-gables", neighborhood: "Downtown", streetPattern: "miracle mile", side: "even", day: 1, weekOfMonth: 0, startTime: "06:00", endTime: "09:00", fine: 60 }, // weekly
  { id: "cg-miracle-o", city: "coral-gables", neighborhood: "Downtown", streetPattern: "miracle mile", side: "odd", day: 3, weekOfMonth: 0, startTime: "06:00", endTime: "09:00", fine: 60 }, // weekly
  { id: "cg-ponce-e", city: "coral-gables", neighborhood: "Downtown", streetPattern: "ponce de leon blvd", side: "even", day: 2, weekOfMonth: 1, startTime: "07:00", endTime: "10:00", fine: 60 },
  { id: "cg-ponce-e3", city: "coral-gables", neighborhood: "Downtown", streetPattern: "ponce de leon blvd", side: "even", day: 2, weekOfMonth: 3, startTime: "07:00", endTime: "10:00", fine: 60 },
  { id: "cg-lejeune-e", city: "coral-gables", neighborhood: "Downtown", streetPattern: "le jeune rd", side: "even", day: 4, weekOfMonth: 2, startTime: "07:00", endTime: "10:00", fine: 60 },
  { id: "cg-lejeune-e4", city: "coral-gables", neighborhood: "Downtown", streetPattern: "le jeune rd", side: "even", day: 4, weekOfMonth: 4, startTime: "07:00", endTime: "10:00", fine: 60 },
]
