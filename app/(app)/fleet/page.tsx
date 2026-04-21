"use client"

import { FleetScreen } from "@/components/screens/fleet-screen"
import { showToast } from "@/components/ui/toast-notification"

export default function FleetPage() {
  return <FleetScreen showToast={showToast} />
}
