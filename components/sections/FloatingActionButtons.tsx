'use client'

import { useState } from 'react'
import { Phone, MapPin, Mail } from 'lucide-react'
import MapConfirmModal from '@/components/ui/MapConfirmModal'

export default function FloatingActionButtons() {
  const [showMapConfirm, setShowMapConfirm] = useState(false)
  
  return (
    <>
    <div className="hidden md:flex fixed left-8 flex-col gap-3 z-50" style={{top: '200px'}}>
      <button
        onClick={() => window.location.href = 'tel:+18018999406'}
        className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        aria-label="Call us"
      >
        <Phone className="w-8 h-8" />
      </button>
      <button
        onClick={() => setShowMapConfirm(true)}
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
    
    <MapConfirmModal 
      isOpen={showMapConfirm}
      onClose={() => setShowMapConfirm(false)}
      onConfirm={() => {}}
    />
    </>
  )
}