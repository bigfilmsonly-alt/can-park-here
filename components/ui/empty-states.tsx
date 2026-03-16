"use client"

import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MapPin, 
  Users, 
  Camera, 
  Bell, 
  Search,
  Bookmark,
  FileText,
  Shield,
  Plus
} from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="rounded-xl">
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

// Pre-built empty states for specific screens

export function EmptyHistory({ onCheckParking }: { onCheckParking: () => void }) {
  return (
    <EmptyState
      icon={<Clock className="w-7 h-7 text-muted-foreground" />}
      title="No parking history yet"
      description="Your parking checks will appear here. Check a spot to get started."
      action={{
        label: "Check Parking",
        onClick: onCheckParking
      }}
    />
  )
}

export function EmptySavedLocations({ onCheckParking }: { onCheckParking: () => void }) {
  return (
    <EmptyState
      icon={<Bookmark className="w-7 h-7 text-muted-foreground" />}
      title="No saved locations"
      description="Save your frequent parking spots for quick access later."
      action={{
        label: "Check a Spot to Save",
        onClick: onCheckParking
      }}
    />
  )
}

export function EmptyCommunityReports({ onReport }: { onReport: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-7 h-7 text-muted-foreground" />}
      title="No reports nearby"
      description="Be the first to report enforcement activity or meter status in your area."
      action={{
        label: "Add Report",
        onClick: onReport
      }}
    />
  )
}

export function EmptyPhotoVault({ onAddPhoto }: { onAddPhoto: () => void }) {
  return (
    <EmptyState
      icon={<Camera className="w-7 h-7 text-muted-foreground" />}
      title="No photos saved"
      description="Save photos of parking signs, meters, or receipts for evidence in case of disputes."
      action={{
        label: "Add Photo",
        onClick: onAddPhoto
      }}
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-7 h-7 text-muted-foreground" />}
      title="No notifications"
      description="You're all caught up. Parking alerts and reminders will appear here."
    />
  )
}

export function EmptySearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={<Search className="w-7 h-7 text-muted-foreground" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search.`}
      action={{
        label: "Clear Search",
        onClick: onClear
      }}
    />
  )
}

export function EmptyProtectionClaims() {
  return (
    <EmptyState
      icon={<Shield className="w-7 h-7 text-muted-foreground" />}
      title="No claims filed"
      description="If you receive a ticket while following our guidance, you can file a claim here."
    />
  )
}

export function EmptyFleetVehicles({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<Plus className="w-7 h-7 text-muted-foreground" />}
      title="No vehicles added"
      description="Add vehicles to your fleet to start tracking their parking sessions."
      action={{
        label: "Add Vehicle",
        onClick: onAdd
      }}
    />
  )
}

export function EmptyPredictions({ onEnable }: { onEnable: () => void }) {
  return (
    <EmptyState
      icon={<MapPin className="w-7 h-7 text-muted-foreground" />}
      title="Enable location for predictions"
      description="We need your location to show parking predictions for your area."
      action={{
        label: "Enable Location",
        onClick: onEnable
      }}
    />
  )
}

export function EmptyInsuranceReports() {
  return (
    <EmptyState
      icon={<FileText className="w-7 h-7 text-muted-foreground" />}
      title="No reports yet"
      description="Your monthly parking compliance reports will appear here once generated."
    />
  )
}
