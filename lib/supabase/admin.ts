import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use only in server-side code (API routes, webhooks, cron jobs).
 * Never import this from client components.
 *
 * Uses `any` for the database generic since we don't have generated types.
 * Once you run `npx supabase gen types typescript`, replace `any` with the
 * generated `Database` type for full type safety.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): SupabaseClient<any> {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
    )
  }

  adminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return adminClient
}
