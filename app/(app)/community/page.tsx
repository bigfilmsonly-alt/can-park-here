"use client"

import { CommunityScreen } from "@/components/screens/community-screen"
import { useAppContext } from "@/lib/app-context"
import { showToast } from "@/components/ui/toast-notification"

export default function CommunityPage() {
  const ctx = useAppContext()

  return (
    <CommunityScreen
      currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
      currentAddress={ctx.currentLocation?.address}
      onOpenPhotoVault={() => ctx.setShowPhotoVault(true)}
      onOpenReportIssue={() => ctx.setShowReportIssue(true)}
      showToast={showToast}
    />
  )
}
