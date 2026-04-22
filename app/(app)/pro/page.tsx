"use client"

import { useRouter } from "next/navigation"
import { ProScreen } from "@/components/screens/pro-screen"
import { useAppContext } from "@/lib/app-context"

export default function ProPage() {
  const ctx = useAppContext()
  const router = useRouter()

  return (
    <ProScreen
      onUpgrade={ctx.handleUpgrade}
      onBack={() => router.push("/")}
    />
  )
}
