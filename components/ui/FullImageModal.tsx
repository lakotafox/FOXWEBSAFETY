'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface FullImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt: string
  showReturnText?: boolean
}

export default function FullImageModal({ isOpen, onClose, imageSrc, imageAlt, showReturnText = false }: FullImageModalProps) {
  const [isHorizontal, setIsHorizontal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    setIsMobile(window.innerWidth < 768)
    
    // Check image orientation
    if (isOpen && imageSrc) {
      const img = new window.Image()
      img.onload = () => {
        setIsHorizontal(img.width > img.height)
      }
      img.src = imageSrc
    }
  }, [isOpen, imageSrc])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-800 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button in top-right */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 z-[101] bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
        aria-label="Close enlarged image"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {isMobile && isHorizontal ? (
          // Rotated horizontal image on mobile
          <div 
            className="absolute"
            style={{
              transform: 'rotate(90deg)',
              width: '100vh',
              height: '100vw',
              transformOrigin: 'center',
            }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain cursor-pointer"
              sizes="100vh"
              priority
              unoptimized
            />
          </div>
        ) : (
          // Normal display for vertical images or desktop
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain cursor-pointer"
              sizes="(max-width: 768px) 95vw, 95vw"
              priority
              unoptimized
            />
          </div>
        )}
      </div>
      {showReturnText && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded-lg">
            <p>Click again to return to carousel</p>
          </div>
        </div>
      )}
    </div>
  )
}