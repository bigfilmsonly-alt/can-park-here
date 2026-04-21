"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Camera, 
  X, 
  Trash2, 
  MapPin, 
  Calendar,
  Tag,
  Plus,
  Image as ImageIcon,
  ChevronLeft
} from "lucide-react"
import {
  type PhotoEvidence,
  savePhotoEvidence,
  getPhotoEvidence,
  deletePhotoEvidence,
} from "@/lib/community"

interface PhotoVaultProps {
  isOpen: boolean
  onClose: () => void
  currentLocation?: { lat: number; lng: number }
  currentAddress?: string
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

export function PhotoVault({
  isOpen,
  onClose,
  currentLocation,
  currentAddress,
  showToast,
}: PhotoVaultProps) {
  const [photos, setPhotos] = useState<PhotoEvidence[]>([])
  const [showCamera, setShowCamera] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEvidence | null>(null)
  const [caption, setCaption] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const availableTags = [
    "Parking Sign",
    "Meter",
    "Tow Zone",
    "Street Cleaning",
    "Permit Zone",
    "Handicap Space",
    "Loading Zone",
    "No Parking",
    "Time Limit",
    "Receipt",
    "Ticket",
    "Other"
  ]

  useEffect(() => {
    let cancelled = false
    const loadPhotos = async () => {
      const photos = await getPhotoEvidence()
      if (!cancelled && mountedRef.current) {
        setPhotos(photos)
      }
    }
    if (isOpen) {
      loadPhotos()
    }
    return () => {
      cancelled = true
    }
  }, [isOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
        setShowCamera(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePhoto = async () => {
    if (!previewUrl) return

    await savePhotoEvidence(
      previewUrl,
      caption || "Parking evidence",
      currentLocation,
      currentAddress,
      selectedTags
    )

    if (!mountedRef.current) return

    const updatedPhotos = await getPhotoEvidence()
    if (!mountedRef.current) return

    setPhotos(updatedPhotos)
    setShowCamera(false)
    setPreviewUrl(null)
    setCaption("")
    setSelectedTags([])
    showToast("success", "Photo saved", "Added to your evidence vault")
  }

  const handleDeletePhoto = async (id: string) => {
    await deletePhotoEvidence(id)
    if (!mountedRef.current) return

    const updatedPhotos = await getPhotoEvidence()
    if (!mountedRef.current) return

    setPhotos(updatedPhotos)
    setSelectedPhoto(null)
    showToast("info", "Photo deleted", "Removed from your vault")
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (!isOpen) return null

  // Photo detail view
  if (selectedPhoto) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => handleDeletePhoto(selectedPhoto.id)}
            className="text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <img
            src={selectedPhoto.photoUrl}
            alt={selectedPhoto.caption}
            className="w-full"
          />

          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{selectedPhoto.caption}</h2>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedPhoto.capturedAt)}</span>
            </div>

            {selectedPhoto.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{selectedPhoto.address}</span>
              </div>
            )}

            {selectedPhoto.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPhoto.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              This photo can be used as evidence if you receive a ticket and need to dispute it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Add photo view
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button 
            onClick={() => {
              setShowCamera(false)
              setPreviewUrl(null)
            }}
            className="flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Cancel
          </button>
          <h2 className="font-semibold">Add Evidence</h2>
          <div className="w-16" />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full rounded-2xl mb-6"
            />
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe this photo..."
                className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-sm focus:ring-2 focus:ring-ring"
              />
            </div>

            {currentAddress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{currentAddress}</span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-accent"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <Button
            onClick={handleSavePhoto}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            Save to Vault
          </Button>
        </div>
      </div>
    )
  }

  // Main vault view
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button 
          onClick={onClose}
          className="flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <h2 className="font-semibold">Photo Evidence Vault</h2>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No photos yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Save photos of parking signs, meters, and receipts as evidence in case of disputes.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-secondary"
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs font-medium truncate">
                    {photo.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="p-6 pt-0">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Photo
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
