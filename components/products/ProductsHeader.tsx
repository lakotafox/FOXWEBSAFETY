'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Phone, MapPin, Mail } from 'lucide-react'

interface ProductsHeaderProps {
  isScrolled: boolean
}

export default function ProductsHeader({ isScrolled }: ProductsHeaderProps) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-4 border-red-600 shadow-xl transition-all duration-500 ${
        isScrolled ? "py-0.25" : "py-1.5"
      } md:py-0.25`}
    >
      <div className="container mx-auto px-4">
        {/* Desktop Header - No dynamic sizing */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo on left */}
          <div>
            <Image
              src="/images/foxbuilt-logo.png"
              alt="FoxBuilt Logo"
              width={120}
              height={45}
              className="h-auto"
            />
          </div>
          
          {/* Centered PRODUCTS text */}
          <h1 className="text-2xl font-black text-white tracking-tight absolute left-1/2 transform -translate-x-1/2">
            <span className="text-red-600">PRODUCTS</span>
          </h1>
          
          {/* Three action buttons - Desktop */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.href = 'tel:+18018999406'}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all"
              aria-label="Call us"
            >
              <Phone className="w-6 h-6" />
            </button>
            <button
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062', '_blank')}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all"
              aria-label="View on map"
            >
              <MapPin className="w-6 h-6" />
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all"
              aria-label="Send message"
            >
              <Mail className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => window.location.href = '/'}
            className={`transition-all duration-500 ${isScrolled ? "scale-75" : "scale-100"}`}
          >
            <Image
              src="/images/foxbuilt-logo.png"
              alt="FoxBuilt Logo"
              width={isScrolled ? 80 : 120}
              height={isScrolled ? 30 : 45}
              className="h-auto"
            />
          </button>

          {/* Center Title */}
          <h1 className={`font-black text-white tracking-tight ${isScrolled ? "text-xl" : "text-2xl"}`}>
            <span className="text-red-600">PRODUCTS</span>
          </h1>

          {/* Mobile Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = 'tel:+18018999406'}
              className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
              aria-label="Call us"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062', '_blank')}
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
  )
}