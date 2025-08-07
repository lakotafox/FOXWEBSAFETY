'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function MapConfirmModal({ isOpen, onClose, onConfirm }: MapConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-md bg-slate-800 border-8 border-slate-700 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-4xl font-black text-center mb-6 text-white tracking-tight">
          OPEN <span className="text-blue-400">MAP</span>?
        </h2>
        
        <p className="text-xl text-zinc-300 text-center mb-4 font-bold">
          Located at
        </p>
        
        <p className="text-lg text-zinc-400 text-center mb-8 font-semibold">
          420 W Industrial Dr Building LL<br />
          Pleasant Grove, UT 84062
        </p>
        
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              window.open('https://maps.apple.com/?q=' + encodeURIComponent('foxbuilt office furniture'), '_blank')
              onClose()
            }}
            className="bg-slate-700 hover:bg-slate-600 text-white font-black text-lg px-8 py-4 tracking-wide border-4 border-slate-600 hover:border-slate-500 transition-all"
          >
            APPLE
          </Button>
          <Button
            onClick={() => {
              window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('420 W Industrial Dr Building LL Pleasant Grove UT 84062'), '_blank')
              onClose()
            }}
            className="bg-slate-700 hover:bg-slate-600 text-white font-black text-lg px-8 py-4 tracking-wide border-4 border-slate-600 hover:border-slate-500 transition-all"
          >
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  )
}