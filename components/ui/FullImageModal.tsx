'use client'

import { X } from 'lucide-react'
import Image from 'next/image'

interface FullImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt: string
}

export default function FullImageModal({ isOpen, onClose, imageSrc, imageAlt }: FullImageModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1920}
          height={1080}
          className="object-contain w-full h-full"
          unoptimized
        />
      </div>
    </div>
  )
}