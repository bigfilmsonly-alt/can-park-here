/**
 * Re-exports the in-memory rate limiter from api-utils so that callers
 * can import from either `@/lib/rate-limit` or `@/lib/api-utils`.
 *
 * The canonical implementation lives in lib/api-utils.ts.
 */
export { rateLimit, getClientIp } from "./api-utils"
