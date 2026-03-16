"use client"

import { AppProvider, useAppContext } from "@/lib/app-context"
import { ToastProvider, showToast } from "@/components/ui/toast-notification"
import { BottomNav } from "@/components/bottom-nav"
import { OfflineBanner } from "@/components/offline-banner"
import { InstallPrompt } from "@/components/install-prompt"
import { UpgradeModal } from "@/components/upgrade-modal"
import { TimerModal } from "@/components/timer-modal"
import { ScanSignModal } from "@/components/scan-sign-modal"
import { PhotoVault } from "@/components/photo-vault"
import { ReportIssueModal } from "@/components/report-issue-modal"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { PermissionRequest } from "@/components/onboarding/permission-request"
import { AuthScreen } from "@/components/auth/auth-screen"
import { BiometricLock } from "@/components/biometric-lock"

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const ctx = useAppContext()

  if (!ctx.authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Park</h1>
          <p className="text-muted-foreground">Loading...</p>
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
    <main className="min-h-screen bg-background">
      {!ctx.isOnline && <OfflineBanner cachedCount={ctx.cachedCount} />}
      <div className={`max-w-md mx-auto ${!ctx.isOnline ? "pt-12" : ""}`}>
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
