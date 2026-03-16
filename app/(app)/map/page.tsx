"use client"

import { useRouter } from "next/navigation"
import { MapScreen } from "@/components/screens/map-screen"
import { useAppContext } from "@/lib/app-context"

export default function MapPage() {
  const ctx = useAppContext()
  const router = useRouter()

  return (
    <MapScreen
      onBack={() => router.back()}
      currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
    />
  )
}
