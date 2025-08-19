'use client'

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues
const TurnJSSimple = dynamic(() => import('@/components/ui/TurnJSSimple'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-800">
      <div className="text-white text-xl font-black">LOADING CATALOG...</div>
    </div>
  )
})

export default function CatalogSection() {
  return (
    <section id="catalog" className="bg-slate-800 relative" style={{ zIndex: 30 }}>
      <div className="relative" style={{ height: '80vh', zIndex: 30 }}>
        <TurnJSSimple />
      </div>
    </section>
  )
}