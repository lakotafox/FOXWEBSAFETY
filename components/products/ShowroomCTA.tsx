'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Phone } from 'lucide-react'

export default function ShowroomCTA() {
  const [showAddress, setShowAddress] = useState(false)

  return (
    <section className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
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