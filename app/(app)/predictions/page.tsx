"use client"

import { useRouter } from "next/navigation"
import { PredictionsScreen } from "@/components/screens/predictions-screen"
import { useAppContext } from "@/lib/app-context"

export default function PredictionsPage() {
  const ctx = useAppContext()
  const router = useRouter()

  return (
    <PredictionsScreen
      onBack={() => router.back()}
      currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
    />
  )
}
