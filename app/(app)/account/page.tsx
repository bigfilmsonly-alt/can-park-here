"use client"

import { useRouter } from "next/navigation"
import { AccountScreen } from "@/components/screens/account-screen"
import { useAppContext } from "@/lib/app-context"

export default function AccountPage() {
  const ctx = useAppContext()
  const router = useRouter()

  if (!ctx.user) {
    router.replace("/")
    return null
  }

  return (
    <AccountScreen
      user={ctx.user}
      onBack={() => router.back()}
      onSignOut={ctx.handleSignOut}
      onUpgrade={() => ctx.setShowUpgrade(true)}
      onUserUpdate={(updated) => ctx.setUser(updated)}
    />
  )
}
