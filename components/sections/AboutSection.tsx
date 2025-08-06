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
    <section id="about" className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center text-slate-900 mb-16 tracking-tight">
          AMERICAN <span className="text-red-600">GRIT</span>
        </h2>

        <div className="max-w-5xl mx-auto">
          {/* Kyle Fox Story */}
          <div className="bg-slate-800 text-white border-8 border-slate-700 p-10 mb-16">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-56 h-56 border-8 border-red-600 flex-shrink-0">
                <Image src="/images/kyle-fox-profile.webp" alt="Kyle Fox - Founder" fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-wide">KYLE FOX - FOUNDER</h3>
                <blockquote className="text-xl text-zinc-300 italic mb-6 font-bold">
                  "You need a desk? I actually know a great guy, he deserves your business" That's our marketing.
                </blockquote>
                <p className="text-zinc-300 leading-relaxed text-lg font-semibold">
                  Started with nothing but a van, a dream, and American determination. Built this company from the
                  ground up with sweat, steel, and satisfaction guaranteed. We don't just sell furniture - we build
                  the foundation of American business, one workspace at a time.
                </p>
              </div>
            </div>
          </div>

          {/* Visit Our Showroom CTA */}
          <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white border-8 border-slate-700 p-10 text-center">
            <h3 className="text-3xl font-black mb-6 tracking-wide">WANT TO SEE IT IN PERSON?</h3>
            <p className="text-xl mb-8 font-bold">
              We are located in Pleasant Grove right off of the freeway. Drinks are cold, snacks are
              free, and the furniture is built to last.
            </p>
            <Button
              className="bg-white text-slate-900 hover:bg-zinc-200 font-black text-lg px-8 py-4 border-4 border-slate-900"
              onClick={() => setShowAddress(!showAddress)}
            >
              {showAddress ? "HIDE ADDRESS" : "VISIT SHOWROOM"}
            </Button>

            {showAddress && (
              <div className="mt-8 bg-white/10 border-4 border-white p-6 text-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <MapPin className="w-6 h-6 text-white" />
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-zinc-200 transition-colors"
                    >
                      <p className="text-xl font-bold">420 W Industrial Dr Building LL</p>
                      <p className="text-xl font-bold">Pleasant Grove, UT 84062</p>
                    </a>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <Phone className="w-6 h-6 text-white" />
                    <a href="tel:+18018999406" className="text-xl font-bold hover:text-zinc-200 transition-colors">
                      (801) 899-9406
                    </a>
                  </div>
                  <div className="text-lg font-bold text-zinc-200">
                    <p>Monday–Friday: 10:00am–5:00pm</p>
                    <p>Saturday–Sunday: By Appointment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}