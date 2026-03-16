"use client"

import { cn } from "@/lib/utils"

// Base skeleton with shimmer animation
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

// Home screen skeleton
export function HomeScreenSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      {/* Alert skeleton */}
      <div className="mb-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Title */}
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-64 mb-8" />

        {/* Main button */}
        <Skeleton className="h-14 w-full max-w-xs rounded-2xl mb-4" />

        {/* Secondary buttons */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Status screen skeleton
export function StatusScreenSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      {/* Back button */}
      <Skeleton className="h-10 w-20 rounded-lg mb-6" />

      {/* Status card */}
      <div className="bg-card rounded-3xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <Skeleton className="h-20 w-full rounded-xl mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Action buttons */}
      <div className="mt-8 space-y-3">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  )
}

// History screen skeleton
export function HistoryScreenSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      <Skeleton className="h-8 w-24 mb-6" />

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Community screen skeleton
export function CommunityScreenSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-48 mb-6" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Settings screen skeleton
export function SettingsScreenSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      <Skeleton className="h-8 w-24 mb-6" />

      {/* Account card */}
      <Skeleton className="h-20 w-full rounded-2xl mb-6" />

      {/* Settings sections */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mb-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32 flex-1" />
                <Skeleton className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Generic card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl p-4 border border-border", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// Button skeleton
export function ButtonSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-12 w-full rounded-xl", className)} />
}

export { Skeleton }
