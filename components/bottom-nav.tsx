"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, Users, Star } from "lucide-react"

const tabs = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "map", label: "Map", href: "/map", icon: Map },
  { id: "community", label: "Community", href: "/community", icon: Users },
  { id: "rewards", label: "Rewards", href: "/rewards", icon: Star },
] as const

const ACCENT = "#3b82f6"
const INACTIVE = "#94a3b8"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed md:absolute bottom-3.5 left-3.5 right-3.5 z-50 max-w-md mx-auto sheet-enter">
      <div
        className="grid grid-cols-4 items-center h-[62px] rounded-full"
        style={{
          background: "rgba(11,15,23,0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.id === "home" && pathname === "/status")
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 transition-colors"
              style={{ color: isActive ? ACCENT : INACTIVE }}
            >
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={1.75}
                style={{
                  transition: "transform 0.25s cubic-bezier(.2,.7,.3,1)",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
              />
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {isActive && (
                <div className="rounded-full w-1 h-1 mt-0.5" style={{ background: ACCENT }} />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
