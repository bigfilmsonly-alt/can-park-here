"use client"

import { useRouter } from "next/navigation"
import { ScanScreen } from "@/components/screens/scan-screen"
import { useAppContext } from "@/lib/app-context"

export default function ScanPage() {
  const ctx = useAppContext()
  const router = useRouter()

  return (
    <ScanScreen
      onCapture={(imageBase64) => {
        // For now, close and show scan modal with the captured image
        ctx.setShowScanSign(true)
        router.push("/")
      }}
      onClose={() => router.push("/")}
    />
  )
}
