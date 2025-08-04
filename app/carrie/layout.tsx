import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carrie Editor - FoxBuilt',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
  },
}

export default function CarrieLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}