"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { RewardsScreen } from "@/components/screens/rewards-screen"
import { PageSkeleton } from "@/components/ui/page-skeleton"

export default function RewardsPage() {
  const router = useRouter()

  return (
    <Suspense fallback={<PageSkeleton />}>
      <RewardsScreen onBack={() => router.back()} />
    </Suspense>
  )
}
