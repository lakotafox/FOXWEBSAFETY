import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Main Page Editor - FoxBuilt',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
  },
}

export default function MainPageEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}