"use client"

import { InsuranceScreen } from "@/components/screens/insurance-screen"
import { ToastProvider, showToast } from "@/components/ui/toast-notification"

export default function InsurancePage() {
  return (
    <ToastProvider>
      <main className="min-h-screen bg-background">
        <InsuranceScreen showToast={showToast} />
      </main>
    </ToastProvider>
  )
}
