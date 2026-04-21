"use client"

import { SavedScreen } from "@/components/screens/saved-screen"
import { useAppContext } from "@/lib/app-context"

export default function SavedPage() {
  const ctx = useAppContext()

  return (
    <SavedScreen
      savedLocations={ctx.savedLocations}
      onLocationClick={(location) => ctx.handleCheckSavedLocation(location)}
      onRemoveLocation={(id) => ctx.removeLocation(id)}
    />
  )
}
