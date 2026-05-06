"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Clock, History, Settings } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"

const tabs = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "history", label: "History", href: "/history", icon: History },
  { id: "timer", label: "Timer", href: "/timer", icon: Clock },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const haptics = useHaptics()

  return (
    <nav className="fixed md:absolute bottom-0 left-0 right-0 z-50 safe-bottom" style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}>
      <div
        className="grid grid-cols-4 items-center max-w-md mx-auto"
        style={{
          height: 62,
          borderRadius: 999,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "saturate(180%) blur(24px)",
          WebkitBackdropFilter: "saturate(180%) blur(24px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.id === "home" && ["/status", "/scan"].includes(pathname))
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.href}
              prefetch
              onClick={() => !isActive && haptics.selection()}
              className="press flex flex-col items-center justify-center gap-[2px]"
              style={{
                color: isActive ? "#2563eb" : "#94a3b8",
                background: "transparent",
                textDecoration: "none",
                minHeight: 44,
                minWidth: 44,
              }}
            >
              <Icon style={{ width: 22, height: 22, transition: "transform 0.15s ease" }} strokeWidth={isActive ? 2.25 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
