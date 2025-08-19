'use client'

import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <section className="pb-4 bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 text-white relative overflow-hidden">
      {/* American background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-blue-600"></div>
      </div>
    </section>
  )
}