"use client"

import { AuthScreen } from "@/components/auth/auth-screen"
import { useRouter, useSearchParams } from "next/navigation"
import { showToast } from "@/components/ui/toast-notification"
import { useEffect } from "react"
import { Suspense } from "react"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"
  const callbackError = searchParams.get("error")

  useEffect(() => {
    if (callbackError === "auth_callback_failed") {
      showToast("error", "Authentication failed", "Please try signing in again.")
    }
  }, [callbackError])

  return (
    <AuthScreen
      onSuccess={(user) => {
        showToast("success", `Welcome, ${user.name}`, "Your account is ready")
        router.push(next)
      }}
      onSkip={() => router.push(next)}
    />
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  )
}
