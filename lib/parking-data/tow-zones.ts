import type { TowZone } from "./types"

/**
 * Rush-hour tow-away zones — San Francisco.
 * Source: SFMTA posted signs & tow-away schedule.
 * These streets prohibit parking during peak commute hours.
 * Violation = tow + $500+ in fees.
 */
export const SF_TOW_ZONES: TowZone[] = [
  // ── MORNING INBOUND (typically 7-9am) ──
  { id: "sf-fell-am", city: "sf", street: "fell st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays (inbound)", fine: 500 },
  { id: "sf-bush-am", city: "sf", street: "bush st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays (inbound)", fine: 500 },
  { id: "sf-pine-am", city: "sf", street: "pine st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays (inbound)", fine: 500 },
  { id: "sf-geary-am", city: "sf", street: "geary blvd", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays (inbound)", fine: 500 },
  { id: "sf-ofarrell-am", city: "sf", street: "o'farrell st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays", fine: 500 },
  { id: "sf-post-am", city: "sf", street: "post st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays", fine: 500 },
  { id: "sf-sutter-am", city: "sf", street: "sutter st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays", fine: 500 },
  { id: "sf-sacramento-am", city: "sf", street: "sacramento st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays", fine: 500 },
  { id: "sf-clay-am", city: "sf", street: "clay st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays", fine: 500 },
  { id: "sf-19th-am", city: "sf", street: "19th ave", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays (southbound)", fine: 500 },
  { id: "sf-parkpresidio-am", city: "sf", street: "park presidio blvd", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays (southbound)", fine: 500 },
  { id: "sf-guerrero-am", city: "sf", street: "guerrero st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away 7-9 AM weekdays", fine: 500 },

  // ── EVENING OUTBOUND (typically 3-7pm or 4-6pm) ──
  { id: "sf-oak-pm", city: "sf", street: "oak st", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays (outbound)", fine: 500 },
  { id: "sf-gough-pm", city: "sf", street: "gough st", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays (outbound)", fine: 500 },
  { id: "sf-franklin-pm", city: "sf", street: "franklin st", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays (outbound)", fine: 500 },
  { id: "sf-vanness-pm", city: "sf", street: "van ness ave", direction: "outbound", days: [1,2,3,4,5], startTime: "16:00", endTime: "18:00", description: "Tow-away 4-6 PM weekdays", fine: 500 },
  { id: "sf-geary-pm", city: "sf", street: "geary blvd", direction: "outbound", days: [1,2,3,4,5], startTime: "16:00", endTime: "19:00", description: "Tow-away 4-7 PM weekdays (outbound)", fine: 500 },
  { id: "sf-19th-pm", city: "sf", street: "19th ave", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays (northbound)", fine: 500 },
  { id: "sf-parkpresidio-pm", city: "sf", street: "park presidio blvd", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays (northbound)", fine: 500 },
  { id: "sf-mission-pm", city: "sf", street: "mission st", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays", fine: 500 },
  { id: "sf-market-pm", city: "sf", street: "market st", direction: "both", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "Tow-away AM rush", fine: 500 },
  { id: "sf-market-pm2", city: "sf", street: "market st", direction: "both", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away PM rush", fine: 500 },
  { id: "sf-sanbruno-pm", city: "sf", street: "san bruno ave", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays", fine: 500 },
  { id: "sf-potrero-pm", city: "sf", street: "potrero ave", direction: "outbound", days: [1,2,3,4,5], startTime: "15:00", endTime: "19:00", description: "Tow-away 3-7 PM weekdays", fine: 500 },
]

/**
 * Miami tow-away and restricted zones.
 * Miami has fewer traditional rush-hour tow-away streets than SF,
 * but has special event zones and overnight restrictions.
 */
export const MIAMI_TOW_ZONES: TowZone[] = [
  { id: "mia-biscayne-am", city: "miami", street: "biscayne blvd", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "No parking during AM rush", fine: 250 },
  { id: "mia-biscayne-pm", city: "miami", street: "biscayne blvd", direction: "outbound", days: [1,2,3,4,5], startTime: "16:00", endTime: "18:00", description: "No parking during PM rush", fine: 250 },
  { id: "mia-flagler-am", city: "miami", street: "flagler st", direction: "inbound", days: [1,2,3,4,5], startTime: "07:00", endTime: "09:00", description: "No parking during AM rush", fine: 250 },
  // Miami Beach CITYWIDE overnight parking ban: 2 AM - 6 AM every day.
  // Vehicles without a Residential Parking Zone permit will be towed.
  // This is a parking ban, not a sweeping schedule.
  { id: "mb-overnight-ban", city: "miami-beach", street: "*", direction: "both", days: [0,1,2,3,4,5,6], startTime: "02:00", endTime: "06:00", description: "Overnight parking ban (permit required). Vehicles without residential permit will be towed.", fine: 150 },
]

export const ALL_TOW_ZONES = [...SF_TOW_ZONES, ...MIAMI_TOW_ZONES]
