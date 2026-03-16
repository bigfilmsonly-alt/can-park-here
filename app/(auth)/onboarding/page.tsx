"use client"

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { useRouter } from "next/navigation"
import { completeOnboarding } from "@/lib/auth"

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <OnboardingFlow
      onComplete={() => router.push("/permissions")}
      onSkip={() => {
        completeOnboarding()
        router.push("/")
      }}
    />
  )
}
