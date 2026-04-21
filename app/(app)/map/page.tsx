"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { MapScreen } from "@/components/screens/map-screen"
import { useAppContext } from "@/lib/app-context"
import { PageSkeleton } from "@/components/ui/page-skeleton"

export default function MapPage() {
  const ctx = useAppContext()
  const router = useRouter()

  return (
    <Suspense fallback={<PageSkeleton />}>
      <MapScreen
        onBack={() => router.back()}
        currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
      />
    </Suspense>
  )
}
