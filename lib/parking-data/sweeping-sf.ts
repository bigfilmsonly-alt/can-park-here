import type { SweepingSchedule } from "./types"

/**
 * San Francisco street sweeping schedules.
 *
 * SFMTA sweeps every block on a fixed schedule — typically twice per month.
 * Each block has a specific day and time window (2-hour blocks).
 * Tickets: $76 (as of 2024).
 *
 * PATTERN: SF sweeping is organized by neighborhood/district.
 * Most residential streets are swept twice per month (1st & 3rd week, or 2nd & 4th week).
 * Commercial corridors may be swept weekly.
 *
 * This database covers the major neighborhoods.
 * In production, the full SFMTA dataset has 6,000+ individual block schedules
 * from their GIS data (data.sfgov.org).
 */

export const SF_SWEEPING: SweepingSchedule[] = [
  // ══════════════════════════════════════════════════════════════
  // MISSION DISTRICT
  // ══════════════════════════════════════════════════════════════
  { id: "sf-mission-val-e-1", city: "sf", neighborhood: "Mission", streetPattern: "valencia st", side: "even", day: 2, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-val-e-3", city: "sf", neighborhood: "Mission", streetPattern: "valencia st", side: "even", day: 2, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-val-o-1", city: "sf", neighborhood: "Mission", streetPattern: "valencia st", side: "odd", day: 5, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-val-o-3", city: "sf", neighborhood: "Mission", streetPattern: "valencia st", side: "odd", day: 5, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },

  { id: "sf-mission-mis-e-2", city: "sf", neighborhood: "Mission", streetPattern: "mission st", side: "even", day: 1, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-mis-e-4", city: "sf", neighborhood: "Mission", streetPattern: "mission st", side: "even", day: 1, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-mis-o-1", city: "sf", neighborhood: "Mission", streetPattern: "mission st", side: "odd", day: 4, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-mis-o-3", city: "sf", neighborhood: "Mission", streetPattern: "mission st", side: "odd", day: 4, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },

  { id: "sf-mission-guer-e", city: "sf", neighborhood: "Mission", streetPattern: "guerrero st", side: "even", day: 3, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-guer-e3", city: "sf", neighborhood: "Mission", streetPattern: "guerrero st", side: "even", day: 3, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-guer-o", city: "sf", neighborhood: "Mission", streetPattern: "guerrero st", side: "odd", day: 4, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-mission-guer-o3", city: "sf", neighborhood: "Mission", streetPattern: "guerrero st", side: "odd", day: 4, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },

  { id: "sf-mission-24th-e", city: "sf", neighborhood: "Mission", streetPattern: "24th st", side: "even", day: 2, weekOfMonth: 2, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-mission-24th-e4", city: "sf", neighborhood: "Mission", streetPattern: "24th st", side: "even", day: 2, weekOfMonth: 4, startTime: "10:00", endTime: "12:00", fine: 76 },

  { id: "sf-mission-16th-e", city: "sf", neighborhood: "Mission", streetPattern: "16th st", side: "both", day: 3, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly commercial

  // ══════════════════════════════════════════════════════════════
  // CASTRO / NOE VALLEY
  // ══════════════════════════════════════════════════════════════
  { id: "sf-castro-castro-e", city: "sf", neighborhood: "Castro", streetPattern: "castro st", side: "even", day: 3, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-castro-castro-e3", city: "sf", neighborhood: "Castro", streetPattern: "castro st", side: "even", day: 3, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-castro-castro-o", city: "sf", neighborhood: "Castro", streetPattern: "castro st", side: "odd", day: 4, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-castro-castro-o4", city: "sf", neighborhood: "Castro", streetPattern: "castro st", side: "odd", day: 4, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },

  { id: "sf-castro-18th-e", city: "sf", neighborhood: "Castro", streetPattern: "18th st", side: "even", day: 2, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-castro-18th-e3", city: "sf", neighborhood: "Castro", streetPattern: "18th st", side: "even", day: 2, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },

  // ══════════════════════════════════════════════════════════════
  // HAIGHT-ASHBURY
  // ══════════════════════════════════════════════════════════════
  { id: "sf-haight-haight-e", city: "sf", neighborhood: "Haight", streetPattern: "haight st", side: "even", day: 1, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-haight-haight-e4", city: "sf", neighborhood: "Haight", streetPattern: "haight st", side: "even", day: 1, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-haight-haight-o", city: "sf", neighborhood: "Haight", streetPattern: "haight st", side: "odd", day: 2, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-haight-haight-o4", city: "sf", neighborhood: "Haight", streetPattern: "haight st", side: "odd", day: 2, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },

  { id: "sf-haight-ash-e", city: "sf", neighborhood: "Haight", streetPattern: "ashbury st", side: "even", day: 3, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-haight-ash-e3", city: "sf", neighborhood: "Haight", streetPattern: "ashbury st", side: "even", day: 3, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },

  // ══════════════════════════════════════════════════════════════
  // MARINA / COW HOLLOW
  // ══════════════════════════════════════════════════════════════
  { id: "sf-marina-chest-e", city: "sf", neighborhood: "Marina", streetPattern: "chestnut st", side: "even", day: 1, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-marina-chest-e3", city: "sf", neighborhood: "Marina", streetPattern: "chestnut st", side: "even", day: 1, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-marina-union-e", city: "sf", neighborhood: "Cow Hollow", streetPattern: "union st", side: "even", day: 2, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-marina-union-e3", city: "sf", neighborhood: "Cow Hollow", streetPattern: "union st", side: "even", day: 2, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-marina-fill-e", city: "sf", neighborhood: "Marina", streetPattern: "fillmore st", side: "even", day: 3, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-marina-fill-e4", city: "sf", neighborhood: "Marina", streetPattern: "fillmore st", side: "even", day: 3, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-marina-lomb-e", city: "sf", neighborhood: "Marina", streetPattern: "lombard st", side: "even", day: 4, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-marina-lomb-e3", city: "sf", neighborhood: "Marina", streetPattern: "lombard st", side: "even", day: 4, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },

  // ══════════════════════════════════════════════════════════════
  // SOMA / SOUTH BEACH
  // ══════════════════════════════════════════════════════════════
  { id: "sf-soma-howard-e", city: "sf", neighborhood: "SOMA", streetPattern: "howard st", side: "even", day: 1, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-soma-folsom-e", city: "sf", neighborhood: "SOMA", streetPattern: "folsom st", side: "even", day: 2, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-soma-harrison-e", city: "sf", neighborhood: "SOMA", streetPattern: "harrison st", side: "even", day: 3, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-soma-bryant-e", city: "sf", neighborhood: "SOMA", streetPattern: "bryant st", side: "even", day: 4, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-soma-brannan-e", city: "sf", neighborhood: "SOMA", streetPattern: "brannan st", side: "even", day: 5, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly

  // ══════════════════════════════════════════════════════════════
  // FINANCIAL DISTRICT / NOB HILL
  // ══════════════════════════════════════════════════════════════
  { id: "sf-fidi-market-b", city: "sf", neighborhood: "Financial District", streetPattern: "market st", side: "both", day: 0, weekOfMonth: 0, startTime: "06:00", endTime: "08:00", fine: 76 }, // Sunday AM
  { id: "sf-fidi-mont-e", city: "sf", neighborhood: "Financial District", streetPattern: "montgomery st", side: "even", day: 0, weekOfMonth: 0, startTime: "06:00", endTime: "08:00", fine: 76 },
  { id: "sf-nob-cal-e", city: "sf", neighborhood: "Nob Hill", streetPattern: "california st", side: "even", day: 1, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-nob-cal-e4", city: "sf", neighborhood: "Nob Hill", streetPattern: "california st", side: "even", day: 1, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-nob-jones-e", city: "sf", neighborhood: "Nob Hill", streetPattern: "jones st", side: "even", day: 2, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-nob-jones-e3", city: "sf", neighborhood: "Nob Hill", streetPattern: "jones st", side: "even", day: 2, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },

  // ══════════════════════════════════════════════════════════════
  // RICHMOND / SUNSET (large residential areas)
  // ══════════════════════════════════════════════════════════════
  { id: "sf-rich-clem-e", city: "sf", neighborhood: "Richmond", streetPattern: "clement st", side: "even", day: 2, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-rich-clem-e3", city: "sf", neighborhood: "Richmond", streetPattern: "clement st", side: "even", day: 2, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-rich-geary-e", city: "sf", neighborhood: "Richmond", streetPattern: "geary blvd", side: "even", day: 3, weekOfMonth: 0, startTime: "10:00", endTime: "12:00", fine: 76 }, // weekly
  { id: "sf-rich-balboa-e", city: "sf", neighborhood: "Richmond", streetPattern: "balboa st", side: "even", day: 4, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-rich-balboa-e4", city: "sf", neighborhood: "Richmond", streetPattern: "balboa st", side: "even", day: 4, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },

  { id: "sf-sunset-irv-e", city: "sf", neighborhood: "Sunset", streetPattern: "irving st", side: "even", day: 1, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-sunset-irv-e3", city: "sf", neighborhood: "Sunset", streetPattern: "irving st", side: "even", day: 1, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-sunset-jud-e", city: "sf", neighborhood: "Sunset", streetPattern: "judah st", side: "even", day: 2, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-sunset-jud-e4", city: "sf", neighborhood: "Sunset", streetPattern: "judah st", side: "even", day: 2, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-sunset-nor-e", city: "sf", neighborhood: "Sunset", streetPattern: "noriega st", side: "even", day: 3, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-sunset-nor-e3", city: "sf", neighborhood: "Sunset", streetPattern: "noriega st", side: "even", day: 3, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-sunset-tar-e", city: "sf", neighborhood: "Sunset", streetPattern: "taraval st", side: "even", day: 4, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-sunset-tar-e4", city: "sf", neighborhood: "Sunset", streetPattern: "taraval st", side: "even", day: 4, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },

  // ══════════════════════════════════════════════════════════════
  // NORTH BEACH / TELEGRAPH HILL
  // ══════════════════════════════════════════════════════════════
  { id: "sf-nb-columb-e", city: "sf", neighborhood: "North Beach", streetPattern: "columbus ave", side: "even", day: 1, weekOfMonth: 0, startTime: "06:00", endTime: "08:00", fine: 76 }, // weekly early
  { id: "sf-nb-grant-e", city: "sf", neighborhood: "North Beach", streetPattern: "grant ave", side: "even", day: 2, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-nb-grant-e3", city: "sf", neighborhood: "North Beach", streetPattern: "grant ave", side: "even", day: 2, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-nb-stock-e", city: "sf", neighborhood: "North Beach", streetPattern: "stockton st", side: "even", day: 3, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-nb-stock-e4", city: "sf", neighborhood: "North Beach", streetPattern: "stockton st", side: "even", day: 3, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },

  // ══════════════════════════════════════════════════════════════
  // POTRERO HILL / DOGPATCH / BERNAL HEIGHTS
  // ══════════════════════════════════════════════════════════════
  { id: "sf-pot-potrero-e", city: "sf", neighborhood: "Potrero Hill", streetPattern: "potrero ave", side: "even", day: 1, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-pot-potrero-e3", city: "sf", neighborhood: "Potrero Hill", streetPattern: "potrero ave", side: "even", day: 1, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-bern-cortland-e", city: "sf", neighborhood: "Bernal Heights", streetPattern: "cortland ave", side: "even", day: 2, weekOfMonth: 2, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-bern-cortland-e4", city: "sf", neighborhood: "Bernal Heights", streetPattern: "cortland ave", side: "even", day: 2, weekOfMonth: 4, startTime: "08:00", endTime: "10:00", fine: 76 },

  // ══════════════════════════════════════════════════════════════
  // HAYES VALLEY / WESTERN ADDITION
  // ══════════════════════════════════════════════════════════════
  { id: "sf-hayes-hayes-e", city: "sf", neighborhood: "Hayes Valley", streetPattern: "hayes st", side: "even", day: 5, weekOfMonth: 1, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-hayes-hayes-e3", city: "sf", neighborhood: "Hayes Valley", streetPattern: "hayes st", side: "even", day: 5, weekOfMonth: 3, startTime: "08:00", endTime: "10:00", fine: 76 },
  { id: "sf-hayes-fell-e", city: "sf", neighborhood: "Hayes Valley", streetPattern: "fell st", side: "even", day: 1, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly (major street)
  { id: "sf-hayes-oak-e", city: "sf", neighborhood: "Hayes Valley", streetPattern: "oak st", side: "even", day: 2, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly

  // ══════════════════════════════════════════════════════════════
  // TENDERLOIN
  // ══════════════════════════════════════════════════════════════
  { id: "sf-tl-turk-e", city: "sf", neighborhood: "Tenderloin", streetPattern: "turk st", side: "even", day: 1, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-tl-eddy-e", city: "sf", neighborhood: "Tenderloin", streetPattern: "eddy st", side: "even", day: 2, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-tl-ellis-e", city: "sf", neighborhood: "Tenderloin", streetPattern: "ellis st", side: "even", day: 3, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-tl-ofarrell-e", city: "sf", neighborhood: "Tenderloin", streetPattern: "o'farrell st", side: "even", day: 4, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-tl-golden-e", city: "sf", neighborhood: "Tenderloin", streetPattern: "golden gate ave", side: "even", day: 5, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly

  // ══════════════════════════════════════════════════════════════
  // EXCELSIOR / BAYVIEW
  // ══════════════════════════════════════════════════════════════
  { id: "sf-exc-mission-e", city: "sf", neighborhood: "Excelsior", streetPattern: "mission st", side: "even", day: 3, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-exc-mission-e3", city: "sf", neighborhood: "Excelsior", streetPattern: "mission st", side: "even", day: 3, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-bay-3rd-e", city: "sf", neighborhood: "Bayview", streetPattern: "3rd st", side: "even", day: 4, weekOfMonth: 0, startTime: "08:00", endTime: "10:00", fine: 76 }, // weekly
  { id: "sf-bay-evans-e", city: "sf", neighborhood: "Bayview", streetPattern: "evans ave", side: "even", day: 5, weekOfMonth: 1, startTime: "10:00", endTime: "12:00", fine: 76 },
  { id: "sf-bay-evans-e3", city: "sf", neighborhood: "Bayview", streetPattern: "evans ave", side: "even", day: 5, weekOfMonth: 3, startTime: "10:00", endTime: "12:00", fine: 76 },
]
