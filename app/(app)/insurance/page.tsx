"use client"

import { InsuranceScreen } from "@/components/screens/insurance-screen"
import { showToast } from "@/components/ui/toast-notification"

export default function InsurancePage() {
  return <InsuranceScreen showToast={showToast} />
}
