"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ToastProvider } from "@/components/ui/toast-notification"
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // If Supabase is configured, check whether the user already has an active
    // session. If so, redirect them away from auth pages into the app.
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace("/")
        } else {
          setReady(true)
        }
      })
    } else {
      // Local / demo mode — no session check needed.
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Park</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <ToastProvider>{children}</ToastProvider>
}
