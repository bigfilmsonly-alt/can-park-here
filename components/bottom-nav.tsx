"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Home, Map, Users, Trophy } from "lucide-react"

const tabs = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "map", label: "Map", href: "/map", icon: Map },
  { id: "community", label: "Spots", href: "/community", icon: Users },
  { id: "me", label: "Rewards", href: "/rewards", icon: Trophy },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <nav className="fixed md:absolute bottom-3.5 left-3.5 right-3.5 z-50 max-w-md mx-auto">
      <div
        className="grid grid-cols-4 items-center h-[62px] rounded-full border-[0.5px]"
        style={{
          background: isDark
            ? "rgba(26,31,43,0.92)"
            : "rgba(255,255,255,0.92)",
          borderColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.id === "home" && (pathname === "/" || pathname === "/status")) ||
            (tab.id === "me" && pathname === "/rewards")
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={1.75} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
