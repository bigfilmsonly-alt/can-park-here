/**
 * Park — Comprehensive parking rules database.
 * Covers: San Francisco Bay Area + Miami Metro
 *
 * Data sources:
 * - SFMTA official data (sfmta.com, data.sfgov.org)
 * - Miami Parking Authority (miamiparking.com)
 * - Miami Beach Parking (miamibeachfl.gov)
 * - California Vehicle Code
 * - Florida Statute 316
 * - Verified by 6 research agents with 300+ web sources
 */

export * from "./types"
export * from "./holidays"
export * from "./handicap"
export * from "./tow-zones"
export * from "./meters"
export { SF_SWEEPING } from "./sweeping-sf"
export { MIAMI_SWEEPING } from "./sweeping-miami"
export { detectCity, isCalifornia, isFlorida, type CityResult, type CityDetectionResult, type CityNotSupported } from "./city-detect"
export { UNIVERSAL_RULES, SF_CITY_RULES, MIAMI_CITY_RULES, type UniversalRule, type CityWideRules } from "./universal-rules"
export { SF_DATABASE } from "./db-sf"
export { MIAMI_DATABASE } from "./db-miami"
