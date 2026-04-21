import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fleet Management",
  description:
    "Manage parking for your entire fleet. Track vehicles, drivers, and parking sessions. Avoid tickets and save money with Park for Business.",
  openGraph: {
    title: "Park Fleet Management — Parking for Business",
    description:
      "Manage parking for your entire fleet. Track vehicles, avoid tickets, and save money.",
    type: "website",
  },
}

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
