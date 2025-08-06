'use client'

import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  isEditMode: boolean
}

export default function HeroSection({ isEditMode }: HeroSectionProps) {
  return (
    <section className={`bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 py-24 text-white relative overflow-hidden ${isEditMode ? "pt-24" : "pt-40"}`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-blue-600"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Hero content can go here */}
      </div>
    </section>
  )
}