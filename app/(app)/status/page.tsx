"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { StatusScreen } from "@/components/screens/status-screen"
import { useAppContext } from "@/lib/app-context"

export default function StatusPage() {
  const ctx = useAppContext()
  const router = useRouter()

  useEffect(() => {
    if (!ctx.parkingResult || !ctx.currentLocation) {
      router.replace("/")
    }
  }, [ctx.parkingResult, ctx.currentLocation, router])

  if (!ctx.parkingResult || !ctx.currentLocation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const isSaved = ctx.isLocationSaved(ctx.currentLocation.latitude, ctx.currentLocation.longitude)
  const isProtected = ctx.activeSession?.status === "active"

  return (
    <StatusScreen
      result={ctx.parkingResult}
      location={ctx.currentLocation.street}
      fullAddress={ctx.currentLocation.address}
      coordinates={{ lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude }}
      onBack={ctx.handleBack}
      onSetReminder={ctx.handleSetReminder}
      onEndSession={ctx.handleEndSession}
      isSaved={isSaved}
      onSaveLocation={ctx.handleSaveCurrentLocation}
      onRemoveLocation={ctx.handleRemoveCurrentLocation}
      isProtected={isProtected}
      reminderSet={ctx.reminderSet}
    />
  )
}
