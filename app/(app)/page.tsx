"use client"

import { useRouter } from "next/navigation"
import { HomeScreen } from "@/components/screens/home-screen"
import { useAppContext } from "@/lib/app-context"

export default function HomePage() {
  const ctx = useAppContext()
  const router = useRouter()

  return (
    <HomeScreen
      onCheckParking={ctx.handleCheckParking}
      onResumeSession={ctx.handleResumeSession}
      onScanSign={() => ctx.setShowScanSign(true)}
      onSetTimer={() => ctx.setShowTimer(true)}
      onOpenMap={() => router.push("/map")}
      onOpenSaved={() => router.push("/saved")}
      loading={ctx.loading}
      error={ctx.error}
      activeSession={ctx.activeSession}
      sessionTimeRemaining={ctx.sessionTimeRemaining}
      remainingChecks={ctx.remainingChecks}
      onUpgrade={() => ctx.setShowUpgrade(true)}
      currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
      timerActive={ctx.timerActive}
      timerRemainingSeconds={ctx.timerRemainingSeconds ?? 0}
      formatTimerDisplay={ctx.formatTimeDisplay}
      onCancelTimer={ctx.handleCancelTimer}
      onOpenSettings={() => router.push("/settings")}
      onOpenHistory={() => router.push("/history")}
    />
  )
}
