import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Widgets",
  description:
    "Park home screen widgets. See your parking status at a glance without opening the app.",
  openGraph: {
    title: "Park Widgets — Parking Status at a Glance",
    description:
      "See your parking status directly from your home screen.",
    type: "website",
  },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
