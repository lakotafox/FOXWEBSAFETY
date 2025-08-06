'use client'

import { useState } from 'react'
import { Phone, MapPin, Mail, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center">COMING SOON</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <p className="text-lg text-center font-semibold">
            Call us, stop in, or send a message!
          </p>
          
          <div className="flex gap-4 justify-center">
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
              onClick={() => {
                onClose()
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
              aria-label="Send email"
            >
              <Mail className="w-8 h-8" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}