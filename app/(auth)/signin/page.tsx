"use client"

import { AuthScreen } from "@/components/auth/auth-screen"
import { useRouter } from "next/navigation"
import { showToast } from "@/components/ui/toast-notification"

export default function SignInPage() {
  const router = useRouter()

  return (
    <AuthScreen
      onSuccess={(user) => {
        showToast("success", `Welcome, ${user.name}`, "Your account is ready")
        router.push("/")
      }}
      onSkip={() => router.push("/")}
    />
  )
}
