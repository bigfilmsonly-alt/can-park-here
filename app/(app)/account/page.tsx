"use client"

import { useRouter } from "next/navigation"
import { AccountScreen } from "@/components/screens/account-screen"
import { useAppContext } from "@/lib/app-context"
import type { User } from "@/lib/auth"

const DEMO_USER: User = {
  id: "demo",
  email: "demo@park.app",
  name: "Park User",
  avatar: undefined,
  tier: "free",
  city: "san_francisco",
  createdAt: new Date().toISOString(),
  karma: 142,
  level: 3,
  streak: 14,
  totalChecks: 7,
  ticketsAvoided: 3,
  moneySaved: 312,
  referralCode: "PARK-DEMO",
  handicapEnabled: false,
  vehiclePlate: null,
}

export default function AccountPage() {
  const ctx = useAppContext()
  const router = useRouter()

  // In demo mode (no signed-in user), show account with demo data
  const user = ctx.user ?? DEMO_USER

  return (
    <AccountScreen
      user={user}
      onBack={() => router.back()}
      onSignOut={ctx.handleSignOut}
      onUpgrade={() => ctx.setShowUpgrade(true)}
      onUserUpdate={(updated) => ctx.setUser(updated)}
    />
  )
}
