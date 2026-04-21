"use client"

import { Suspense } from "react"
import { InsightsScreen } from "@/components/screens/insights-screen"
import { useAppContext } from "@/lib/app-context"
import { showToast } from "@/components/ui/toast-notification"
import { PageSkeleton } from "@/components/ui/page-skeleton"

export default function InsightsPage() {
  const ctx = useAppContext()

  return (
    <Suspense fallback={<PageSkeleton />}>
      <InsightsScreen
        currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
        onCheckParking={ctx.handleCheckParking}
        showToast={showToast}
      />
    </Suspense>
  )
}
