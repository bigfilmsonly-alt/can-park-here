"use client"

import { MapPin, Bookmark, Trash2 } from "lucide-react"
import type { SavedLocation } from "@/hooks/use-saved-locations"

interface SavedScreenProps {
  savedLocations: SavedLocation[]
  onLocationClick: (location: SavedLocation) => void
  onRemoveLocation: (id: string) => void
}

export function SavedScreen({ savedLocations, onLocationClick, onRemoveLocation }: SavedScreenProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Saved</h1>

      {savedLocations.length > 0 ? (
        <div className="mt-8 space-y-1">
          {savedLocations.map((location, index) => (
            <div key={location.id}>
              <div className="flex items-center justify-between py-4">
                <button
                  onClick={() => onLocationClick(location)}
                  className="flex items-start gap-3 min-w-0 flex-1 text-left hover:opacity-70 transition-opacity"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-medium text-foreground truncate">
                      {location.name || location.street}
                    </span>
                    {location.name && (
                      <span className="text-sm text-muted-foreground mt-0.5 truncate">
                        {location.street}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => onRemoveLocation(location.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove saved location"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {index < savedLocations.length - 1 && <div className="h-px bg-border" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bookmark className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">No saved locations</p>
          <p className="text-sm text-muted-foreground/70 text-center mt-1">
            Save locations to quickly check them later
          </p>
        </div>
      )}
    </div>
  )
}
