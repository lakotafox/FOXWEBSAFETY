'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MapPin, Phone } from 'lucide-react'

interface AboutSectionProps {
  showAddress: boolean
  setShowAddress: (show: boolean) => void
}

export default function AboutSection({ showAddress, setShowAddress }: AboutSectionProps) {
  return (
    <section id="about" className="bg-zinc-100">
      <div>
        <div>
          {/* Kyle Fox Story */}
          <div className="bg-slate-800 text-white border-8 border-slate-700 p-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-56 h-56 border-8 border-red-600 flex-shrink-0">
                <Image src="/images/kyle-fox-profile.webp" alt="Kyle Fox - Founder" fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-wide">THE ARTIST</h3>
                <p className="text-zinc-300 leading-relaxed text-lg font-semibold">
                  With over 30 years in the creative industry, Kyle brings a rare blend of retro charm and modern edge to every space he designs. A true master of layout and flow, if you need new school, old school, top of the line or basically free Kyle is the guy, Foxbuilt is the place.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}