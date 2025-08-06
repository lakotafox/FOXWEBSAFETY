'use client'

import { Phone, MapPin, Mail } from 'lucide-react'

export default function FloatingActionButtons() {
  return (
    <div className="hidden md:flex fixed left-8 flex-col gap-3 z-50" style={{top: '200px'}}>
      <button
        onClick={() => window.location.href = 'tel:+18018999406'}
        className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        aria-label="Call us"
      >
        <Phone className="w-8 h-8" />
      </button>
      <button
        onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062', '_blank')}
        className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        aria-label="View on map"
      >
        <MapPin className="w-8 h-8" />
      </button>
      <button
        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
        className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        aria-label="Send email"
      >
        <Mail className="w-8 h-8" />
      </button>
    </div>
  )
}