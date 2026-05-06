/**
 * Park — Universal parking rules and the things nobody thinks about.
 * These are the rules that catch people off guard and cause tickets.
 *
 * This file contains rules that apply regardless of specific street/sign,
 * organized by what state you're in (CA vs FL have different laws).
 */

// ═══════════════════════════════════════════════════════════════
// THINGS PEOPLE DON'T THINK ABOUT
// These are the #1 source of unexpected tickets
// ═══════════════════════════════════════════════════════════════

export interface UniversalRule {
  id: string
  category: string
  title: string
  description: string
  fine: number
  towRisk: boolean
  /** Which states this applies to */
  states: ("CA" | "FL")[]
  /** Pro tip to help users avoid this */
  proTip: string
}

export const UNIVERSAL_RULES: UniversalRule[] = [
  // ── Distance Rules (most-ticketed violations) ──
  {
    id: "hydrant-ca",
    category: "Distance",
    title: "Fire Hydrant — 15 feet",
    description: "Must park at least 15 feet from any fire hydrant. Measured from the nearest edge of the hydrant to the nearest edge of your vehicle.",
    fine: 115,
    towRisk: true,
    states: ["CA"],
    proTip: "15 feet is about one car length. If you can't fit a full car between you and the hydrant, you're too close.",
  },
  {
    id: "hydrant-fl",
    category: "Distance",
    title: "Fire Hydrant — 15 feet",
    description: "Must park at least 15 feet from any fire hydrant.",
    fine: 100,
    towRisk: true,
    states: ["FL"],
    proTip: "Florida is strict — they measure from the exact center of the hydrant.",
  },
  {
    id: "daylighting-ca",
    category: "Distance",
    title: "Daylighting (AB 413) — 20 feet from crosswalk",
    description: "As of 2025, California law prohibits parking within 20 feet of any marked or unmarked crosswalk. This applies to ALL intersections, even without signs. Previously was only marked crosswalks.",
    fine: 75,
    towRisk: false,
    states: ["CA"],
    proTip: "20 feet = roughly 1.5 car lengths from the corner. This is a NEW law (2025) and enforcement is ramping up. Many drivers don't know about it yet.",
  },
  {
    id: "crosswalk-fl",
    category: "Distance",
    title: "Crosswalk — 20 feet",
    description: "Must park at least 20 feet from any marked crosswalk at an intersection.",
    fine: 65,
    towRisk: false,
    states: ["FL"],
    proTip: "Same 20-foot rule as California. Count roughly 1.5 car lengths from the crosswalk paint.",
  },
  {
    id: "stop-sign",
    category: "Distance",
    title: "Stop Sign — 30 feet",
    description: "Must park at least 30 feet from a stop sign. This ensures visibility for approaching traffic.",
    fine: 65,
    towRisk: false,
    states: ["CA", "FL"],
    proTip: "30 feet = about 2 car lengths. If you're the last spot before a stop sign, make sure there's plenty of room.",
  },
  {
    id: "bus-stop",
    category: "Distance",
    title: "Bus Stop Zone",
    description: "No parking in a bus stop zone at any time. The zone extends from the bus stop sign to the end of the red curb or posted zone.",
    fine: 285,
    towRisk: true,
    states: ["CA", "FL"],
    proTip: "Bus stop zones are enforced 24/7 in most cities. Even at 3 AM on Christmas, you'll get towed.",
  },

  // ── Time Limits ──
  {
    id: "72hr-ca",
    category: "Time Limit",
    title: "72-Hour Rule (California)",
    description: "No vehicle may be parked on any public street for more than 72 consecutive hours, even in non-restricted zones. After 72 hours, your vehicle can be cited and towed as abandoned.",
    fine: 65,
    towRisk: true,
    states: ["CA"],
    proTip: "Going on vacation? Don't leave your car on the street. Someone can report it after 72 hours and it'll be towed. Use a garage.",
  },
  {
    id: "48hr-fl",
    category: "Time Limit",
    title: "48-Hour Rule (Florida)",
    description: "Florida law allows removal of vehicles parked on public right-of-way within 30 feet of pavement for more than 48 hours. Shorter than California's 72-hour rule.",
    fine: 50,
    towRisk: true,
    states: ["FL"],
    proTip: "Florida's limit is only 48 hours, not 72 like California. If you're flying out of Miami, use airport parking, not street parking.",
  },

  // ── Hill Parking (SF-specific but legally CA-wide) ──
  {
    id: "hill-curb",
    category: "Hill Parking",
    title: "Wheels Must Be Curbed on Hills",
    description: "On any grade, you must curb your wheels. Facing uphill: turn wheels AWAY from curb (left). Facing downhill: turn wheels TOWARD curb (right). Always set parking brake. Failure to do so is a separate citation.",
    fine: 60,
    towRisk: false,
    states: ["CA"],
    proTip: "Easy way to remember: if your car rolls, the curb should stop it. Uphill = wheels left. Downhill = wheels right. SF enforces this aggressively on steep streets.",
  },

  // ── Blocking Rules ──
  {
    id: "driveway",
    category: "Blocking",
    title: "Blocking a Driveway",
    description: "You may not park in front of any public or private driveway, even partially. This includes driveways that appear unused or don't have a visible car.",
    fine: 110,
    towRisk: true,
    states: ["CA", "FL"],
    proTip: "Even if only your bumper overlaps the driveway cut, you can be towed. Property owners can call for immediate tow.",
  },
  {
    id: "sidewalk",
    category: "Blocking",
    title: "Parking on Sidewalk",
    description: "No part of your vehicle may rest on any sidewalk, including tires on the curb edge that extend over the sidewalk.",
    fine: 65,
    towRisk: true,
    states: ["CA", "FL"],
    proTip: "This catches SUV and truck drivers who pull forward with tires on the sidewalk. Your tires must be fully behind the curb face.",
  },
  {
    id: "double-parking",
    category: "Blocking",
    title: "Double Parking",
    description: "Parking alongside a vehicle already parked at the curb. Illegal at all times, even with hazard lights on, even for 'just a minute.'",
    fine: 110,
    towRisk: true,
    states: ["CA", "FL"],
    proTip: "Delivery drivers do this constantly — doesn't make it legal. In SF, Muni buses have cameras that auto-ticket double-parked cars in transit lanes.",
  },

  // ── Vehicle Type Rules ──
  {
    id: "oversized-ca",
    category: "Vehicle Size",
    title: "Oversized Vehicle Restrictions",
    description: "Vehicles over 22 feet long or 7 feet wide are prohibited from parking on most residential streets in San Francisco. This includes RVs, large trucks, and trailers.",
    fine: 115,
    towRisk: true,
    states: ["CA"],
    proTip: "RVs cannot park on SF residential streets. They'll be towed. Use designated RV parking areas or private lots.",
  },
  {
    id: "commercial-residential",
    category: "Vehicle Size",
    title: "Commercial Vehicles in Residential Zones",
    description: "Commercial vehicles over 10,000 lbs GVWR are generally prohibited from parking on residential streets between 6 PM and 6 AM.",
    fine: 85,
    towRisk: false,
    states: ["CA", "FL"],
    proTip: "If you drive a work truck, check for commercial vehicle restriction signs before parking in residential areas overnight.",
  },

  // ── Bike & Transit Lane Rules ──
  {
    id: "bike-lane",
    category: "Transit",
    title: "Parking in Bike Lane",
    description: "No stopping, standing, or parking in any designated bicycle lane. Even momentary stopping for drop-off/pickup is illegal.",
    fine: 110,
    towRisk: false,
    states: ["CA", "FL"],
    proTip: "The green-painted bike lanes are obvious. But watch for bike lanes that are only marked with white lines — they're equally enforced.",
  },
  {
    id: "transit-lane-ca",
    category: "Transit",
    title: "Transit-Only Lane Violation",
    description: "San Francisco has 55+ miles of transit-only lanes (red-painted). Private vehicles cannot stop, stand, or park in these lanes. Enforced by cameras on Muni buses.",
    fine: 108,
    towRisk: true,
    states: ["CA"],
    proTip: "SF is upgrading to automated camera enforcement in 2026. Expected to issue 5x more citations. Stay out of red lanes entirely.",
  },

  // ── Color Curb Rules ──
  {
    id: "red-curb",
    category: "Curb Color",
    title: "Red Curb — No Stopping Ever",
    description: "Red curb means no stopping, standing, or parking at any time. Not even with hazards on. Not even for 1 second. This is 24/7/365.",
    fine: 98,
    towRisk: true,
    states: ["CA", "FL"],
    proTip: "Red means NO. Period. Even if you see other cars parked at a faded red curb, they're all getting tickets. Enforcement officers sweep through.",
  },
  {
    id: "yellow-curb",
    category: "Curb Color",
    title: "Yellow Curb — Commercial Loading Only",
    description: "Yellow curb is for commercial vehicles loading/unloading during posted hours (usually 7AM-6PM). Non-commercial vehicles can stop for 3 minutes max with driver present. After posted hours, yellow zones revert to general parking.",
    fine: 85,
    towRisk: false,
    states: ["CA"],
    proTip: "After 6 PM and on Sundays, yellow zones become free parking in most of SF. Free spots hiding in plain sight.",
  },
  {
    id: "white-curb",
    category: "Curb Color",
    title: "White Curb — 5-Minute Passenger Loading",
    description: "White curb allows passenger loading and unloading only, with a 5-minute maximum. Driver must remain with the vehicle (except at hospitals and schools).",
    fine: 65,
    towRisk: false,
    states: ["CA", "FL"],
    proTip: "Great for quick pickups/dropoffs. But don't leave your car — the 5-minute timer starts when you stop, and officers time it.",
  },
  {
    id: "green-curb",
    category: "Curb Color",
    title: "Green Curb — Short-Term Metered (10-30 min)",
    description: "Green curb means short-term parking, typically 10-30 minutes as posted. Metered. Disabled placard holders are exempt from the time limit but must still pay the meter.",
    fine: 65,
    towRisk: false,
    states: ["CA"],
    proTip: "Great for quick errands. After meter hours end (usually 6 PM), green zones become regular free parking.",
  },

  // ── Weather & Special Conditions ──
  {
    id: "street-cleaning-skip",
    category: "Smart Tip",
    title: "Street Cleaning Canceled — Rain",
    description: "In San Francisco, street cleaning is sometimes canceled during heavy rain. However, the parking signs remain posted and you MAY still be ticketed. SFMTA does not guarantee enforcement suspension during rain.",
    fine: 76,
    towRisk: false,
    states: ["CA"],
    proTip: "Don't gamble on rain canceling street cleaning. Move your car. If it IS canceled, you'll see sweepers not running, but the signs are still valid.",
  },

  // ── Registration & Display ──
  {
    id: "expired-tags",
    category: "Vehicle Status",
    title: "Expired Registration Tags",
    description: "Vehicles with expired registration displayed on public streets can be cited ($25-$100 depending on how long expired) and eventually towed.",
    fine: 65,
    towRisk: true,
    states: ["CA", "FL"],
    proTip: "Even if your car is legally parked, expired tags are a separate citation. Officers check tags on every pass.",
  },

  // ── Disabled Placard Misuse ──
  {
    id: "placard-misuse",
    category: "Handicap",
    title: "Disabled Placard Misuse",
    description: "Using a disabled placard that doesn't belong to you, or parking in a disabled space without a valid placard, carries severe penalties. CA: $250-$1000 fine. FL: $250+ fine.",
    fine: 866,
    towRisk: true,
    states: ["CA", "FL"],
    proTip: "SF has undercover placard enforcement officers. They will ask to see ID matching the placard. Don't borrow someone else's placard — it's a misdemeanor.",
  },
]

// ═══════════════════════════════════════════════════════════════
// CITY-WIDE RULES — the baseline rules for each region
// ═══════════════════════════════════════════════════════════════

export interface CityWideRules {
  region: "sf" | "miami"
  maxParkingHours: number
  hydrantDistanceFeet: number
  crosswalkDistanceFeet: number
  busStopDistanceFeet: number
  stopSignDistanceFeet: number
  hillParkingRequired: boolean
  overnightBanExists: boolean
  overnightBanHours: string | null
  meterHolidayCount: number
  handicapMeterFreeHours: number | null // null = unlimited
  doubleParkingFine: number
  bikeLaneFine: number
  sidewalkParkingFine: number
  drivewayBlockingFine: number
  expiredMeterFine: number
  streetCleaningFine: number
  redZoneFine: number
  towBaseFee: number
  averageDailyStorageFee: number
  enforcementHoursLabel: string
  paymentApps: string[]
  emergencyNumber: string
  nonEmergencyNumber: string
  towLotInfo: string
}

export const SF_CITY_RULES: CityWideRules = {
  region: "sf",
  maxParkingHours: 72,
  hydrantDistanceFeet: 15,
  crosswalkDistanceFeet: 20, // AB 413 daylighting
  busStopDistanceFeet: 15,
  stopSignDistanceFeet: 30,
  hillParkingRequired: true,
  overnightBanExists: false, // SF doesn't have a citywide overnight ban
  overnightBanHours: null,
  meterHolidayCount: 3, // Only New Year's, Thanksgiving, Christmas
  handicapMeterFreeHours: null, // Unlimited in California
  doubleParkingFine: 110,
  bikeLaneFine: 110,
  sidewalkParkingFine: 65,
  drivewayBlockingFine: 110,
  expiredMeterFine: 74,
  streetCleaningFine: 76,
  redZoneFine: 98,
  towBaseFee: 400,
  averageDailyStorageFee: 60,
  enforcementHoursLabel: "Meters: Mon-Sat 9AM-6PM (most areas)",
  paymentApps: ["PayByPhone", "ParkMobile"],
  emergencyNumber: "911",
  nonEmergencyNumber: "415-553-0123",
  towLotInfo: "SFMTA AutoReturn: 450 7th St, SF. Open 24/7. Cash/card accepted.",
}

export const MIAMI_CITY_RULES: CityWideRules = {
  region: "miami",
  maxParkingHours: 48, // Florida: 48 hours
  hydrantDistanceFeet: 15,
  crosswalkDistanceFeet: 20,
  busStopDistanceFeet: 15,
  stopSignDistanceFeet: 30,
  hillParkingRequired: false, // Miami is flat
  overnightBanExists: true, // Miami Beach 2-6AM
  overnightBanHours: "2:00 AM - 6:00 AM (Miami Beach only — RPZ permit required)",
  meterHolidayCount: 0, // Meters enforced 365 days
  handicapMeterFreeHours: 4, // Florida statute: 4 hours
  doubleParkingFine: 65,
  bikeLaneFine: 65,
  sidewalkParkingFine: 50,
  drivewayBlockingFine: 65,
  expiredMeterFine: 18, // If paid within 30 days
  streetCleaningFine: 65,
  redZoneFine: 65,
  towBaseFee: 258, // $516 in South Beach (double)
  averageDailyStorageFee: 30,
  enforcementHoursLabel: "Meters: varies by zone. Entertainment District: 24/7",
  paymentApps: ["ParkMobile", "PayByPhone", "Passport"],
  emergencyNumber: "911",
  nonEmergencyNumber: "305-579-6111",
  towLotInfo: "Tremont Towing: 855 NW 71st St, Miami. $258 standard, $516 South Beach. Cash only.",
}
