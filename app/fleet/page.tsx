"use client"

import { FleetScreen } from "@/components/screens/fleet-screen"
import { ToastProvider, showToast } from "@/components/ui/toast-notification"

export default function FleetPage() {
  return (
    <ToastProvider>
      <main className="min-h-screen bg-background">
        <FleetScreen showToast={showToast} />
      </main>
    </ToastProvider>
  )
}
