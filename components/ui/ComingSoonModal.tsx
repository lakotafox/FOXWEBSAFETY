'use client'

import ActionButton from '@/components/ui/ActionButton'
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
          <DialogTitle className="text-2xl font-black text-center">COMING SOON!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <p className="text-lg text-center font-semibold">
            Call us, stop in, or send a message!
          </p>
          
          <div className="flex gap-4 justify-center">
            <ActionButton
              icon="phone"
              size="lg"
              onClick={() => window.location.href = 'tel:+18018999406'}
            />
            <ActionButton
              icon="map"
              size="lg"
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062', '_blank')}
            />
            <ActionButton
              icon="mail"
              size="lg"
              onClick={() => {
                onClose()
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}