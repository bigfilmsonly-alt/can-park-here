export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
        <div className="h-6 w-40 rounded bg-accent animate-pulse" />
      </div>

      {/* Content skeleton blocks */}
      <div className="space-y-3">
        <div className="h-32 w-full rounded-lg bg-accent animate-pulse" />
        <div className="h-20 w-full rounded-lg bg-accent animate-pulse" />
        <div className="h-20 w-full rounded-lg bg-accent animate-pulse" />
        <div className="h-16 w-3/4 rounded-lg bg-accent animate-pulse" />
      </div>
    </div>
  )
}
