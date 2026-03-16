"use client"

import { useRouter } from "next/navigation"
import { RewardsScreen } from "@/components/screens/rewards-screen"

export default function RewardsPage() {
  const router = useRouter()

  return <RewardsScreen onBack={() => router.back()} />
}
