"use client"

import dynamic from "next/dynamic"
import { ParkLogo, Wordmark } from "@/components/park-logo"
import { AppProvider, useAppContext } from "@/lib/app-context"
import { ToastProvider, showToast } from "@/components/ui/toast-notification"
import { BottomNav } from "@/components/bottom-nav"
import { OfflineBanner } from "@/components/offline-banner"
import { InstallPrompt } from "@/components/install-prompt"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { PermissionRequest } from "@/components/onboarding/permission-request"
import { AuthScreen } from "@/components/auth/auth-screen"
import { BiometricLock } from "@/components/biometric-lock"
import { CheckingScreen } from "@/components/screens/checking-screen"

function ModalSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

const ScanSignModal = dynamic(
  () => import("@/components/scan-sign-modal").then(mod => ({ default: mod.ScanSignModal })),
  { loading: () => <ModalSpinner /> }
)

const PhotoVault = dynamic(
  () => import("@/components/photo-vault").then(mod => ({ default: mod.PhotoVault })),
  { loading: () => <ModalSpinner /> }
)

const ReportIssueModal = dynamic(
  () => import("@/components/report-issue-modal").then(mod => ({ default: mod.ReportIssueModal })),
  { loading: () => <ModalSpinner /> }
)

const TimerModal = dynamic(
  () => import("@/components/timer-modal").then(mod => ({ default: mod.TimerModal })),
  { loading: () => <ModalSpinner /> }
)

const UpgradeModal = dynamic(
  () => import("@/components/upgrade-modal").then(mod => ({ default: mod.UpgradeModal })),
  { loading: () => <ModalSpinner /> }
)

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const ctx = useAppContext()

  if (!ctx.authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ParkLogo size={56} />
          <Wordmark size={28} />
        </div>
      </div>
    )
  }

  if (ctx.showOnboarding) {
    return (
      <OnboardingFlow onComplete={ctx.handleOnboardingComplete} onSkip={ctx.handleOnboardingSkip} />
    )
  }

  if (ctx.showPermissions) {
    return <PermissionRequest onComplete={ctx.handlePermissionsComplete} />
  }

  if (ctx.showAuth) {
    return <AuthScreen onSuccess={ctx.handleAuthSuccess} onSkip={ctx.handleAuthSkip} />
  }

  if (ctx.biometricEnabled && !ctx.isAuthenticated) {
    return (
      <BiometricLock
        onAuthenticate={ctx.authenticate}
        isLoading={ctx.biometricLoading}
        error={ctx.biometricError}
      />
    )
  }

  return (
    <main className="app-shell bg-background">
      {!ctx.isOnline && <OfflineBanner cachedCount={ctx.cachedCount} />}
      <div className={`app-scroll max-w-md mx-auto ${!ctx.isOnline ? "pt-12" : ""}`}>
        {children}
      </div>
      <BottomNav />
      <InstallPrompt />
      <UpgradeModal
        isOpen={ctx.showUpgrade}
        onClose={() => ctx.setShowUpgrade(false)}
        onUpgrade={ctx.handleUpgrade}
      />
      <TimerModal
        isOpen={ctx.showTimer}
        onClose={() => ctx.setShowTimer(false)}
        onSetTimer={ctx.handleSetTimer}
      />
      <ScanSignModal
        isOpen={ctx.showScanSign}
        onClose={() => ctx.setShowScanSign(false)}
        onResult={ctx.handleScanResult}
      />
      <PhotoVault
        isOpen={ctx.showPhotoVault}
        onClose={() => ctx.setShowPhotoVault(false)}
        currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
        currentAddress={ctx.currentLocation?.address}
        showToast={showToast}
      />
      <ReportIssueModal
        isOpen={ctx.showReportIssue}
        onClose={() => ctx.setShowReportIssue(false)}
        currentLocation={ctx.currentLocation ? { lat: ctx.currentLocation.latitude, lng: ctx.currentLocation.longitude } : undefined}
        currentAddress={ctx.currentLocation?.address}
        showToast={showToast}
      />
      {ctx.checking && (
        <CheckingScreen onComplete={() => ctx.setChecking(false)} />
      )}
    </main>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </AppProvider>
    </ToastProvider>
  )
}
