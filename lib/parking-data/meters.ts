import type { MeterZone } from "./types"

/**
 * Metered parking zones — San Francisco.
 * SFMTA standard: Mon-Sat 9am-6pm, $2-$3.50/hr demand-based.
 * Some areas have extended hours.
 */
export const SF_METER_ZONES: MeterZone[] = [
  // ── Standard SFMTA meters (most of the city) ──
  {
    id: "sf-standard",
    city: "sf",
    neighborhood: "Citywide",
    streetPattern: "*",
    days: [1, 2, 3, 4, 5, 6], // Mon-Sat
    startTime: "09:00",
    endTime: "18:00",
    ratePerHour: 2.50,
    maxMinutes: 120, // 2-hour limit
    paymentMethods: ["coin", "card", "PayByPhone"],
  },

  // ── Extended meter areas ──
  {
    id: "sf-fishwharf",
    city: "sf",
    neighborhood: "Fisherman's Wharf",
    streetPattern: "jefferson st|taylor st|mason st|beach st|north point st",
    days: [0, 1, 2, 3, 4, 5, 6], // 7 days
    startTime: "09:00",
    endTime: "22:00",
    ratePerHour: 3.50,
    maxMinutes: 120,
    paymentMethods: ["coin", "card", "PayByPhone"],
  },
  {
    id: "sf-downtown-core",
    city: "sf",
    neighborhood: "Financial District",
    streetPattern: "market st|montgomery st|kearny st|bush st|sansome st|battery st|front st",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "07:00",
    endTime: "18:00",
    ratePerHour: 3.50,
    maxMinutes: 60, // 1-hour limit downtown
    paymentMethods: ["coin", "card", "PayByPhone"],
  },
  {
    id: "sf-soma",
    city: "sf",
    neighborhood: "SOMA",
    streetPattern: "howard st|folsom st|harrison st|bryant st|brannan st|townsend st",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
    ratePerHour: 3.00,
    maxMinutes: 120,
    paymentMethods: ["coin", "card", "PayByPhone"],
  },
  {
    id: "sf-mission",
    city: "sf",
    neighborhood: "Mission",
    streetPattern: "mission st|valencia st|guerrero st|24th st|16th st",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
    ratePerHour: 2.50,
    maxMinutes: 120,
    paymentMethods: ["coin", "card", "PayByPhone"],
  },
  {
    id: "sf-castro",
    city: "sf",
    neighborhood: "Castro",
    streetPattern: "castro st|market st|18th st|noe st",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
    ratePerHour: 2.50,
    maxMinutes: 120,
    paymentMethods: ["coin", "card", "PayByPhone"],
  },
  {
    id: "sf-marina",
    city: "sf",
    neighborhood: "Marina",
    streetPattern: "chestnut st|union st|fillmore st|lombard st",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
    ratePerHour: 2.50,
    maxMinutes: 120,
    paymentMethods: ["coin", "card", "PayByPhone"],
  },
  {
    id: "sf-hayes",
    city: "sf",
    neighborhood: "Hayes Valley",
    streetPattern: "hayes st|octavia st|fell st|oak st",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
    ratePerHour: 3.00,
    maxMinutes: 120,
    paymentMethods: ["coin", "card", "PayByPhone"],
  },
]

/**
 * Metered parking zones — Miami metro.
 */
export const MIAMI_METER_ZONES: MeterZone[] = [
  // ── City of Miami ──
  {
    id: "mia-downtown",
    city: "miami",
    neighborhood: "Downtown",
    streetPattern: "brickell ave|se 1st st|flagler st|ne 2nd ave|miami ave",
    days: [1, 2, 3, 4, 5, 6], // Mon-Sat
    startTime: "08:00",
    endTime: "18:00",
    ratePerHour: 2.00,
    maxMinutes: 120,
    paymentMethods: ["ParkMobile", "coin", "card"],
  },
  {
    id: "mia-brickell",
    city: "miami",
    neighborhood: "Brickell",
    streetPattern: "brickell ave|sw 8th st|se 1st ave|coral way",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "08:00",
    endTime: "18:00",
    ratePerHour: 2.00,
    maxMinutes: 120,
    paymentMethods: ["ParkMobile", "coin", "card"],
  },
  {
    id: "mia-wynwood",
    city: "miami",
    neighborhood: "Wynwood",
    streetPattern: "nw 2nd ave|nw 3rd ave|nw 24th st|nw 26th st|nw 29th st",
    days: [0, 1, 2, 3, 4, 5, 6], // 7 days (high demand area)
    startTime: "08:00",
    endTime: "23:00",
    ratePerHour: 3.00,
    maxMinutes: 180,
    paymentMethods: ["ParkMobile", "card"],
  },
  {
    id: "mia-coconut-grove",
    city: "miami",
    neighborhood: "Coconut Grove",
    streetPattern: "grand ave|main hwy|commodore plaza|virginia st",
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "21:00",
    ratePerHour: 2.00,
    maxMinutes: 120,
    paymentMethods: ["ParkMobile", "coin", "card"],
  },
  {
    id: "mia-little-havana",
    city: "miami",
    neighborhood: "Little Havana",
    streetPattern: "sw 8th st|calle ocho",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
    ratePerHour: 1.50,
    maxMinutes: 120,
    paymentMethods: ["ParkMobile", "coin"],
  },
  {
    id: "mia-design-district",
    city: "miami",
    neighborhood: "Design District",
    streetPattern: "ne 40th st|ne 41st st|ne 2nd ave|n miami ave",
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: "10:00",
    endTime: "22:00",
    ratePerHour: 3.00,
    maxMinutes: 120,
    paymentMethods: ["ParkMobile", "card"],
  },

  // ── Miami Beach (verified rates effective Oct 1 2024) ──
  // Source: miamibeachfl.gov/city-hall/parking/parking-meter-rates/
  {
    id: "mb-entertainment",
    city: "miami-beach",
    neighborhood: "Entertainment District",
    streetPattern: "ocean dr|washington ave|collins ave|pennsylvania ave",
    days: [0, 1, 2, 3, 4, 5, 6], // 7 days
    startTime: "00:00",
    endTime: "23:59", // 24/7 enforcement!
    ratePerHour: 6.00,
    maxMinutes: 240,
    paymentMethods: ["ParkMobile", "PayByPhone", "card"],
  },
  {
    id: "mb-south-beach",
    city: "miami-beach",
    neighborhood: "South Beach",
    streetPattern: "collins ave|alton rd|west ave|meridian ave|euclid ave|jefferson ave|michigan ave",
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "03:00", // 9 AM - 3 AM
    ratePerHour: 4.00,
    maxMinutes: 240,
    paymentMethods: ["ParkMobile", "PayByPhone", "card"],
  },
  {
    id: "mb-east-mid-beach",
    city: "miami-beach",
    neighborhood: "East Mid Beach",
    streetPattern: "collins ave|indian creek dr",
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "03:00", // 9 AM - 3 AM
    ratePerHour: 3.00,
    maxMinutes: 180,
    paymentMethods: ["ParkMobile", "PayByPhone", "card"],
  },
  {
    id: "mb-west-mid-beach",
    city: "miami-beach",
    neighborhood: "West Mid Beach",
    streetPattern: "pine tree dr|prairie ave|bay dr",
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: "08:00",
    endTime: "18:00",
    ratePerHour: 2.00,
    maxMinutes: 180,
    paymentMethods: ["ParkMobile", "card"],
  },
  {
    id: "mb-north-beach",
    city: "miami-beach",
    neighborhood: "North Beach",
    streetPattern: "collins ave|harding ave|abbott ave|byron ave",
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: "08:00",
    endTime: "18:00",
    ratePerHour: 1.00,
    maxMinutes: 240,
    paymentMethods: ["ParkMobile", "card"],
  },

  // ── Coral Gables ──
  {
    id: "cg-downtown",
    city: "coral-gables",
    neighborhood: "Downtown Coral Gables",
    streetPattern: "miracle mile|ponce de leon blvd|galiano st|salzedo st|le jeune rd",
    days: [1, 2, 3, 4, 5, 6],
    startTime: "08:00",
    endTime: "20:00",
    ratePerHour: 1.50,
    maxMinutes: 120,
    paymentMethods: ["ParkMobile", "coin", "card"],
  },
]

export const ALL_METER_ZONES = [...SF_METER_ZONES, ...MIAMI_METER_ZONES]
