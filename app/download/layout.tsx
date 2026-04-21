import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Download Park",
  description:
    "Install the Park app on your phone. Get instant parking answers, smart reminders, and sign scanning. No app store required.",
  openGraph: {
    title: "Download Park — Never Get a Parking Ticket Again",
    description:
      "Install the Park app for free. Works on any device, no app store required.",
    type: "website",
  },
}

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
