"use client"

import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  WifiOff, 
  MapPinOff, 
  RefreshCw,
  ShieldOff,
  ServerOff
} from "lucide-react"

interface ErrorStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function ErrorState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {action && (
        <Button 
          onClick={action.onClick} 
          className="rounded-xl"
          disabled={action.loading}
        >
          {action.loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {action.label}
        </Button>
      )}
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  )
}

// Pre-built error states

export function LocationError({ onRetry, onSkip }: { onRetry: () => void; onSkip?: () => void }) {
  return (
    <ErrorState
      icon={<MapPinOff className="w-7 h-7 text-destructive" />}
      title="Location unavailable"
      description="We couldn't get your location. Please make sure location services are enabled and try again."
      action={{
        label: "Try Again",
        onClick: onRetry
      }}
      secondaryAction={onSkip ? {
        label: "Enter address manually",
        onClick: onSkip
      } : undefined}
    />
  )
}

export function NetworkError({ onRetry, loading }: { onRetry: () => void; loading?: boolean }) {
  return (
    <ErrorState
      icon={<WifiOff className="w-7 h-7 text-destructive" />}
      title="No connection"
      description="Please check your internet connection and try again."
      action={{
        label: "Retry",
        onClick: onRetry,
        loading
      }}
    />
  )
}

export function ServerError({ onRetry, loading }: { onRetry: () => void; loading?: boolean }) {
  return (
    <ErrorState
      icon={<ServerOff className="w-7 h-7 text-destructive" />}
      title="Something went wrong"
      description="We're having trouble connecting to our servers. Please try again in a moment."
      action={{
        label: "Try Again",
        onClick: onRetry,
        loading
      }}
    />
  )
}

export function PermissionDenied({ 
  type, 
  onOpenSettings 
}: { 
  type: "location" | "notifications" | "camera"
  onOpenSettings: () => void 
}) {
  const titles = {
    location: "Location access denied",
    notifications: "Notifications blocked",
    camera: "Camera access denied"
  }
  
  const descriptions = {
    location: "Park needs location access to check parking rules. Please enable it in your browser settings.",
    notifications: "Enable notifications to receive parking reminders and alerts.",
    camera: "Camera access is needed to scan parking signs."
  }

  return (
    <ErrorState
      icon={<ShieldOff className="w-7 h-7 text-destructive" />}
      title={titles[type]}
      description={descriptions[type]}
      action={{
        label: "Open Settings",
        onClick: onOpenSettings
      }}
    />
  )
}

export function GenericError({ 
  message, 
  onRetry, 
  loading 
}: { 
  message?: string
  onRetry: () => void
  loading?: boolean 
}) {
  return (
    <ErrorState
      icon={<AlertTriangle className="w-7 h-7 text-destructive" />}
      title="Oops, something went wrong"
      description={message || "An unexpected error occurred. Please try again."}
      action={{
        label: "Try Again",
        onClick: onRetry,
        loading
      }}
    />
  )
}

// Inline error message for forms
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive mt-2">
      <AlertTriangle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  )
}

// Error boundary fallback
export function ErrorBoundaryFallback({ 
  error, 
  resetError 
}: { 
  error: Error
  resetError: () => void 
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <ErrorState
        icon={<AlertTriangle className="w-7 h-7 text-destructive" />}
        title="Something crashed"
        description="We're sorry, but something went wrong. Please refresh the page or try again."
        action={{
          label: "Refresh Page",
          onClick: resetError
        }}
      />
    </div>
  )
}
