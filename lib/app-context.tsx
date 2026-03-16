"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useGeolocation, type LocationData } from "@/hooks/use-geolocation"
import { useSavedLocations, type SavedLocation } from "@/hooks/use-saved-locations"
import { useTimer } from "@/hooks/use-timer"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { useOffline } from "@/hooks/use-offline"
import { useBiometric } from "@/hooks/use-biometric"
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
import { getCurrentUserSync, getCurrentUser, isOnboardingComplete, completeOnboarding, incrementStats, type User } from "@/lib/auth"
import { updateStreak, incrementGamificationStat } from "@/lib/gamification"
import { getAccessibilitySettings, applyAccessibilityStyles } from "@/lib/accessibility"
import { showToast } from "@/components/ui/toast-notification"
import { VoiceButton } from "@/components/voice-button"
import type { HistoryItem } from "@/lib/types"

interface AppContextValue {
  // Auth & onboarding
  user: User | null
  authChecked: boolean
  showOnboarding: boolean
  setShowOnboarding: (v: boolean) => void
  showPermissions: boolean
  setShowPermissions: (v: boolean) => void
  showAuth: boolean
  setShowAuth: (v: boolean) => void
  showAccount: boolean
  setShowAccount: (v: boolean) => void

  // Parking state
  parkingResult: ParkingResult | null
  currentLocation: LocationData | null
  history: HistoryItem[]
  activeSession: ProtectionSession | null
  sessionTimeRemaining: number | null
  remainingChecks: number
  reminderSet: boolean
  setReminderSet: (v: boolean) => void

  // Modals
  showUpgrade: boolean
  setShowUpgrade: (v: boolean) => void
  showTimer: boolean
  setShowTimer: (v: boolean) => void
  showScanSign: boolean
  setShowScanSign: (v: boolean) => void
  showPhotoVault: boolean
  setShowPhotoVault: (v: boolean) => void
  showReportIssue: boolean
  setShowReportIssue: (v: boolean) => void

  // Handlers
  handleCheckParking: () => Promise<void>
  handleResumeSession: () => void
  handleCheckSavedLocation: (savedLoc: SavedLocation) => Promise<void>
  handleBack: () => void
  handleEndSession: () => Promise<void>
  handleSetReminder: () => Promise<void>
  handleSaveCurrentLocation: () => void
  handleRemoveCurrentLocation: () => void
  handleHistoryItemClick: (item: HistoryItem) => Promise<void>
  handleUpgrade: () => void
  handleSetTimer: (minutes: number) => Promise<void>
  handleCancelTimer: () => void
  handleOnboardingComplete: () => void
  handleOnboardingSkip: () => void
  handlePermissionsComplete: () => void
  handleAuthSuccess: (user: User) => void
  handleAuthSkip: () => void
  handleSignOut: () => void
  handleScanResult: (canPark: boolean, timeLimit?: number) => void
  setUser: (u: User | null) => void
  setHistory: (h: HistoryItem[] | ((prev: HistoryItem[]) => HistoryItem[])) => void

  // Hooks data
  loading: boolean
  error: string | null
  savedLocations: SavedLocation[]
  saveLocation: (loc: Omit<SavedLocation, "id" | "createdAt">) => SavedLocation
  removeLocation: (id: string) => void
  isLocationSaved: (lat: number, lng: number) => boolean
  timerActive: boolean
  timerRemainingSeconds: number | null
  formatTimeDisplay: (seconds: number) => string
  isOnline: boolean
  cachedCount: number
  biometricEnabled: boolean
  isAuthenticated: boolean
  biometricLoading: boolean
  biometricError: string | null
  authenticate: () => Promise<boolean>
}

const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppContext must be used within AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [parkingResult, setParkingResult] = useState<ParkingResult | null>(null)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showScanSign, setShowScanSign] = useState(false)
  const [showPhotoVault, setShowPhotoVault] = useState(false)
  const [showReportIssue, setShowReportIssue] = useState(false)
  const [activeSession, setActiveSession] = useState<ProtectionSession | null>(null)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null)
  const [remainingChecks, setRemainingChecks] = useState(10)
  const [reminderSet, setReminderSet] = useState(false)

  const { loading, error, getCurrentLocation } = useGeolocation()
  const { savedLocations, saveLocation, removeLocation, isLocationSaved, getLocationByCoords } = useSavedLocations()
  const { isActive: timerActive, remainingSeconds: timerRemainingSeconds, startTimer, cancelTimer, formatTimeDisplay } = useTimer()
  const { isOnline, cachedCount, cacheLocation } = useOffline()
  const { isEnabled: biometricEnabled, isAuthenticated, isLoading: biometricLoading, error: biometricError, authenticate } = useBiometric()

  useEffect(() => {
    const syncUser = getCurrentUserSync()
    if (syncUser) setUser(syncUser)
    getCurrentUser()
      .then((u) => {
        if (u) setUser(u)
        if (!isOnboardingComplete()) setShowOnboarding(true)
        const a11y = getAccessibilitySettings()
        applyAccessibilityStyles(a11y)
        const { newBadges } = updateStreak()
        newBadges.forEach((b) => showToast("success", `Badge unlocked: ${b.name}`, b.description))
      })
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    const update = () => {
      setActiveSession(getActiveSessionSync())
      setSessionTimeRemaining(getSessionTimeRemaining())
      setRemainingChecks(getRemainingChecks())
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  const handleCheckParking = useCallback(async () => {
    if (!canMakeCheck()) {
      setShowUpgrade(true)
      return
    }
    const location = await getCurrentLocation()
    if (!location) return

    const userAccessibility = getUserAccessibility()
    const result = checkParking(location.latitude, location.longitude, userAccessibility)
    setParkingResult(result)
    setCurrentLocation(location)
    setReminderSet(false)

    if (result.status !== "prohibited") {
      const session = await startParkingSession(
        location.address,
        location.street,
        { lat: location.latitude, lng: location.longitude },
        result.timeRemaining
      )
      setActiveSession(session)
      setSessionTimeRemaining(getSessionTimeRemaining())
      setRemainingChecks(getRemainingChecks())
      showToast("success", "Protection activated", "You're covered if you get a ticket here")
    }

    cacheLocation({
      coordinates: { lat: location.latitude, lng: location.longitude },
      address: location.address,
      result: {
        canPark: result.status !== "prohibited",
        status: result.status,
        message: result.description,
        timeRemaining: result.timeRemaining ?? undefined,
      },
    })

    incrementStats("checks")
    const { newBadges: checkBadges } = incrementGamificationStat("checks")
    if (result.status !== "prohibited") {
      incrementStats("ticketsAvoided")
      incrementStats("moneySaved", 75)
      const { newBadges: avoidedBadges } = incrementGamificationStat("ticketsAvoided")
      checkBadges.push(...avoidedBadges)
    }
    checkBadges.forEach((badge) =>
      setTimeout(() => showToast("success", `Badge unlocked: ${badge.name}`, badge.description), 1500)
    )

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

    router.push("/status")
  }, [getCurrentLocation, cacheLocation, router])

  const handleResumeSession = useCallback(() => {
    const session = getActiveSessionSync()
    if (!session) return
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
    setReminderSet(session.reminder.enabled)
    router.push("/status")
  }, [router])

  const handleCheckSavedLocation = useCallback(
    async (savedLoc: SavedLocation) => {
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
      setReminderSet(false)

      if (result.status !== "prohibited") {
        const session = await startParkingSession(
          savedLoc.address,
          savedLoc.name || savedLoc.street,
          savedLoc.coordinates,
          result.timeRemaining
        )
        setActiveSession(session)
        setSessionTimeRemaining(getSessionTimeRemaining())
        setRemainingChecks(getRemainingChecks())
        showToast("success", "Protection activated", "You're covered if you get a ticket here")
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
      router.push("/status")
    },
    [router]
  )

  const handleBack = useCallback(() => {
    setParkingResult(null)
    router.push("/")
  }, [router])

  const handleEndSession = useCallback(async () => {
    await endParkingSession()
    setActiveSession(null)
    setSessionTimeRemaining(null)
    setParkingResult(null)
    showToast("info", "Session ended", "Your parking protection has been deactivated")
    router.push("/")
  }, [router])

  const handleSetReminder = useCallback(async () => {
    if (!parkingResult?.timeRemaining) return
    if (!("Notification" in window)) {
      showToast("error", "Not supported", "Notifications are not supported in this browser")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      showToast("error", "Notifications blocked", "Please enable notifications in your browser settings")
      return
    }
    const reminderMinutes = Math.max(0, parkingResult.timeRemaining - 10)
    const reminderTime = new Date(Date.now() + reminderMinutes * 60 * 1000)
    await setSessionReminder(reminderTime)
    setReminderSet(true)
    setTimeout(
      () =>
        new Notification("Park Reminder", {
          body: "Your parking time expires in 10 minutes. Consider moving your vehicle.",
          icon: "/favicon.ico",
        }),
      reminderMinutes * 60 * 1000
    )
    showToast(
      "success",
      "Reminder set",
      parkingResult.timeRemaining > 10
        ? "We'll notify you 10 minutes before time expires"
        : "We'll notify you when time expires"
    )
  }, [parkingResult])

  const handleSaveCurrentLocation = useCallback(() => {
    if (!currentLocation) return
    saveLocation({
      name: "",
      street: currentLocation.street,
      address: currentLocation.address,
      coordinates: { lat: currentLocation.latitude, lng: currentLocation.longitude },
    })
    showToast("success", "Location saved", "Added to your saved places")
  }, [currentLocation, saveLocation])

  const handleRemoveCurrentLocation = useCallback(() => {
    if (!currentLocation) return
    const existing = getLocationByCoords(currentLocation.latitude, currentLocation.longitude)
    if (existing) {
      removeLocation(existing.id)
      showToast("info", "Location removed", "Removed from your saved places")
    }
  }, [currentLocation, getLocationByCoords, removeLocation])

  const handleHistoryItemClick = useCallback(
    async (item: HistoryItem) => {
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
      setReminderSet(false)

      if (result.status !== "prohibited") {
        const session = await startParkingSession(
          item.location,
          item.street,
          item.coordinates,
          result.timeRemaining
        )
        setActiveSession(session)
        setSessionTimeRemaining(getSessionTimeRemaining())
        setRemainingChecks(getRemainingChecks())
        showToast("success", "Protection activated", "You're covered if you get a ticket here")
      }
      router.push("/status")
    },
    [router]
  )

  const handleUpgrade = useCallback(() => {
    upgradeToProTier()
    setRemainingChecks(-1)
    setShowUpgrade(false)
    showToast("success", "Welcome to Pro", "You now have unlimited checks and ticket protection")
  }, [])

  const handleSetTimer = useCallback(async (minutes: number) => {
    setShowTimer(false)
    await startTimer(minutes)
    const notifications: string[] = []
    if (minutes > 20) notifications.push("20 min")
    if (minutes > 10) notifications.push("10 min")
    if (minutes > 5) notifications.push("5 min")
    showToast(
      "success",
      "Timer started",
      notifications.length > 0 ? `We'll notify you at ${notifications.join(", ")} before time's up` : "We'll notify you when time expires"
    )
  }, [startTimer])

  const handleCancelTimer = useCallback(() => {
    cancelTimer()
    showToast("info", "Timer cancelled", "Your parking timer has been stopped")
  }, [cancelTimer])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
    setShowPermissions(true)
  }, [])

  const handleOnboardingSkip = useCallback(() => {
    completeOnboarding()
    setShowOnboarding(false)
    setShowAuth(true)
  }, [])

  const handlePermissionsComplete = useCallback(() => {
    completeOnboarding()
    setShowPermissions(false)
    setShowAuth(true)
  }, [])

  const handleAuthSuccess = useCallback((authUser: User) => {
    setUser(authUser)
    setShowAuth(false)
    showToast("success", `Welcome, ${authUser.name}`, "Your account is ready")
  }, [])

  const handleAuthSkip = useCallback(() => setShowAuth(false), [])

  const handleSignOut = useCallback(() => {
    setUser(null)
    setShowAccount(false)
    showToast("info", "Signed out", "See you next time")
  }, [])

  const handleScanResult = useCallback((canPark: boolean, timeLimit?: number) => {
    setShowScanSign(false)
    if (canPark) {
      showToast("success", "Parking allowed", timeLimit ? `${timeLimit / 60} hour limit detected` : "No time restrictions found")
      if (timeLimit) setTimeout(() => setShowTimer(true), 1500)
    } else {
      showToast("error", "Don't park here", "The sign indicates parking is not allowed")
    }
  }, [])

  const handleVoiceCommand = useCallback(
    (action: string) => {
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
          handleCancelTimer()
          break
        case "history":
          router.push("/history")
          break
        case "settings":
          router.push("/settings")
          break
        case "home":
          router.push("/")
          break
        case "community":
          router.push("/community")
          break
        case "help":
          showToast("info", "Voice Commands", "Try: Check parking, Scan sign, Set timer, History, Settings")
          break
      }
    },
    [handleCheckParking, handleCancelTimer, router]
  )

  const { isListening, isSupported: voiceSupported, transcript, toggleListening } = useVoiceCommands(handleVoiceCommand)

  const value: AppContextValue = {
    user,
    authChecked,
    showOnboarding,
    setShowOnboarding,
    showPermissions,
    setShowPermissions,
    showAuth,
    setShowAuth,
    showAccount,
    setShowAccount,
    parkingResult,
    currentLocation,
    history,
    activeSession,
    sessionTimeRemaining,
    remainingChecks,
    reminderSet,
    setReminderSet,
    showUpgrade,
    setShowUpgrade,
    showTimer,
    setShowTimer,
    showScanSign,
    setShowScanSign,
    showPhotoVault,
    setShowPhotoVault,
    showReportIssue,
    setShowReportIssue,
    handleCheckParking,
    handleResumeSession,
    handleCheckSavedLocation,
    handleBack,
    handleEndSession,
    handleSetReminder,
    handleSaveCurrentLocation,
    handleRemoveCurrentLocation,
    handleHistoryItemClick,
    handleUpgrade,
    handleSetTimer,
    handleCancelTimer,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handlePermissionsComplete,
    handleAuthSuccess,
    handleAuthSkip,
    handleSignOut,
    handleScanResult,
    setUser,
    setHistory,
    loading,
    error,
    savedLocations,
    saveLocation,
    removeLocation,
    isLocationSaved,
    timerActive,
    timerRemainingSeconds,
    formatTimeDisplay,
    isOnline,
    cachedCount,
    biometricEnabled,
    isAuthenticated,
    biometricLoading,
    biometricError,
    authenticate,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      <VoiceButton isListening={isListening} isSupported={voiceSupported} transcript={transcript} onToggle={toggleListening} />
    </AppContext.Provider>
  )
}
