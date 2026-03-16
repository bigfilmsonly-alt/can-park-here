"use client"

import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  direction?: "left" | "right" | "up" | "down" | "fade"
  isVisible: boolean
}

export function PageTransition({
  children,
  direction = "fade",
  isVisible,
}: PageTransitionProps) {
  const getTransformClass = () => {
    if (isVisible) return "translate-x-0 translate-y-0 opacity-100"
    
    switch (direction) {
      case "left":
        return "-translate-x-full opacity-0"
      case "right":
        return "translate-x-full opacity-0"
      case "up":
        return "-translate-y-8 opacity-0"
      case "down":
        return "translate-y-8 opacity-0"
      default:
        return "opacity-0"
    }
  }

  return (
    <div
      className={`
        transition-all duration-300 ease-out
        ${getTransformClass()}
      `}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: ReactNode
  delay?: number
}

export function SlideIn({ children, delay = 0 }: SlideInProps) {
  return (
    <div
      className="animate-in slide-in-from-bottom-4 fade-in duration-500"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  )
}

export function FadeIn({ children, delay = 0 }: SlideInProps) {
  return (
    <div
      className="animate-in fade-in duration-300"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  )
}

export function ScaleIn({ children, delay = 0 }: SlideInProps) {
  return (
    <div
      className="animate-in zoom-in-95 fade-in duration-200"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  )
}
