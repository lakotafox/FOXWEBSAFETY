'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MapPin, Phone } from 'lucide-react'
import ProfileCard from '@/components/ui/ProfileCard'

interface AboutSectionProps {
  showAddress: boolean
  setShowAddress?: (show: boolean) => void
  onToggleAddress?: () => void
}

export default function AboutSection({ showAddress, setShowAddress, onToggleAddress }: AboutSectionProps) {
  return (
    <section id="about" className="bg-zinc-100">
      <div>
        <div>
          {/* Kyle Fox Story */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-8 border-slate-700 p-10">
            {/* Title above card for both mobile and desktop */}
            <h3 className="text-3xl font-black text-white mb-6 tracking-wide text-center">THE ARTIST</h3>
            
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-shrink-0 scale-75 lg:scale-90 -my-20 lg:-my-10">
                <ProfileCard
                  name="Kyle Fox"
                  title="FoxBuilt Furniture"
                  handle="foxbuilt"
                  status="30+ Years Experience"
                  contactText="Contact"
                  avatarUrl="/images/KYLE HEADSHOT3.png"
                  miniAvatarUrl="/images/KYLE HEADSHOT3.png"
                  iconUrl="/images/foxbuilt-logo.png"
                  grainUrl="/images/grain.svg"
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={false}
                  onContactClick={() => {
                    window.location.href = 'tel:+17146809130'
                  }}
                />
              </div>
              <div className="lg:pl-8">
                <p className="text-black leading-relaxed text-lg lg:text-2xl font-semibold">
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