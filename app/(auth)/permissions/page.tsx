"use client"

import { PermissionRequest } from "@/components/onboarding/permission-request"
import { useRouter } from "next/navigation"
import { completeOnboarding } from "@/lib/auth"

export default function PermissionsPage() {
  const router = useRouter()

  return (
    <PermissionRequest
      onComplete={() => {
        completeOnboarding()
        router.push("/signin")
      }}
    />
  )
}
