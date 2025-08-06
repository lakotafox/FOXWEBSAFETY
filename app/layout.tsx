import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import GoogleAnalytics from './google-analytics'

export const metadata: Metadata = {
  metadataBase: new URL('https://foxbuiltstore.com'),
  title: 'FoxBuilt - Custom Office Furniture | Utah County & Salt Lake County',
  description: 'Handcrafted American office furniture serving businesses in Salt Lake City, Provo, Orem, Lehi, Pleasant Grove and surrounding areas. Proudly serving Utah County and Salt Lake County since 1999. Executive desks, office chairs, conference tables, executive chairs, and custom workspace solutions.',
  keywords: 'office furniture Utah, custom office furniture, executive desks, conference tables, office chair, desk chair, swivel office chair, executive chair, ergonomic workstations, American made furniture, office furniture showroom, Utah County furniture, Salt Lake County furniture',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'FoxBuilt - Custom Office Furniture | Utah County & Salt Lake County',
    description: 'Handcrafted American office furniture serving businesses in Salt Lake City, Provo, Orem, Lehi, and surrounding areas since 1999.',
    url: 'https://foxbuiltstore.com',
    siteName: 'FoxBuilt',
    images: [
      {
        url: '/images/showroom-1.jpg',
        width: 1200,
        height: 630,
        alt: 'FoxBuilt Office Furniture Showroom',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoxBuilt - Custom Office Furniture Utah',
    description: 'Serving Utah County & Salt Lake County businesses since 1999. Quality American-made office furniture.',
    images: ['/images/showroom-1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {/* Add your Google Analytics ID here - get it from https://analytics.google.com */}
        <GoogleAnalytics GA_MEASUREMENT_ID="G-KP2P0MHQW0" />
        {children}
      </body>
    </html>
  )
}
