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
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-28" role="main" aria-label="Saved locations">
      <div className="pt-16 px-5.5">
        <div className="px-0.5">
          <div className="text-[13px] font-semibold tracking-wider uppercase text-muted-foreground">
            Collection
          </div>
          <h1 className="text-[32px] font-bold tracking-tight mt-0.5">Saved</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--fg2)" }}>
            {savedLocations.length} {savedLocations.length === 1 ? "spot" : "spots"}
          </p>
        </div>

      <div className="mt-5">
        {savedLocations.length > 0 ? (
          <div
            className="bg-card card-elevated rounded-[22px] overflow-hidden"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}
          >
            {savedLocations.map((location, index) => (
              <div
                key={location.id}
                className="w-full px-4 py-3.5 flex items-center gap-3 press-effect"
                style={{
                  borderTop: index > 0 ? "1px solid var(--hairline)" : "none",
                }}
              >
                <button
                  onClick={() => onLocationClick(location)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent-bg, var(--muted))", color: "var(--accent)" }}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {location.name || location.street}
                    </span>
                    {location.name && (
                      <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
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
            ))}
          </div>
        ) : (
          <div
            className="bg-card card-elevated rounded-[22px] p-6 text-center"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}
          >
            <div className="w-14 h-14 rounded-[18px] bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="text-base font-bold mt-3.5">No saved locations</div>
            <div className="text-[13px] text-muted-foreground mt-1.5">
              Save spots from the map to quickly check them later.
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
