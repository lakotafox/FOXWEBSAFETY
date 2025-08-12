'use client'

import { useState } from 'react'
import ActionButton from '@/components/ui/ActionButton'
import MapConfirmModal from '@/components/ui/MapConfirmModal'

export default function FloatingActionButtons() {
  const [showMapConfirm, setShowMapConfirm] = useState(false)
  
  return (
    <>
    <div className="hidden fixed left-8 flex-col gap-3 z-50" style={{ top: '200px' }}>
      <ActionButton
        icon="phone"
        size="lg"
        onClick={() => window.location.href = 'tel:+18018999406'}
      />
      <ActionButton
        icon="map"
        size="lg"
        onClick={() => setShowMapConfirm(true)}
      />
      <ActionButton
        icon="mail"
        size="lg"
        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
      />
    </div>
    
    <MapConfirmModal 
      isOpen={showMapConfirm}
      onClose={() => setShowMapConfirm(false)}
      onConfirm={() => {}}
    />
    </>
  )
}