'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapChoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MapChoiceModal({ isOpen, onClose }: MapChoiceModalProps) {
  if (!isOpen) return null

  const address = '420 W Industrial Dr Building LL Pleasant Grove UT 84062'
  const encodedAddress = encodeURIComponent(address)

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
    onClose()
  }

  const openAppleMaps = () => {
    window.open(`https://maps.apple.com/?q=${encodedAddress}`, '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-md bg-slate-800 border-8 border-slate-700 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-4xl font-black text-center mb-8 text-white tracking-tight">
          CHOOSE <span className="text-blue-400">MAP</span>
        </h2>
        
        <div className="flex flex-col gap-4">
          <Button
            onClick={openGoogleMaps}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-lg px-8 py-6 tracking-wide border-4 border-blue-600 hover:border-blue-700 transition-all w-full"
          >
            GOOGLE MAPS
          </Button>
          <Button
            onClick={openAppleMaps}
            className="bg-slate-700 hover:bg-slate-600 text-white font-black text-lg px-8 py-6 tracking-wide border-4 border-slate-600 hover:border-slate-500 transition-all w-full"
          >
            APPLE MAPS
          </Button>
        </div>
      </div>
    </div>
  )
}