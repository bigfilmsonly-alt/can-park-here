import type { DayOfWeek } from "./types"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Miami Metro Parking Database
// Covers: City of Miami, Miami Beach, Coral Gables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Local interfaces ──────────────────────────────────────────────────────────

export interface SignRule {
  id: string
  /** Sign category */
  category:
    | "meter"
    | "residential-permit"
    | "tow-away"
    | "street-sweeping"
    | "school-zone"
    | "construction"
    | "valet"
    | "loading"
    | "no-parking"
    | "time-limit"
    | "beach-access"
  /** The text that appears on the sign */
  signText: string
  /** Which city/area this sign is found in */
  area: string
  /** Days enforced */
  days: DayOfWeek[]
  /** Start time "HH:MM" 24hr, or null if 24/7 */
  startTime: string | null
  /** End time "HH:MM" 24hr, or null if 24/7 */
  endTime: string | null
  /** Time limit in minutes, 0 = no parking allowed */
  timeLimitMinutes: number | null
  /** Fine amount in dollars */
  fine: number
  /** Whether towing is possible */
  towRisk: boolean
  /** Additional notes */
  notes: string
}

export interface NightParkingRule {
  id: string
  /** Area this rule applies to */
  area: string
  /** Neighborhood or sub-area */
  neighborhood: string
  /** Start of overnight restriction "HH:MM" */
  startTime: string
  /** End of overnight restriction "HH:MM" */
  endTime: string
  /** Days of week the restriction applies */
  days: DayOfWeek[]
  /** Whether a residential permit exempts you */
  permitExempt: boolean
  /** Permit type name, if applicable */
  permitType: string | null
  /** What happens if you violate */
  consequence: "ticket" | "tow" | "ticket-and-tow"
  /** Fine amount */
  fine: number
  /** Description */
  description: string
}

export interface ParkingLot {
  id: string
  /** Facility name */
  name: string
  /** Street address */
  address: string
  /** City */
  city: string
  /** Latitude */
  lat: number
  /** Longitude */
  lng: number
  /** Type of facility */
  type: "garage" | "surface-lot" | "valet"
  /** Total number of spaces (approximate) */
  totalSpaces: number
  /** Operator */
  operator: string
  /** Hours of operation */
  hours: string
  /** Rate information */
  rates: {
    hourly: number | null
    dailyMax: number | null
    evening: number | null
    weekend: number | null
    monthly: number | null
    /** Human-readable rate notes */
    notes: string
  }
  /** Payment methods accepted */
  paymentMethods: string[]
  /** Whether EV charging is available */
  evCharging: boolean
  /** Whether ADA accessible */
  accessible: boolean
  /** Validation available from nearby businesses */
  validation: boolean
  /** Height restriction in feet, null if no restriction or surface lot */
  heightRestriction: number | null
}

export interface SpecialRule {
  id: string
  /** Rule title */
  title: string
  /** Category of special rule */
  category:
    | "event"
    | "seasonal"
    | "vehicle-type"
    | "accessibility"
    | "enforcement"
    | "legal"
    | "zone"
  /** Which areas it affects */
  affectedAreas: string[]
  /** When the rule is active (human-readable) */
  activeWhen: string
  /** Full description */
  description: string
  /** Fine or penalty amount, null if variable */
  fine: number | null
  /** Whether towing is a risk */
  towRisk: boolean
  /** Source / authority */
  source: string
}

interface CityWideRules {
  /** Max hours a vehicle can be parked in one spot before "abandoned" */
  maxParkingHours: number
  /** Minimum distance from fire hydrant (feet) */
  hydrantDistance: number
  /** Minimum distance from crosswalk (feet) */
  crosswalkDistance: number
  /** Minimum distance from bus stop (feet) */
  busStopDistance: number
  /** Overnight ban description */
  overnightBan: string
  /** Meter holiday policy */
  meterHolidays: string
  /** Handicap free hours at meters */
  handicapFreeHours: number
}

interface MiamiDatabase {
  signs: SignRule[]
  nightParking: NightParkingRule[]
  parkingLots: ParkingLot[]
  specialRules: SpecialRule[]
  cityWideRules: CityWideRules
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIAMI_DATABASE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MIAMI_DATABASE: MiamiDatabase = {

  // ══════════════════════════════════════════════════════════════════════════
  // CITY-WIDE RULES
  // ══════════════════════════════════════════════════════════════════════════

  cityWideRules: {
    maxParkingHours: 48,              // Florida: 48 hours (not 72 like CA)
    hydrantDistance: 10,              // feet (Florida)
    crosswalkDistance: 20,
    busStopDistance: 15,
    overnightBan: "Miami Beach: 2AM-6AM without RPZ permit",
    meterHolidays: "No holidays — meters enforced 365 days/year",
    handicapFreeHours: 4,             // Florida statute: 4 hours free at meters
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SIGNS (25+)
  // ══════════════════════════════════════════════════════════════════════════

  signs: [
    // ── Miami Beach Entertainment District: 24/7 metered ──
    {
      id: "sign-mb-entertainment-247",
      category: "meter",
      signText: "PARKING METER ENFORCED AT ALL TIMES — NO TIME LIMIT EXEMPTION",
      area: "Miami Beach — Entertainment District (5th-16th St, Ocean Dr to Alton Rd)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: null,
      endTime: null,
      timeLimitMinutes: 240,
      fine: 86,
      towRisk: false,
      notes: "Meters run 24/7, 365 days/year. $6.00/hr. Pay via ParkMobile or card at kiosk. No coin slots on newer meters.",
    },
    {
      id: "sign-mb-sobe-meter",
      category: "meter",
      signText: "2 HOUR PARKING 9AM-3AM — METER ENFORCED INCLUDING SUNDAYS & HOLIDAYS",
      area: "Miami Beach — South Beach (Collins Ave, Alton Rd corridor)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "09:00",
      endTime: "03:00",
      timeLimitMinutes: 120,
      fine: 86,
      towRisk: false,
      notes: "$4.00/hr. ParkMobile zone prominently posted. Enforcement officers patrol heavily on weekends.",
    },
    {
      id: "sign-mb-north-beach-meter",
      category: "meter",
      signText: "METERED PARKING 8AM-6PM DAILY — $1.00/HR",
      area: "Miami Beach — North Beach (71st St and above)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "08:00",
      endTime: "18:00",
      timeLimitMinutes: 240,
      fine: 86,
      towRisk: false,
      notes: "Lowest meter rate on Miami Beach. 4-hour max. Free parking after 6 PM but overnight ban still applies 2-6 AM.",
    },

    // ── Residential Zone Permit signs ──
    {
      id: "sign-mb-rpz-general",
      category: "residential-permit",
      signText: "RESIDENTIAL PARKING BY PERMIT ONLY — INCLUDING HOLIDAYS — 2 HOUR LIMIT WITHOUT PERMIT",
      area: "Miami Beach — Flamingo Park / Espanola Way residential streets",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "08:00",
      endTime: "02:00",
      timeLimitMinutes: 120,
      fine: 65,
      towRisk: false,
      notes: "RPZ zones are strictly enforced including all holidays. Visitors can park up to 2 hours without permit. Annual permit required for residents.",
    },
    {
      id: "sign-mb-rpz-overnight",
      category: "residential-permit",
      signText: "NO PARKING 2AM-6AM — EXCEPT BY RESIDENTIAL PERMIT",
      area: "Miami Beach — citywide residential streets",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "02:00",
      endTime: "06:00",
      timeLimitMinutes: 0,
      fine: 150,
      towRisk: true,
      notes: "Vehicles without RPZ permit or visitor pass WILL be towed between 2-6 AM. This is the citywide overnight ban.",
    },
    {
      id: "sign-mia-rpz-coconut-grove",
      category: "residential-permit",
      signText: "RESIDENTIAL PERMIT PARKING ONLY — ZONE CG — 6PM-8AM DAILY & ALL DAY WEEKENDS",
      area: "Miami — Coconut Grove residential (south of Grand Ave)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "18:00",
      endTime: "08:00",
      timeLimitMinutes: 120,
      fine: 50,
      towRisk: false,
      notes: "Evening and weekend enforcement to protect residents from restaurant/bar overflow parking.",
    },
    {
      id: "sign-cg-rpz",
      category: "residential-permit",
      signText: "RESIDENTIAL PERMIT PARKING ONLY — CORAL GABLES ZONE A — 2 HOUR LIMIT WITHOUT PERMIT",
      area: "Coral Gables — residential streets near Miracle Mile",
      days: [1, 2, 3, 4, 5, 6],
      startTime: "08:00",
      endTime: "20:00",
      timeLimitMinutes: 120,
      fine: 55,
      towRisk: false,
      notes: "Protects residents from downtown commercial spillover. Permit available through City of Coral Gables.",
    },

    // ── Tow-away signs near beaches ──
    {
      id: "sign-mb-beach-tow",
      category: "tow-away",
      signText: "TOW-AWAY ZONE — NO PARKING ANY TIME — BEACH ACCESS LANE",
      area: "Miami Beach — beach access points along Ocean Dr and Collins Ave",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: null,
      endTime: null,
      timeLimitMinutes: 0,
      fine: 250,
      towRisk: true,
      notes: "Beach access lanes must remain clear at all times. Tow + impound fees typically exceed $300 total.",
    },
    {
      id: "sign-mb-causeway-tow",
      category: "tow-away",
      signText: "TOW-AWAY ZONE — NO PARKING 7AM-9AM — RUSH HOUR CLEARANCE",
      area: "Miami Beach — MacArthur Causeway approach (5th St)",
      days: [1, 2, 3, 4, 5],
      startTime: "07:00",
      endTime: "09:00",
      timeLimitMinutes: 0,
      fine: 250,
      towRisk: true,
      notes: "Morning rush hour clearance for causeway traffic. Vehicles towed to Miami Beach impound lot.",
    },
    {
      id: "sign-mia-biscayne-tow",
      category: "tow-away",
      signText: "TOW-AWAY ZONE — NO PARKING 4PM-6PM MON-FRI",
      area: "Miami — Biscayne Blvd (Downtown to Edgewater)",
      days: [1, 2, 3, 4, 5],
      startTime: "16:00",
      endTime: "18:00",
      timeLimitMinutes: 0,
      fine: 250,
      towRisk: true,
      notes: "PM rush hour lane clearance on Biscayne Blvd. Very strictly enforced.",
    },

    // ── Street sweeping signs ──
    {
      id: "sign-mb-sweep-sobe",
      category: "street-sweeping",
      signText: "NO PARKING — STREET CLEANING — 3AM-7AM MON THRU SAT",
      area: "Miami Beach — South Beach (Collins Ave, Washington Ave, Ocean Dr)",
      days: [1, 2, 3, 4, 5, 6],
      startTime: "03:00",
      endTime: "07:00",
      timeLimitMinutes: 0,
      fine: 65,
      towRisk: true,
      notes: "Overnight sweeping in South Beach. Vehicles blocking sweeper will be ticketed and may be towed.",
    },
    {
      id: "sign-mb-sweep-north",
      category: "street-sweeping",
      signText: "NO PARKING — STREET CLEANING — 6AM-9AM TUE & FRI",
      area: "Miami Beach — North Beach (71st St and above, pilot program area)",
      days: [2, 5],
      startTime: "06:00",
      endTime: "09:00",
      timeLimitMinutes: 0,
      fine: 65,
      towRisk: false,
      notes: "North Beach pilot sweeping program. Less frequent than South Beach. Daytime hours.",
    },
    {
      id: "sign-mia-sweep-downtown",
      category: "street-sweeping",
      signText: "NO PARKING — STREET CLEANING — 7AM-10AM MONDAY",
      area: "Miami — Downtown (Flagler St corridor)",
      days: [1],
      startTime: "07:00",
      endTime: "10:00",
      timeLimitMinutes: 0,
      fine: 50,
      towRisk: false,
      notes: "City of Miami weekly sweeping on major downtown corridors.",
    },

    // ── School zone signs ──
    {
      id: "sign-mia-school-zone",
      category: "school-zone",
      signText: "SCHOOL ZONE — NO PARKING 7AM-8:30AM & 2PM-3:30PM — SCHOOL DAYS ONLY",
      area: "Miami — school zones citywide (within 500 ft of school entrance)",
      days: [1, 2, 3, 4, 5],
      startTime: "07:00",
      endTime: "08:30",
      timeLimitMinutes: 0,
      fine: 100,
      towRisk: true,
      notes: "Double fines in school zones. Also enforced 2PM-3:30PM during dismissal. Not enforced on school holidays, summer break, or weekends.",
    },
    {
      id: "sign-mb-school-zone",
      category: "school-zone",
      signText: "SCHOOL ZONE — NO STOPPING OR STANDING — DROP-OFF/PICK-UP ONLY",
      area: "Miami Beach — near Fienberg-Fisher Elementary, South Pointe Elementary",
      days: [1, 2, 3, 4, 5],
      startTime: "07:15",
      endTime: "08:15",
      timeLimitMinutes: 0,
      fine: 100,
      towRisk: false,
      notes: "Active loading only during school arrival/dismissal. Parents must remain with vehicle.",
    },

    // ── Construction zone signs ──
    {
      id: "sign-mia-construction",
      category: "construction",
      signText: "TEMPORARY NO PARKING — CONSTRUCTION ZONE — TOW-AWAY",
      area: "Miami — various construction sites (Brickell, Downtown, Wynwood)",
      days: [1, 2, 3, 4, 5, 6],
      startTime: "07:00",
      endTime: "18:00",
      timeLimitMinutes: 0,
      fine: 150,
      towRisk: true,
      notes: "Temporary signs posted 72 hours before enforcement begins. Common in rapidly developing Brickell/Wynwood corridors.",
    },
    {
      id: "sign-cg-construction",
      category: "construction",
      signText: "NO PARKING — ROAD WORK — TOW-AWAY ZONE",
      area: "Coral Gables — Miracle Mile streetscape project areas",
      days: [1, 2, 3, 4, 5],
      startTime: "09:00",
      endTime: "17:00",
      timeLimitMinutes: 0,
      fine: 100,
      towRisk: true,
      notes: "Coral Gables posts temporary construction signs for streetscape improvement projects.",
    },

    // ── Valet zone signs (common in South Beach) ──
    {
      id: "sign-mb-valet-ocean",
      category: "valet",
      signText: "VALET PARKING ONLY — 6PM-3AM — TOW-AWAY ZONE",
      area: "Miami Beach — Ocean Drive restaurant row (5th-15th St)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "18:00",
      endTime: "03:00",
      timeLimitMinutes: 0,
      fine: 150,
      towRisk: true,
      notes: "Evening valet zones for restaurants. Non-valet vehicles will be towed. Valet operators must have city permit.",
    },
    {
      id: "sign-mb-valet-washington",
      category: "valet",
      signText: "VALET ZONE — 7PM-2AM FRI & SAT — PERMIT #VZ-2024",
      area: "Miami Beach — Washington Ave nightclub district (8th-11th St)",
      days: [5, 6],
      startTime: "19:00",
      endTime: "02:00",
      timeLimitMinutes: 0,
      fine: 150,
      towRisk: true,
      notes: "Weekend nightlife valet zones. Spaces convert to regular metered parking during off-hours.",
    },
    {
      id: "sign-mia-valet-brickell",
      category: "valet",
      signText: "VALET ZONE — 5PM-12AM DAILY",
      area: "Miami — Brickell (Mary Brickell Village, S Miami Ave restaurant row)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "17:00",
      endTime: "00:00",
      timeLimitMinutes: 0,
      fine: 100,
      towRisk: true,
      notes: "Restaurant valet zones in Brickell dining district. Metered parking available before 5 PM.",
    },
    {
      id: "sign-cg-valet-miracle",
      category: "valet",
      signText: "VALET PARKING ZONE — 6PM-11PM — EXCEPT SUNDAYS",
      area: "Coral Gables — Miracle Mile (select blocks near restaurants)",
      days: [1, 2, 3, 4, 5, 6],
      startTime: "18:00",
      endTime: "23:00",
      timeLimitMinutes: 0,
      fine: 55,
      towRisk: false,
      notes: "Limited valet zones on Miracle Mile. Reverts to 2-hour metered parking outside valet hours.",
    },

    // ── Loading zone signs ──
    {
      id: "sign-mia-loading-downtown",
      category: "loading",
      signText: "COMMERCIAL LOADING ZONE — 7AM-6PM — 30 MIN LIMIT — COMMERCIAL VEHICLES ONLY",
      area: "Miami — Downtown (Flagler St, NE 1st Ave, Miami Ave)",
      days: [1, 2, 3, 4, 5, 6],
      startTime: "07:00",
      endTime: "18:00",
      timeLimitMinutes: 30,
      fine: 75,
      towRisk: false,
      notes: "Yellow curb commercial loading zones. Non-commercial vehicles cited immediately. Open to all vehicles after 6 PM.",
    },

    // ── No parking signs ──
    {
      id: "sign-mb-no-park-fire-lane",
      category: "no-parking",
      signText: "FIRE LANE — NO PARKING AT ANY TIME — TOW-AWAY ZONE",
      area: "Miami Beach — all fire lanes (condo buildings, commercial properties)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: null,
      endTime: null,
      timeLimitMinutes: 0,
      fine: 250,
      towRisk: true,
      notes: "Fire lanes are always enforced. Miami Beach Fire Rescue can request immediate tow.",
    },

    // ── Time limit signs ──
    {
      id: "sign-mia-wynwood-3hr",
      category: "time-limit",
      signText: "3 HOUR PARKING — 8AM-11PM DAILY — METERED",
      area: "Miami — Wynwood Art District (NW 2nd Ave corridor)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "08:00",
      endTime: "23:00",
      timeLimitMinutes: 180,
      fine: 65,
      towRisk: false,
      notes: "$3.00/hr. Extended hours due to nightlife and gallery walks. ParkMobile required.",
    },

    // ── Beach access parking signs ──
    {
      id: "sign-mb-beach-access",
      category: "beach-access",
      signText: "BEACH PARKING — 4 HOUR LIMIT — METERED 8AM-6PM — $2.00/HR",
      area: "Miami Beach — beachside parking along Collins Ave (North Beach)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "08:00",
      endTime: "18:00",
      timeLimitMinutes: 240,
      fine: 86,
      towRisk: false,
      notes: "Beachside parking with 4-hour max to encourage turnover. Free after 6 PM but overnight ban applies.",
    },
    {
      id: "sign-mb-beach-sunrise",
      category: "beach-access",
      signText: "SUNRISE PARKING — FREE 5AM-8AM — NO OVERNIGHT PARKING",
      area: "Miami Beach — Lummus Park beachside (Ocean Dr, 5th-15th St)",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "05:00",
      endTime: "08:00",
      timeLimitMinutes: 180,
      fine: 86,
      towRisk: false,
      notes: "Early morning beach-goers park free. Metered enforcement begins at 9 AM in this zone.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // NIGHT PARKING RULES (15+)
  // ══════════════════════════════════════════════════════════════════════════

  nightParking: [
    // ── Miami Beach citywide overnight ban ──
    {
      id: "night-mb-citywide",
      area: "Miami Beach",
      neighborhood: "Citywide",
      startTime: "02:00",
      endTime: "06:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: true,
      permitType: "Residential Parking Zone (RPZ) permit or visitor pass",
      consequence: "tow",
      fine: 150,
      description: "Miami Beach enforces a citywide overnight parking ban from 2 AM to 6 AM, 7 days/week. Vehicles without a valid RPZ permit or temporary visitor pass will be towed. This is the single most common reason tourists get towed in Miami Beach.",
    },
    {
      id: "night-mb-sobe-enhanced",
      area: "Miami Beach",
      neighborhood: "South Beach (south of 23rd St)",
      startTime: "02:00",
      endTime: "07:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: true,
      permitType: "RPZ permit",
      consequence: "tow",
      fine: 150,
      description: "South Beach has enhanced overnight enforcement. Street sweeping runs 3-7 AM, adding a sweeping ticket on top of the overnight ban ticket. Double jeopardy: possible tow + two tickets.",
    },
    {
      id: "night-mb-sobe-weekend",
      area: "Miami Beach",
      neighborhood: "South Beach — Entertainment District",
      startTime: "00:00",
      endTime: "06:00",
      days: [5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket-and-tow",
      fine: 200,
      description: "Weekend late-night enhanced enforcement in Entertainment District. Parking enforcement officers patrol continuously. Even metered spots require active payment 24/7 in this zone.",
    },

    // ── Brickell overnight ──
    {
      id: "night-mia-brickell-street",
      area: "Miami",
      neighborhood: "Brickell (street parking)",
      startTime: "02:00",
      endTime: "06:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: true,
      permitType: "Brickell residential permit",
      consequence: "ticket",
      fine: 50,
      description: "Street parking in Brickell is limited overnight. Meters are not enforced after 6 PM but vehicles cannot remain past 2 AM on most residential side streets without permit.",
    },
    {
      id: "night-mia-brickell-garage",
      area: "Miami",
      neighborhood: "Brickell (garages)",
      startTime: "00:00",
      endTime: "23:59",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket",
      fine: 0,
      description: "Brickell City Centre garage and most Brickell garages allow 24-hour parking with valid payment. Overnight flat rate typically $15-$20. Safest overnight option in Brickell.",
    },

    // ── Wynwood overnight ──
    {
      id: "night-mia-wynwood-street",
      area: "Miami",
      neighborhood: "Wynwood",
      startTime: "23:00",
      endTime: "08:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket",
      fine: 65,
      description: "Very limited overnight street parking in Wynwood. Most metered spots end at 11 PM. No residential permit program in Wynwood. Use nearby garages or lots for overnight.",
    },
    {
      id: "night-mia-wynwood-lot",
      area: "Miami",
      neighborhood: "Wynwood (private lots)",
      startTime: "00:00",
      endTime: "23:59",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket",
      fine: 0,
      description: "Several private lots in Wynwood offer overnight parking ($10-$20 flat). Check for posted signs; some lots close gates after midnight.",
    },

    // ── Coconut Grove ──
    {
      id: "night-mia-grove-residential",
      area: "Miami",
      neighborhood: "Coconut Grove (residential side streets)",
      startTime: "00:00",
      endTime: "06:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: true,
      permitType: "Coconut Grove RPZ permit",
      consequence: "ticket",
      fine: 50,
      description: "Residential streets south of Grand Ave restrict overnight parking. The Grove's narrow streets and active nightlife scene led to strict overnight enforcement.",
    },
    {
      id: "night-mia-grove-garage",
      area: "Miami",
      neighborhood: "Coconut Grove (CocoWalk Garage)",
      startTime: "00:00",
      endTime: "23:59",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket",
      fine: 0,
      description: "CocoWalk garage offers 24-hour access. Overnight rate approximately $15. Safest overnight option in the Grove.",
    },

    // ── Downtown Miami ──
    {
      id: "night-mia-downtown-street",
      area: "Miami",
      neighborhood: "Downtown (street parking)",
      startTime: "00:00",
      endTime: "08:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket",
      fine: 50,
      description: "Metered street parking downtown is not enforced after 6 PM but most spots have posted time limits. Extended overnight stay risks ticket for exceeding posted limit.",
    },
    {
      id: "night-mia-downtown-courthouse-garage",
      area: "Miami",
      neighborhood: "Downtown (Courthouse Center Garage)",
      startTime: "00:00",
      endTime: "23:59",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket",
      fine: 0,
      description: "Miami Courthouse Center Garage at 40 NW 3rd St is open 24/7 and allows overnight parking. Daily max $20.",
    },

    // ── Coral Gables ──
    {
      id: "night-cg-downtown",
      area: "Coral Gables",
      neighborhood: "Downtown (Miracle Mile area)",
      startTime: "02:00",
      endTime: "06:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: true,
      permitType: "Coral Gables residential permit",
      consequence: "ticket",
      fine: 55,
      description: "Overnight parking restricted on residential streets near Miracle Mile. City garages close at midnight; street parking after 2 AM requires permit.",
    },
    {
      id: "night-cg-residential",
      area: "Coral Gables",
      neighborhood: "Residential neighborhoods",
      startTime: "00:00",
      endTime: "06:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: true,
      permitType: "Coral Gables residential permit",
      consequence: "ticket",
      fine: 55,
      description: "Coral Gables strictly enforces overnight parking on residential streets. Known for proactive code enforcement. Boats and trailers on street prohibited overnight.",
    },
    {
      id: "night-cg-garage",
      area: "Coral Gables",
      neighborhood: "City garages",
      startTime: "00:00",
      endTime: "07:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "ticket",
      fine: 0,
      description: "Coral Gables municipal garages (Andalusia, Aragon) close at midnight. No overnight parking in city garages unless monthly permit holder. Gate access only.",
    },

    // ── Key Biscayne / Virginia Key ──
    {
      id: "night-mia-key-biscayne",
      area: "Miami",
      neighborhood: "Virginia Key / Rickenbacker Causeway",
      startTime: "19:00",
      endTime: "06:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      permitExempt: false,
      permitType: null,
      consequence: "tow",
      fine: 100,
      description: "No overnight parking along Rickenbacker Causeway or Virginia Key beach lots. Gates close at sunset on some lots. Vehicles left overnight will be towed.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // PARKING LOTS & GARAGES (25+)
  // Real facilities with real addresses, real coordinates, real rates
  // ══════════════════════════════════════════════════════════════════════════

  parkingLots: [
    // ── Miami Beach Municipal Garages ──
    {
      id: "lot-mb-7th-collins",
      name: "City of Miami Beach Garage — 7th Street",
      address: "510 7th St, Miami Beach, FL 33139",
      city: "Miami Beach",
      lat: 25.7798,
      lng: -80.1365,
      type: "garage",
      totalSpaces: 560,
      operator: "City of Miami Beach",
      hours: "24/7",
      rates: {
        hourly: 4.00,
        dailyMax: 28.00,
        evening: 20.00,
        weekend: 28.00,
        monthly: 175.00,
        notes: "Event pricing may apply during Art Basel, Ultra, etc. Early bird before 9 AM $15.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mb-13th-collins",
      name: "City of Miami Beach Garage — 13th Street",
      address: "1301 Collins Ave, Miami Beach, FL 33139",
      city: "Miami Beach",
      lat: 25.7855,
      lng: -80.1315,
      type: "garage",
      totalSpaces: 620,
      operator: "City of Miami Beach",
      hours: "24/7",
      rates: {
        hourly: 4.00,
        dailyMax: 28.00,
        evening: 20.00,
        weekend: 28.00,
        monthly: 175.00,
        notes: "Closest garage to Lincoln Road. Fills up quickly on weekend evenings.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mb-17th-collins",
      name: "City of Miami Beach Garage — 17th Street",
      address: "1735 Meridian Ave, Miami Beach, FL 33139",
      city: "Miami Beach",
      lat: 25.7905,
      lng: -80.1388,
      type: "garage",
      totalSpaces: 700,
      operator: "City of Miami Beach",
      hours: "24/7",
      rates: {
        hourly: 3.00,
        dailyMax: 24.00,
        evening: 18.00,
        weekend: 24.00,
        monthly: 150.00,
        notes: "Slightly lower rates than South Beach garages. Good alternative for Lincoln Road visitors.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mb-pennsylvania",
      name: "City of Miami Beach Garage — Pennsylvania Avenue",
      address: "1661 Pennsylvania Ave, Miami Beach, FL 33139",
      city: "Miami Beach",
      lat: 25.7896,
      lng: -80.1400,
      type: "garage",
      totalSpaces: 480,
      operator: "City of Miami Beach",
      hours: "24/7",
      rates: {
        hourly: 3.00,
        dailyMax: 24.00,
        evening: 18.00,
        weekend: 24.00,
        monthly: 150.00,
        notes: "Near Lincoln Road west end. Less crowded than Collins Ave garages.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: false,
      heightRestriction: 6.8,
    },
    {
      id: "lot-mb-42nd-sheridan",
      name: "City of Miami Beach Garage — 42nd Street",
      address: "4111 Sheridan Ave, Miami Beach, FL 33140",
      city: "Miami Beach",
      lat: 25.8140,
      lng: -80.1370,
      type: "garage",
      totalSpaces: 450,
      operator: "City of Miami Beach",
      hours: "6:00 AM - 12:00 AM",
      rates: {
        hourly: 2.00,
        dailyMax: 18.00,
        evening: 12.00,
        weekend: 18.00,
        monthly: 100.00,
        notes: "Mid Beach location. Lower rates than South Beach. Close to Fontainebleau area.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: false,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mb-71st-normandy",
      name: "City of Miami Beach Surface Lot — 71st Street/Normandy",
      address: "7101 Harding Ave, Miami Beach, FL 33141",
      city: "Miami Beach",
      lat: 25.8390,
      lng: -80.1325,
      type: "surface-lot",
      totalSpaces: 120,
      operator: "City of Miami Beach",
      hours: "6:00 AM - 10:00 PM",
      rates: {
        hourly: 1.00,
        dailyMax: 10.00,
        evening: null,
        weekend: 10.00,
        monthly: 60.00,
        notes: "Affordable North Beach lot. Closes at 10 PM — do not leave car overnight.",
      },
      paymentMethods: ["ParkMobile", "credit-card"],
      evCharging: false,
      accessible: true,
      validation: false,
      heightRestriction: null,
    },
    {
      id: "lot-mb-anchor",
      name: "Anchor Garage (South of Fifth)",
      address: "241 5th St, Miami Beach, FL 33139",
      city: "Miami Beach",
      lat: 25.7742,
      lng: -80.1372,
      type: "garage",
      totalSpaces: 350,
      operator: "City of Miami Beach",
      hours: "24/7",
      rates: {
        hourly: 4.00,
        dailyMax: 30.00,
        evening: 20.00,
        weekend: 30.00,
        monthly: 200.00,
        notes: "South of Fifth (SoFi) location. Premium pricing for one of Miami Beach's most desirable neighborhoods.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 6.8,
    },
    {
      id: "lot-mb-sunset-harbour",
      name: "Sunset Harbour Garage",
      address: "1900 Bay Rd, Miami Beach, FL 33139",
      city: "Miami Beach",
      lat: 25.7925,
      lng: -80.1455,
      type: "garage",
      totalSpaces: 300,
      operator: "City of Miami Beach",
      hours: "24/7",
      rates: {
        hourly: 3.00,
        dailyMax: 20.00,
        evening: 15.00,
        weekend: 20.00,
        monthly: 130.00,
        notes: "Sunset Harbour neighborhood. Popular with gym-goers and restaurant visitors.",
      },
      paymentMethods: ["ParkMobile", "credit-card"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },

    // ── City of Miami Garages ──
    {
      id: "lot-mia-courthouse",
      name: "Courthouse Center Garage",
      address: "40 NW 3rd St, Miami, FL 33128",
      city: "Miami",
      lat: 25.7748,
      lng: -80.1960,
      type: "garage",
      totalSpaces: 900,
      operator: "Miami Parking Authority",
      hours: "24/7",
      rates: {
        hourly: 3.00,
        dailyMax: 20.00,
        evening: 10.00,
        weekend: 12.00,
        monthly: 140.00,
        notes: "Largest downtown Miami garage. Near county courthouse and government buildings. Jury duty validation available.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 7.2,
    },
    {
      id: "lot-mia-college-station",
      name: "College Station Garage",
      address: "190 NE 3rd St, Miami, FL 33132",
      city: "Miami",
      lat: 25.7778,
      lng: -80.1900,
      type: "garage",
      totalSpaces: 600,
      operator: "Miami Parking Authority",
      hours: "24/7",
      rates: {
        hourly: 3.00,
        dailyMax: 18.00,
        evening: 8.00,
        weekend: 10.00,
        monthly: 120.00,
        notes: "Near MDC Wolfson Campus. Student discount with valid ID. Good Metromover access.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mia-cultural-center",
      name: "Cultural Center Garage",
      address: "50 NW 2nd Ave, Miami, FL 33128",
      city: "Miami",
      lat: 25.7760,
      lng: -80.1945,
      type: "garage",
      totalSpaces: 450,
      operator: "Miami Parking Authority",
      hours: "6:00 AM - 12:00 AM",
      rates: {
        hourly: 3.00,
        dailyMax: 18.00,
        evening: 8.00,
        weekend: 10.00,
        monthly: 120.00,
        notes: "Next to HistoryMiami Museum and Miami-Dade Cultural Center. Event pricing during special exhibitions.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mia-brickell-city-centre",
      name: "Brickell City Centre Garage",
      address: "701 S Miami Ave, Miami, FL 33131",
      city: "Miami",
      lat: 25.7670,
      lng: -80.1930,
      type: "garage",
      totalSpaces: 2400,
      operator: "Swire Properties / SP+",
      hours: "24/7",
      rates: {
        hourly: 4.00,
        dailyMax: 30.00,
        evening: 15.00,
        weekend: 25.00,
        monthly: 225.00,
        notes: "Massive garage attached to Brickell City Centre mall. Validation available from most mall tenants: 3 hrs free with $25 purchase. Valet option available at $25.",
      },
      paymentMethods: ["credit-card", "Apple Pay", "Google Pay"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 6.6,
    },
    {
      id: "lot-mia-mary-brickell",
      name: "Mary Brickell Village Garage",
      address: "901 S Miami Ave, Miami, FL 33130",
      city: "Miami",
      lat: 25.7650,
      lng: -80.1940,
      type: "garage",
      totalSpaces: 1200,
      operator: "SP+",
      hours: "24/7",
      rates: {
        hourly: 3.00,
        dailyMax: 25.00,
        evening: 12.00,
        weekend: 20.00,
        monthly: 200.00,
        notes: "Popular restaurant/nightlife garage. Validation from select restaurants. Gets very full Thursday-Saturday nights.",
      },
      paymentMethods: ["credit-card", "cash"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 6.8,
    },

    // ── Wynwood Parking ──
    {
      id: "lot-mia-wynwood-26th",
      name: "Wynwood Marketplace Lot",
      address: "2600 NW 2nd Ave, Miami, FL 33127",
      city: "Miami",
      lat: 25.7980,
      lng: -80.1990,
      type: "surface-lot",
      totalSpaces: 200,
      operator: "Private (Wynwood BID)",
      hours: "8:00 AM - 12:00 AM",
      rates: {
        hourly: 5.00,
        dailyMax: 30.00,
        evening: 20.00,
        weekend: 30.00,
        monthly: null,
        notes: "Premium pricing during Art Walk (2nd Saturday) and special events. Cash lots nearby may be cheaper.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: false,
      heightRestriction: null,
    },
    {
      id: "lot-mia-wynwood-yard",
      name: "The Wynwood Yard Lot",
      address: "56 NW 29th St, Miami, FL 33127",
      city: "Miami",
      lat: 25.8010,
      lng: -80.1965,
      type: "surface-lot",
      totalSpaces: 80,
      operator: "Private",
      hours: "10:00 AM - 11:00 PM",
      rates: {
        hourly: 3.00,
        dailyMax: 20.00,
        evening: 15.00,
        weekend: 25.00,
        monthly: null,
        notes: "Small lot, fills quickly during events. Street parking on NW 29th available when lot is full.",
      },
      paymentMethods: ["credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: false,
      heightRestriction: null,
    },
    {
      id: "lot-mia-wynwood-garage",
      name: "Wynwood Garage",
      address: "311 NW 26th St, Miami, FL 33127",
      city: "Miami",
      lat: 25.7992,
      lng: -80.1982,
      type: "garage",
      totalSpaces: 400,
      operator: "Goldman Properties",
      hours: "24/7",
      rates: {
        hourly: 4.00,
        dailyMax: 25.00,
        evening: 15.00,
        weekend: 25.00,
        monthly: 150.00,
        notes: "The only major garage in Wynwood. Art murals on exterior. Can be 24/7 but gate access after midnight.",
      },
      paymentMethods: ["ParkMobile", "credit-card"],
      evCharging: true,
      accessible: true,
      validation: false,
      heightRestriction: 7.0,
    },

    // ── Coconut Grove ──
    {
      id: "lot-mia-cocowalk",
      name: "CocoWalk Garage",
      address: "3015 Grand Ave, Miami, FL 33133",
      city: "Miami",
      lat: 25.7290,
      lng: -80.2420,
      type: "garage",
      totalSpaces: 800,
      operator: "Federal Realty / SP+",
      hours: "24/7",
      rates: {
        hourly: 3.00,
        dailyMax: 20.00,
        evening: 10.00,
        weekend: 15.00,
        monthly: 125.00,
        notes: "First 2 hours free with any CocoWalk purchase validation. Best option for Coconut Grove dining/shopping.",
      },
      paymentMethods: ["credit-card", "ParkMobile"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mia-grove-bayfront",
      name: "Regatta Park Surface Lot",
      address: "3500 Pan American Dr, Miami, FL 33133",
      city: "Miami",
      lat: 25.7260,
      lng: -80.2380,
      type: "surface-lot",
      totalSpaces: 150,
      operator: "City of Miami",
      hours: "6:00 AM - 10:00 PM",
      rates: {
        hourly: 2.00,
        dailyMax: 12.00,
        evening: null,
        weekend: 12.00,
        monthly: null,
        notes: "Waterfront lot near Regatta Park. Popular on weekends. Closes at 10 PM, no overnight.",
      },
      paymentMethods: ["ParkMobile", "credit-card"],
      evCharging: false,
      accessible: true,
      validation: false,
      heightRestriction: null,
    },

    // ── Coral Gables Municipal Garages ──
    {
      id: "lot-cg-andalusia",
      name: "Coral Gables Garage — Andalusia",
      address: "345 Andalusia Ave, Coral Gables, FL 33134",
      city: "Coral Gables",
      lat: 25.7497,
      lng: -80.2580,
      type: "garage",
      totalSpaces: 500,
      operator: "City of Coral Gables",
      hours: "7:00 AM - 12:00 AM",
      rates: {
        hourly: 1.50,
        dailyMax: 12.00,
        evening: 5.00,
        weekend: 10.00,
        monthly: 85.00,
        notes: "Main downtown Coral Gables garage. First hour free. Walking distance to Miracle Mile shops and restaurants.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-cg-aragon",
      name: "Coral Gables Garage — Aragon",
      address: "220 Aragon Ave, Coral Gables, FL 33134",
      city: "Coral Gables",
      lat: 25.7504,
      lng: -80.2590,
      type: "garage",
      totalSpaces: 400,
      operator: "City of Coral Gables",
      hours: "7:00 AM - 12:00 AM",
      rates: {
        hourly: 1.50,
        dailyMax: 12.00,
        evening: 5.00,
        weekend: 10.00,
        monthly: 85.00,
        notes: "Adjacent to Coral Gables Museum. First hour free. Good alternative when Andalusia is full.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-cg-giralda",
      name: "Coral Gables Garage — Giralda",
      address: "234 Giralda Ave, Coral Gables, FL 33134",
      city: "Coral Gables",
      lat: 25.7510,
      lng: -80.2585,
      type: "garage",
      totalSpaces: 350,
      operator: "City of Coral Gables",
      hours: "7:00 AM - 12:00 AM",
      rates: {
        hourly: 1.50,
        dailyMax: 12.00,
        evening: 5.00,
        weekend: 10.00,
        monthly: 85.00,
        notes: "Near Giralda Plaza 'Restaurant Row'. Evening valet may operate on weekends. First hour free.",
      },
      paymentMethods: ["ParkMobile", "credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },

    // ── Additional Miami facilities ──
    {
      id: "lot-mia-aaa-arena",
      name: "Kaseya Center (FTX Arena) Garage",
      address: "601 Biscayne Blvd, Miami, FL 33132",
      city: "Miami",
      lat: 25.7815,
      lng: -80.1870,
      type: "garage",
      totalSpaces: 1500,
      operator: "Miami-Dade County / SP+",
      hours: "Event-based; general public 7 AM - 11 PM",
      rates: {
        hourly: 5.00,
        dailyMax: 30.00,
        evening: 25.00,
        weekend: 30.00,
        monthly: null,
        notes: "Event pricing: $25-$50 for Heat games, concerts. Pre-purchase through Ticketmaster or ParkWhiz recommended. Non-event days: standard rates.",
      },
      paymentMethods: ["credit-card", "cash", "ParkWhiz"],
      evCharging: true,
      accessible: true,
      validation: false,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mia-bayside",
      name: "Bayside Marketplace Garage",
      address: "401 Biscayne Blvd, Miami, FL 33132",
      city: "Miami",
      lat: 25.7785,
      lng: -80.1865,
      type: "garage",
      totalSpaces: 1000,
      operator: "SP+",
      hours: "24/7",
      rates: {
        hourly: 4.00,
        dailyMax: 25.00,
        evening: 15.00,
        weekend: 25.00,
        monthly: null,
        notes: "Validation from Bayside Marketplace tenants: 2 hrs free with purchase. Tourist-heavy area.",
      },
      paymentMethods: ["credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: true,
      heightRestriction: 6.8,
    },
    {
      id: "lot-mia-design-district",
      name: "Miami Design District Garage",
      address: "140 NE 39th St, Miami, FL 33137",
      city: "Miami",
      lat: 25.8128,
      lng: -80.1920,
      type: "garage",
      totalSpaces: 500,
      operator: "Miami Design District Associates",
      hours: "10:00 AM - 10:00 PM (extended for events)",
      rates: {
        hourly: 3.00,
        dailyMax: 20.00,
        evening: 12.00,
        weekend: 20.00,
        monthly: null,
        notes: "Free parking first 2 hours with any Design District purchase. Luxury retail area — garage is clean and well-maintained.",
      },
      paymentMethods: ["credit-card", "Apple Pay"],
      evCharging: true,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
    {
      id: "lot-mia-little-havana",
      name: "Tower Theater Surface Lot",
      address: "1508 SW 8th St, Miami, FL 33135",
      city: "Miami",
      lat: 25.7655,
      lng: -80.2155,
      type: "surface-lot",
      totalSpaces: 60,
      operator: "City of Miami",
      hours: "8:00 AM - 10:00 PM",
      rates: {
        hourly: 1.50,
        dailyMax: 10.00,
        evening: 5.00,
        weekend: 10.00,
        monthly: null,
        notes: "Small lot near Domino Park and Tower Theater. Affordable Calle Ocho parking. Often full on weekends during cultural events.",
      },
      paymentMethods: ["ParkMobile", "credit-card"],
      evCharging: false,
      accessible: true,
      validation: false,
      heightRestriction: null,
    },
    {
      id: "lot-mia-midtown",
      name: "Midtown Miami Garage",
      address: "3401 N Miami Ave, Miami, FL 33127",
      city: "Miami",
      lat: 25.8085,
      lng: -80.1952,
      type: "garage",
      totalSpaces: 600,
      operator: "Midtown Miami Management",
      hours: "24/7",
      rates: {
        hourly: 2.00,
        dailyMax: 15.00,
        evening: 10.00,
        weekend: 15.00,
        monthly: 100.00,
        notes: "Good value garage between Wynwood and Design District. Validation from Midtown shops and Target.",
      },
      paymentMethods: ["credit-card", "cash"],
      evCharging: false,
      accessible: true,
      validation: true,
      heightRestriction: 7.0,
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // SPECIAL RULES (15+)
  // ══════════════════════════════════════════════════════════════════════════

  specialRules: [
    // ── Seasonal / Event-based ──
    {
      id: "special-spring-break",
      title: "Spring Break Enhanced Enforcement Zone",
      category: "seasonal",
      affectedAreas: ["Miami Beach — South Beach", "Miami Beach — Entertainment District"],
      activeWhen: "March 1 through April 15 (annually)",
      description: "Miami Beach activates enhanced parking enforcement during spring break season. Additional tow trucks stationed in South Beach. Zero tolerance for illegal parking on Ocean Drive, Collins Ave, and Washington Ave. Valet zones extended. Temporary no-parking zones near Lummus Park. Expect 2x normal tow frequency.",
      fine: 200,
      towRisk: true,
      source: "Miami Beach Police Department / City of Miami Beach Parking Department",
    },
    {
      id: "special-art-basel",
      title: "Art Basel Miami Beach Temporary Restrictions",
      category: "event",
      affectedAreas: ["Miami Beach — Convention Center area", "Miami Beach — Collins Park", "Miami Beach — South Beach", "Miami — Wynwood", "Miami — Design District"],
      activeWhen: "First week of December (typically Wed-Sun, plus setup/teardown days)",
      description: "Art Basel transforms parking across Miami Beach and Wynwood. Temporary no-parking zones around Miami Beach Convention Center (17th-21st St, Washington to Meridian). Wynwood sees surge pricing on all lots ($20-$50). Many private lots become event parking. Shuttle recommended. Street parking in Convention Center area suspended for event staging. City garages implement event pricing ($35-$50/day).",
      fine: 250,
      towRisk: true,
      source: "City of Miami Beach Special Events / Miami Beach Convention Center",
    },
    {
      id: "special-ultra",
      title: "Ultra Music Festival Parking Restrictions",
      category: "event",
      affectedAreas: ["Miami — Bayfront Park", "Miami — Downtown", "Miami — Brickell north"],
      activeWhen: "Last weekend of March (Friday-Sunday, plus setup days)",
      description: "Ultra Music Festival at Bayfront Park triggers widespread parking restrictions in downtown Miami. Biscayne Blvd parking suspended from NE 5th St to NE 10th St. Multiple blocks around Bayfront Park become no-parking zones. City garages near Bayfront implement $40-$60 event pricing. Brickell garages at premium. Ride-share recommended — designated pickup/dropoff zones only.",
      fine: 250,
      towRisk: true,
      source: "City of Miami Special Events / Miami Police Department",
    },
    {
      id: "special-boat-show",
      title: "Miami International Boat Show — Virginia Key Restrictions",
      category: "event",
      affectedAreas: ["Miami — Virginia Key", "Miami — Rickenbacker Causeway", "Miami — Key Biscayne"],
      activeWhen: "Third week of February (Thursday-Monday, 5 days)",
      description: "Miami International Boat Show at Virginia Key Marine Stadium restricts all parking along Rickenbacker Causeway. Public parking on Virginia Key is reserved for boat show attendees ($25-$40). No street parking on causeway shoulders. Shuttle service from Brickell City Centre to Virginia Key. Key Biscayne residents with sticker exempt from causeway restrictions.",
      fine: 150,
      towRisk: true,
      source: "Miami-Dade County Parks / Miami International Boat Show",
    },

    // ── Rush hour / Causeway rules ──
    {
      id: "special-causeway-rush",
      title: "Causeway Rush Hour Parking Rules",
      category: "zone",
      affectedAreas: ["MacArthur Causeway", "Julia Tuttle Causeway", "Venetian Causeway", "Rickenbacker Causeway"],
      activeWhen: "Weekdays 7-9 AM and 4-7 PM",
      description: "All causeways connecting Miami to Miami Beach prohibit shoulder/emergency lane parking during rush hours. MacArthur and Julia Tuttle causeways have no street parking at any time. Venetian Causeway has limited residential parking for island residents with permit only. Rickenbacker Causeway prohibits fishing-related parking during rush hours.",
      fine: 150,
      towRisk: true,
      source: "FDOT / Miami-Dade County",
    },

    // ── Beach access ──
    {
      id: "special-beach-access",
      title: "Beach Access Parking Requirements",
      category: "zone",
      affectedAreas: ["Miami Beach — all public beach access points", "Key Biscayne — Crandon Park", "Virginia Key — Hobie Beach"],
      activeWhen: "Year-round",
      description: "Florida law requires public beach access. Metered parking near beach access points has a 4-hour maximum to encourage turnover. Vehicles blocking beach access ramps or ADA beach access paths are subject to immediate tow. Surfboard/paddleboard racks on vehicles do not exempt from parking restrictions.",
      fine: 200,
      towRisk: true,
      source: "Florida Statute 161.55 / Miami-Dade County",
    },

    // ── Accessibility ──
    {
      id: "special-handicap-placard",
      title: "Florida Disabled Parking Placard — 4 Hours Free at Meters",
      category: "accessibility",
      affectedAreas: ["Miami", "Miami Beach", "Coral Gables", "All Florida municipalities"],
      activeWhen: "Year-round",
      description: "Florida Statute 316.1964 entitles disabled parking placard/plate holders to 4 hours free at any metered space. This applies even in Miami Beach Entertainment District (24/7 meters). Placard must be visibly displayed on rearview mirror. Misuse of placard is a second-degree misdemeanor ($250 fine, possible 60 days jail). Time limit starts when vehicle arrives, not when meter expires.",
      fine: 250,
      towRisk: false,
      source: "Florida Statute 316.1964 / Florida Statute 320.0848",
    },

    // ── Legal / Enforcement ──
    {
      id: "special-abandoned-vehicle",
      title: "Abandoned Vehicle — 48-Hour Rule (Florida)",
      category: "legal",
      affectedAreas: ["Miami", "Miami Beach", "Coral Gables", "Miami-Dade County"],
      activeWhen: "Year-round",
      description: "In Florida, a vehicle parked on a public street for more than 48 hours is considered potentially abandoned. Officers will tag the vehicle with a warning sticker; if not moved within 24 hours of tagging, it will be towed. This is shorter than California's 72-hour rule. Applies even to legally parked, registered vehicles. Exception: vehicles with valid RPZ permits in their permitted zone. Tow + storage fees can reach $500+ within days.",
      fine: 100,
      towRisk: true,
      source: "Florida Statute 715.07 / Miami-Dade Code Chapter 30",
    },
    {
      id: "special-scooter-moped",
      title: "Scooter and Moped Parking Rules",
      category: "vehicle-type",
      affectedAreas: ["Miami Beach", "Miami", "Coral Gables"],
      activeWhen: "Year-round",
      description: "Electric scooters (e-scooters like Lime, Bird) must be parked at designated docking areas or against bicycle racks without blocking pedestrian access. Mopeds (under 50cc) may park at motorcycle-designated spaces or in metered spaces (must pay meter). Mopeds may NOT park on sidewalks in Miami Beach. E-scooter operators running unlicensed scooter rental services face $500+ fines. Miami Beach has a regulated e-scooter program with geo-fenced parking zones.",
      fine: 75,
      towRisk: false,
      source: "City of Miami Beach Ordinance / City of Miami Code",
    },
    {
      id: "special-commercial-vehicle",
      title: "Commercial Vehicle Parking Restrictions",
      category: "vehicle-type",
      affectedAreas: ["Miami Beach — residential zones", "Coral Gables — all residential areas", "Miami — residential neighborhoods"],
      activeWhen: "Overnight and weekends in residential zones",
      description: "Commercial vehicles over 3/4 ton (including box trucks, work vans with commercial lettering, construction vehicles) are prohibited from parking overnight on residential streets in Miami Beach and Coral Gables. In Miami Beach, commercial vehicles cannot park on residential streets between 7 PM and 7 AM. Coral Gables prohibits commercial vehicles in residential areas at all times unless actively loading/unloading. Violations result in ticket + possible tow.",
      fine: 100,
      towRisk: true,
      source: "Miami Beach Code of Ordinances / Coral Gables Zoning Code",
    },
    {
      id: "special-food-truck",
      title: "Food Truck Parking Zones",
      category: "zone",
      affectedAreas: ["Miami — Wynwood", "Miami — Downtown", "Miami — Coconut Grove"],
      activeWhen: "Designated food truck hours vary by zone; typically 11 AM - 3 PM and 6 PM - 12 AM",
      description: "Food trucks may only operate in city-designated food truck zones with valid mobile vending permit. In Wynwood, food trucks park along NW 2nd Ave corridor in marked zones. Downtown Miami has food truck Friday at Biscayne Bay. Coconut Grove allows food trucks during Grove events. Food trucks parked outside designated zones or without permits will be cited and may be towed. Regular vehicles parking in food truck zones during designated hours will be ticketed.",
      fine: 150,
      towRisk: true,
      source: "City of Miami Code / Miami-Dade County Mobile Vending Ordinance",
    },
    {
      id: "special-holiday-meters",
      title: "Meters Enforced 365 Days/Year — No Holiday Exemptions",
      category: "enforcement",
      affectedAreas: ["Miami Beach — all metered areas", "Miami — all metered areas", "Coral Gables — all metered areas"],
      activeWhen: "Year-round including all holidays",
      description: "Unlike San Francisco which suspends meters on major holidays, Miami metro area meters are enforced every single day of the year. This includes Thanksgiving, Christmas, New Year's Day, Fourth of July, and all other federal/state holidays. Miami Beach Entertainment District meters run 24/7/365. City of Miami offers a promotional 'extra free hour' at downtown meters between late November and January 1, but meters are still enforced. Do not assume holiday = free parking in Miami.",
      fine: 86,
      towRisk: false,
      source: "City of Miami Beach Parking Department / Miami Parking Authority",
    },
    {
      id: "special-overnight-tow",
      title: "Miami Beach Overnight Tow — Tourist Warning",
      category: "enforcement",
      affectedAreas: ["Miami Beach — citywide"],
      activeWhen: "2 AM - 6 AM daily, year-round",
      description: "The single most common parking violation for tourists in Miami Beach. The citywide 2 AM - 6 AM overnight parking ban means ANY vehicle on a public street without a Residential Parking Zone (RPZ) permit will be towed. This applies to hotel guests parking on the street. Rental cars are not exempt. Tow + impound + retrieval fees typically $250-$350. The Miami Beach impound lot is at 350 NW 71st St. Always use hotel parking, a garage, or obtain a temporary visitor parking pass from your host.",
      fine: 150,
      towRisk: true,
      source: "City of Miami Beach Parking Department / Miami Beach Police",
    },
    {
      id: "special-ev-charging",
      title: "EV Charging Station Parking Rules",
      category: "vehicle-type",
      affectedAreas: ["Miami Beach — city garages", "Miami — Brickell City Centre", "Coral Gables — Andalusia Garage"],
      activeWhen: "Year-round",
      description: "EV charging spaces in Miami-area garages are reserved for actively charging electric vehicles only. Non-EV vehicles parked in charging spaces face $150 fine. EVs that have completed charging and remain parked may be subject to idle fees ($0.50/min in some garages after 10-minute grace period). Miami Beach has 50+ Level 2 chargers across city garages. ChargePoint and Blink are the primary networks.",
      fine: 150,
      towRisk: false,
      source: "City of Miami Beach / Brickell City Centre management",
    },
    {
      id: "special-hurricane-parking",
      title: "Hurricane Emergency Parking Rules",
      category: "seasonal",
      affectedAreas: ["Miami Beach", "Miami", "Coral Gables", "All coastal Miami-Dade"],
      activeWhen: "During declared hurricane emergencies (June-November hurricane season)",
      description: "When a hurricane emergency is declared by Miami-Dade County, all parking restrictions are suspended to allow residents to move vehicles to safe locations (garages, elevated structures). Miami Beach opens all municipal garages for free emergency parking. Street sweeping is suspended. Meters are not enforced. After the all-clear, normal enforcement resumes within 24-48 hours. Vehicles left on causeways during evacuations will be towed by emergency services.",
      fine: null,
      towRisk: true,
      source: "Miami-Dade County Emergency Management / City of Miami Beach",
    },
  ],
}
