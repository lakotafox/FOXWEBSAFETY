'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Phone, MapPin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MapConfirmModal from '@/components/ui/MapConfirmModal'
import RollingYearCounter from '@/components/ui/RollingYearCounter'

interface HeaderProps {
  showAddress: boolean
  setShowAddress: (show: boolean) => void
}

export default function Header({ showAddress, setShowAddress }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMapConfirm, setShowMapConfirm] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-4 border-red-600 shadow-xl transition-all duration-500 ${
        isScrolled ? "py-0.25" : "py-1.5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className={`transition-all duration-500 ${isScrolled ? "scale-50" : "scale-100"}`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src="/images/foxbuilt-logo.png"
                alt="FoxBuilt Logo"
                width={isScrolled ? 80 : 160}
                height={isScrolled ? 30 : 60}
                className="h-auto transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Centered EST year counter for mobile */}
        <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-zinc-300 font-bold tracking-wider">EST.<RollingYearCounter year={1999} delay={3} duration={5} className="text-zinc-300 font-bold" /></p>
        </div>

        {/* Centered FOXBUILT OFFICE FURNITURE text - Desktop only */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            FOXBUILT <span className="text-red-600">OFFICE</span> <span className="text-blue-400">FURNITURE</span>
          </h1>
          <p className="text-sm text-zinc-300 font-bold tracking-wider mt-1">EST.<RollingYearCounter year={1999} delay={3} duration={5} className="text-zinc-300 font-bold" /></p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Desktop Buttons - Three action buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => window.location.href = 'tel:+18018999406'}
              className={`bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-500 ${
                isScrolled ? "w-10 h-10" : "w-12 h-12"
              }`}
              aria-label="Call us"
            >
              <Phone className={isScrolled ? "w-5 h-5" : "w-6 h-6"} />
            </button>
            <button
              onClick={() => setShowMapConfirm(true)}
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all duration-500 ${
                isScrolled ? "w-10 h-10" : "w-12 h-12"
              }`}
              aria-label="View on map"
            >
              <MapPin className={isScrolled ? "w-5 h-5" : "w-6 h-6"} />
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className={`bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all duration-500 ${
                isScrolled ? "w-10 h-10" : "w-12 h-12"
              }`}
              aria-label="Send message"
            >
              <Mail className={isScrolled ? "w-5 h-5" : "w-6 h-6"} />
            </button>
          </div>

          {/* Mobile Action Buttons */}
          <div className="md:hidden flex gap-2">
            <button
              onClick={() => window.location.href = 'tel:+18018999406'}
              className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
              aria-label="Call us"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMapConfirm(true)}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center"
              aria-label="View on map"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center"
              aria-label="Send email"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <MapConfirmModal 
      isOpen={showMapConfirm}
      onClose={() => setShowMapConfirm(false)}
      onConfirm={() => {}}
    />
    </>
  )
}