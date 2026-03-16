"use client"

import { useRouter } from "next/navigation"
import { AccessibilityScreen } from "@/components/screens/accessibility-screen"

export default function AccessibilityPage() {
  const router = useRouter()

  return <AccessibilityScreen onBack={() => router.back()} />
}
