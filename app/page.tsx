"use client"

import { useState, useCallback, useEffect } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { HomeScreen } from "@/components/screens/home-screen"
import { StatusScreen } from "@/components/screens/status-screen"
import { HistoryScreen } from "@/components/screens/history-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { CommunityScreen } from "@/components/screens/community-screen"
import { UpgradeModal } from "@/components/upgrade-modal"
import { TimerModal } from "@/components/timer-modal"
import { ScanSignModal } from "@/components/scan-sign-modal"
import { PhotoVault } from "@/components/photo-vault"
import { ReportIssueModal } from "@/components/report-issue-modal"
import { ToastProvider, showToast } from "@/components/ui/toast-notification"
import { useGeolocation, type LocationData } from "@/hooks/use-geolocation"
import { useSavedLocations, type SavedLocation } from "@/hooks/use-saved-locations"
import { checkParking, type ParkingResult, getUserAccessibility } from "@/lib/parking-rules"
import {
  startParkingSession,
  getActiveSessionSync,
  endParkingSession,
  getSessionTimeRemaining,
  setSessionReminder,
  getRemainingChecks,
  upgradeToProTier,
  canMakeCheck,
  type ProtectionSession,
} from "@/lib/protection"
import { useTimer } from "@/hooks/use-timer"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { VoiceButton } from "@/components/voice-button"
import { useOffline } from "@/hooks/use-offline"
import { useBiometric } from "@/hooks/use-biometric"
import { OfflineBanner } from "@/components/offline-banner"
import { BiometricLock } from "@/components/biometric-lock"
import { InstallPrompt } from "@/components/install-prompt"
import { PredictionsScreen } from "@/components/screens/predictions-screen"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { PermissionRequest } from "@/components/onboarding/permission-request"
import { AuthScreen } from "@/components/auth/auth-screen"
import { AccountScreen } from "@/components/screens/account-screen"
import { RewardsScreen } from "@/components/screens/rewards-screen"
import { MapScreen } from "@/components/screens/map-screen"
import { AccessibilityScreen } from "@/components/screens/accessibility-screen"
import { getAccessibilitySettings, applyAccessibilityStyles } from "@/lib/accessibility"
import { getCurrentUserSync, isOnboardingComplete, completeOnboarding, incrementStats, type User } from "@/lib/auth"
import { updateStreak, incrementGamificationStat, type Badge } from "@/lib/gamification"

type Tab = "home" | "community" | "history" | "settings"
type View = "home" | "status"

export interface HistoryItem {
  id: string
  location: string
  street: string
  date: Date
  status: "allowed" | "restricted" | "prohibited"
  result: ParkingResult
  coordinates: { lat: number; lng: number }
}

export default function ParkingApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [currentView, setCurrentView] = useState<View>("home")
  
  // Auth & Onboarding state
  const [user, setUser] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [parkingResult, setParkingResult] = useState<ParkingResult | null>(null)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showScanSign, setShowScanSign] = useState(false)
  const [showPhotoVault, setShowPhotoVault] = useState(false)
  const [showReportIssue, setShowReportIssue] = useState(false)
  const [showPredictions, setShowPredictions] = useState(false)
  const [showRewards, setShowRewards] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [activeSession, setActiveSession] = useState<ProtectionSession | null>(null)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null)
  const [remainingChecks, setRemainingChecks] = useState(10)
  const [reminderSet, setReminderSet] = useState(false)

  const { loading, error, getCurrentLocation } = useGeolocation()
  const {
    savedLocations,
    saveLocation,
    removeLocation,
    isLocationSaved,
    getLocationByCoords,
  } = useSavedLocations()
  const {
    isActive: timerActive,
    remainingSeconds: timerRemainingSeconds,
    startTimer,
    cancelTimer,
    formatTimeDisplay,
  } = useTimer()
  
  const { isOnline, cachedCount, cacheLocation, getCachedResult } = useOffline()
  const {
    isEnabled: biometricEnabled,
    isAuthenticated,
    isLoading: biometricLoading,
    error: biometricError,
    authenticate,
  } = useBiometric()

  // Check auth and onboarding state on mount
  useEffect(() => {
    const currentUser = getCurrentUserSync()
    setUser(currentUser)
    
    if (!isOnboardingComplete()) {
      setShowOnboarding(true)
    }
    
    // Apply accessibility settings
    const accessibilitySettings = getAccessibilitySettings()
    applyAccessibilityStyles(accessibilitySettings)
    
    // Update daily streak
    const { streakUpdated, newBadges } = updateStreak()
    if (newBadges.length > 0) {
      newBadges.forEach((badge) => {
        showToast("success", `Badge unlocked: ${badge.name}`, badge.description)
      })
    }
    
    setAuthChecked(true)
  }, [])

  // Load active session on mount and periodically update
  useEffect(() => {
    const updateSession = () => {
      setActiveSession(getActiveSessionSync())
      setSessionTimeRemaining(getSessionTimeRemaining())
      setRemainingChecks(getRemainingChecks())
    }

    updateSession()
    const interval = setInterval(updateSession, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const handleCheckParking = useCallback(async () => {
    if (!canMakeCheck()) {
      setShowUpgrade(true)
      return
    }

    const location = await getCurrentLocation()

    if (location) {
      const userAccessibility = getUserAccessibility()
      const result = checkParking(location.latitude, location.longitude, userAccessibility)
      setParkingResult(result)
      setCurrentLocation(location)
      setCurrentView("status")
      setReminderSet(false)

      // Start protection session if parking is allowed
      if (result.status !== "prohibited") {
        const session = startParkingSession(
          location.address,
          location.street,
          { lat: location.latitude, lng: location.longitude },
          result.timeRemaining
        )
        setActiveSession(session)
        setSessionTimeRemaining(result.timeRemaining)
        setRemainingChecks(getRemainingChecks())

        showToast(
          "success",
          "Protection activated",
          "You're covered if you get a ticket here"
        )
      }

      // Cache the result for offline use
      cacheLocation({
        coordinates: { lat: location.latitude, lng: location.longitude },
        address: location.address,
        result: {
          canPark: result.status !== "prohibited",
          status: result.status,
          message: result.message,
          timeRemaining: result.timeRemaining,
        },
      })

      // Track stats
      incrementStats("checks")
      const { newBadges: checkBadges } = incrementGamificationStat("checks")
      if (result.status !== "prohibited") {
        incrementStats("ticketsAvoided")
        incrementStats("moneySaved", 75) // Average ticket cost
        const { newBadges: avoidedBadges } = incrementGamificationStat("ticketsAvoided")
        checkBadges.push(...avoidedBadges)
      }
      
      // Show badge notifications
      if (checkBadges.length > 0) {
        checkBadges.forEach((badge) => {
          setTimeout(() => {
            showToast("success", `Badge unlocked: ${badge.name}`, badge.description)
          }, 1500)
        })
      }

      // Add to history
      const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        location: location.address,
        street: location.street,
        date: new Date(),
        status: result.status,
        result,
        coordinates: { lat: location.latitude, lng: location.longitude },
      }

      setHistory((prev) => [historyItem, ...prev.slice(0, 19)])
    }
  }, [getCurrentLocation])

  const handleResumeSession = useCallback(() => {
    const session = getActiveSessionSync()
    if (session) {
      const userAccessibility = getUserAccessibility()
      const result = checkParking(session.coordinates.lat, session.coordinates.lng, userAccessibility)
      setParkingResult(result)
      setCurrentLocation({
        latitude: session.coordinates.lat,
        longitude: session.coordinates.lng,
        address: session.locationAddress,
        street: session.locationStreet,
        city: "",
        timestamp: new Date(),
      })
      setActiveTab("home")
      setCurrentView("status")
      setReminderSet(session.reminder.enabled)
    }
  }, [])

  const handleCheckSavedLocation = useCallback((savedLoc: SavedLocation) => {
    if (!canMakeCheck()) {
      setShowUpgrade(true)
      return
    }

    const userAccessibility = getUserAccessibility()
    const result = checkParking(savedLoc.coordinates.lat, savedLoc.coordinates.lng, userAccessibility)
    setParkingResult(result)
    setCurrentLocation({
      latitude: savedLoc.coordinates.lat,
      longitude: savedLoc.coordinates.lng,
      address: savedLoc.address,
      street: savedLoc.street,
      city: "",
      timestamp: new Date(),
    })
    setActiveTab("home")
    setCurrentView("status")
    setReminderSet(false)

    // Start protection session if parking is allowed
    if (result.status !== "prohibited") {
      const session = startParkingSession(
        savedLoc.address,
        savedLoc.name || savedLoc.street,
        savedLoc.coordinates,
        result.timeRemaining
      )
      setActiveSession(session)
      setSessionTimeRemaining(result.timeRemaining)
      setRemainingChecks(getRemainingChecks())

      showToast(
        "success",
        "Protection activated",
        "You're covered if you get a ticket here"
      )
    }

    const historyItem: HistoryItem = {
      id: crypto.randomUUID(),
      location: savedLoc.address,
      street: savedLoc.name || savedLoc.street,
      date: new Date(),
      status: result.status,
      result,
      coordinates: savedLoc.coordinates,
    }

    setHistory((prev) => [historyItem, ...prev.slice(0, 19)])
  }, [])

  const handleBack = () => {
    setCurrentView("home")
    setParkingResult(null)
  }

  const handleEndSession = () => {
    endParkingSession()
    setActiveSession(null)
    setSessionTimeRemaining(null)
    setCurrentView("home")
    setParkingResult(null)
    showToast("info", "Session ended", "Your parking protection has been deactivated")
  }

  const handleSetReminder = async () => {
    if (!parkingResult?.timeRemaining) return

    if ("Notification" in window) {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        const reminderMinutes = Math.max(0, parkingResult.timeRemaining - 10)
        const reminderTime = new Date(Date.now() + reminderMinutes * 60 * 1000)

        setSessionReminder(reminderTime)
        setReminderSet(true)

        setTimeout(
          () => {
            new Notification("Park Reminder", {
              body: "Your parking time expires in 10 minutes. Consider moving your vehicle.",
              icon: "/favicon.ico",
            })
          },
          reminderMinutes * 60 * 1000
        )

        showToast(
          "success",
          "Reminder set",
          parkingResult.timeRemaining > 10
            ? "We'll notify you 10 minutes before time expires"
            : "We'll notify you when time expires"
        )
      } else {
        showToast("error", "Notifications blocked", "Please enable notifications in your browser settings")
      }
    } else {
      showToast("error", "Not supported", "Notifications are not supported in this browser")
    }
  }

  const handleSaveCurrentLocation = () => {
    if (!currentLocation) return

    saveLocation({
      name: "",
      street: currentLocation.street,
      address: currentLocation.address,
      coordinates: {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      },
    })

    showToast("success", "Location saved", "Added to your saved places")
  }

  const handleRemoveCurrentLocation = () => {
    if (!currentLocation) return

    const existing = getLocationByCoords(currentLocation.latitude, currentLocation.longitude)
    if (existing) {
      removeLocation(existing.id)
      showToast("info", "Location removed", "Removed from your saved places")
    }
  }

  const handleHistoryItemClick = (item: HistoryItem) => {
    if (!canMakeCheck()) {
      setShowUpgrade(true)
      return
    }

    const userAccessibility = getUserAccessibility()
    const result = checkParking(item.coordinates.lat, item.coordinates.lng, userAccessibility)
    setParkingResult(result)
    setCurrentLocation({
      latitude: item.coordinates.lat,
      longitude: item.coordinates.lng,
      address: item.location,
      street: item.street,
      city: "",
      timestamp: new Date(),
    })
    setActiveTab("home")
    setCurrentView("status")
    setReminderSet(false)

    if (result.status !== "prohibited") {
      const session = startParkingSession(
        item.location,
        item.street,
        item.coordinates,
        result.timeRemaining
      )
      setActiveSession(session)
      setSessionTimeRemaining(result.timeRemaining)
      setRemainingChecks(getRemainingChecks())

      showToast(
        "success",
        "Protection activated",
        "You're covered if you get a ticket here"
      )
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === "home") {
      setCurrentView("home")
      setParkingResult(null)
    }
  }

  const handleUpgrade = () => {
    upgradeToProTier()
    setRemainingChecks(-1) // Unlimited
    setShowUpgrade(false)
    showToast("success", "Welcome to Pro", "You now have unlimited checks and ticket protection")
  }

  const handleSetTimer = async (minutes: number) => {
    setShowTimer(false)
    
    await startTimer(minutes)
    
    const notifications: string[] = []
    if (minutes > 20) notifications.push("20 min")
    if (minutes > 10) notifications.push("10 min")
    if (minutes > 5) notifications.push("5 min")
    
    showToast(
      "success",
      "Timer started",
      notifications.length > 0
        ? `We'll notify you at ${notifications.join(", ")} before time's up`
        : `We'll notify you when time expires`
    )
  }

  const handleCancelTimer = () => {
    cancelTimer()
    showToast("info", "Timer cancelled", "Your parking timer has been stopped")
  }

  // Onboarding handlers
  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setShowPermissions(true)
  }

  const handleOnboardingSkip = () => {
    completeOnboarding()
    setShowOnboarding(false)
    setShowAuth(true)
  }

  const handlePermissionsComplete = () => {
    completeOnboarding()
    setShowPermissions(false)
    setShowAuth(true)
  }

  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser)
    setShowAuth(false)
    showToast("success", `Welcome, ${authUser.name}`, "Your account is ready")
  }

  const handleAuthSkip = () => {
    setShowAuth(false)
  }

  const handleSignOut = () => {
    setUser(null)
    setShowAccount(false)
    showToast("info", "Signed out", "See you next time")
  }

  // Voice command handler - must be after handleCheckParking is defined
  const handleVoiceCommand = useCallback((action: string) => {
    switch (action) {
      case "check":
        handleCheckParking()
        break
      case "scan":
        setShowScanSign(true)
        break
      case "timer":
        setShowTimer(true)
        break
      case "cancel-timer":
        cancelTimer()
        showToast("info", "Timer cancelled", "Your parking timer has been stopped")
        break
      case "history":
        setActiveTab("history")
        break
      case "settings":
        setActiveTab("settings")
        break
      case "home":
        setActiveTab("home")
        setCurrentView("home")
        break
      case "community":
        setActiveTab("community")
        break
      case "help":
        showToast(
          "info",
          "Voice Commands",
          "Try: Check parking, Scan sign, Set timer, History, Settings"
        )
        break
    }
  }, [handleCheckParking, cancelTimer])

  const {
    isListening,
    isSupported: voiceSupported,
    transcript,
    toggleListening,
  } = useVoiceCommands(handleVoiceCommand)

  const handleScanResult = (canPark: boolean, timeLimit?: number) => {
    setShowScanSign(false)
    
    if (canPark) {
      showToast(
        "success",
        "Parking allowed",
        timeLimit ? `${timeLimit / 60} hour limit detected` : "No time restrictions found"
      )
      
      // If there's a time limit, offer to set a timer
      if (timeLimit) {
        setTimeout(() => {
          setShowTimer(true)
        }, 1500)
      }
    } else {
      showToast(
        "error",
        "Don't park here",
        "The sign indicates parking is not allowed"
      )
    }
  }

  const renderContent = () => {
    if (showAccount && user) {
      return (
        <AccountScreen
          user={user}
          onBack={() => setShowAccount(false)}
          onSignOut={handleSignOut}
          onUpgrade={() => setShowUpgrade(true)}
          onUserUpdate={(updated) => setUser(updated)}
        />
      )
    }

    if (showPredictions) {
      return (
        <PredictionsScreen
          onBack={() => setShowPredictions(false)}
          currentLocation={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
        />
      )
    }

    if (showRewards) {
      return <RewardsScreen onBack={() => setShowRewards(false)} />
    }

    if (showMap) {
      return (
        <MapScreen
          onBack={() => setShowMap(false)}
          currentLocation={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
        />
      )
    }

    if (showAccessibility) {
      return <AccessibilityScreen onBack={() => setShowAccessibility(false)} />
    }

    if (activeTab === "community") {
      return (
        <CommunityScreen
          currentLocation={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
          currentAddress={currentLocation?.address}
          onOpenPhotoVault={() => setShowPhotoVault(true)}
          onOpenReportIssue={() => setShowReportIssue(true)}
          showToast={showToast}
        />
      )
    }

    if (activeTab === "history") {
      return (
        <HistoryScreen 
          history={history} 
          onItemClick={handleHistoryItemClick} 
          onCheckParking={handleCheckParking}
        />
      )
    }

    if (activeTab === "settings") {
      return (
<SettingsScreen
          onUpgrade={() => setShowUpgrade(true)}
          user={user}
          onOpenAccount={() => setShowAccount(true)}
          onSignIn={() => setShowAuth(true)}
          onOpenAccessibilitySettings={() => setShowAccessibility(true)}
        />
      )
    }

    // Home tab
    if (currentView === "status" && parkingResult && currentLocation) {
      const isSaved = isLocationSaved(currentLocation.latitude, currentLocation.longitude)
      const isProtected = activeSession?.status === "active"

      return (
        <StatusScreen
          result={parkingResult}
          location={currentLocation.street}
          fullAddress={currentLocation.address}
          coordinates={{
            lat: currentLocation.latitude,
            lng: currentLocation.longitude,
          }}
          onBack={handleBack}
          onSetReminder={handleSetReminder}
          onEndSession={handleEndSession}
          isSaved={isSaved}
          onSaveLocation={handleSaveCurrentLocation}
          onRemoveLocation={handleRemoveCurrentLocation}
          isProtected={isProtected}
          reminderSet={reminderSet}
        />
      )
    }

    return (
      <HomeScreen
        onCheckParking={handleCheckParking}
        onResumeSession={handleResumeSession}
        onScanSign={() => setShowScanSign(true)}
        onSetTimer={() => setShowTimer(true)}
        onOpenPredictions={() => setShowPredictions(true)}
        onOpenRewards={() => setShowRewards(true)}
        onOpenMap={() => setShowMap(true)}
        loading={loading}
        error={error}
        activeSession={activeSession}
        sessionTimeRemaining={sessionTimeRemaining}
        remainingChecks={remainingChecks}
        onUpgrade={() => setShowUpgrade(true)}
        currentLocation={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
        timerActive={timerActive}
        timerRemainingSeconds={timerRemainingSeconds}
        formatTimerDisplay={formatTimeDisplay}
        onCancelTimer={handleCancelTimer}
      />
    )
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Park</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show onboarding flow for first-time users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
  }

  // Show permission requests
  if (showPermissions) {
    return <PermissionRequest onComplete={handlePermissionsComplete} />
  }

  // Show auth screen
  if (showAuth) {
    return <AuthScreen onSuccess={handleAuthSuccess} onSkip={handleAuthSkip} />
  }

  // Show biometric lock if enabled and not authenticated
  if (biometricEnabled && !isAuthenticated) {
    return (
      <BiometricLock
        onAuthenticate={authenticate}
        isLoading={biometricLoading}
        error={biometricError}
      />
    )
  }

  return (
    <ToastProvider>
      <main className="min-h-screen bg-background">
        {/* Offline banner */}
        {!isOnline && <OfflineBanner cachedCount={cachedCount} />}
        
        <div className={`max-w-md mx-auto ${!isOnline ? "pt-12" : ""}`}>
          {renderContent()}
        </div>
        <VoiceButton
          isListening={isListening}
          isSupported={voiceSupported}
          transcript={transcript}
          onToggle={toggleListening}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        <InstallPrompt />
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={handleUpgrade}
        />
        <TimerModal
          isOpen={showTimer}
          onClose={() => setShowTimer(false)}
          onSetTimer={handleSetTimer}
        />
        <ScanSignModal
          isOpen={showScanSign}
          onClose={() => setShowScanSign(false)}
          onResult={handleScanResult}
        />
        <PhotoVault
          isOpen={showPhotoVault}
          onClose={() => setShowPhotoVault(false)}
          currentLocation={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
          currentAddress={currentLocation?.address}
          showToast={showToast}
        />
        <ReportIssueModal
          isOpen={showReportIssue}
          onClose={() => setShowReportIssue(false)}
          currentLocation={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
          currentAddress={currentLocation?.address}
          showToast={showToast}
        />
      </main>
    </ToastProvider>
  )
}
