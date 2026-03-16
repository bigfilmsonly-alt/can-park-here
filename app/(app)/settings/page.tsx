"use client"

import { useRouter } from "next/navigation"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { useAppContext } from "@/lib/app-context"

export default function SettingsPage() {
  const ctx = useAppContext()
  const router = useRouter()

  return (
    <SettingsScreen
      onUpgrade={() => ctx.setShowUpgrade(true)}
      user={ctx.user}
      onOpenAccount={() => router.push("/account")}
      onSignIn={() => ctx.setShowAuth(true)}
      onOpenAccessibilitySettings={() => router.push("/accessibility")}
    />
  )
}
