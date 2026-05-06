import React from "react"
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { ShowcaseWrapper } from '@/components/iphone-showcase'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://can-park-here.vercel.app'),
  title: {
    default: 'Park — Can I Park Here? We pay your ticket if we\'re wrong.',
    template: '%s | Park',
  },
  description: 'The only parking app that pays your ticket if we\'re wrong. Up to $100 guarantee. 95% accuracy. Instant answers. SF coverage live.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Park',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Can I Park Here? — We pay your ticket if we\'re wrong.',
    description: 'The only parking app with a $100 ticket guarantee. Scan any sign, get instant answers, and we\'ll cover the ticket if we\'re wrong. 95% accuracy. SF + Miami coverage live.',
    siteName: 'Park',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Can I Park Here? — We pay your ticket if we\'re wrong.',
    description: 'The only parking app with a $100 ticket guarantee. 95% accuracy. SF + Miami coverage live.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Park — Can I Park Here?",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "iOS, Android, Web",
              description: "The only parking app that pays your ticket if we're wrong. Up to $100 guarantee. AI sign scanner. Real SF + Miami city data.",
              offers: { "@type": "Offer", price: "4.99", priceCurrency: "USD" },
              aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "2400" },
              url: "https://can-park-here.vercel.app",
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ShowcaseWrapper>
              {children}
            </ShowcaseWrapper>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'})})}`
          }}
        />
      </body>
    </html>
  )
}
