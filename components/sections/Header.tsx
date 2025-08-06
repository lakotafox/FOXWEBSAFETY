'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FileText, Phone, MapPin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  showAddress: boolean
  setShowAddress: (show: boolean) => void
}

export default function Header({ showAddress, setShowAddress }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
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

        {/* Centered FOXBUILT OFFICE FURNITURE text - Desktop only */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            FOXBUILT <span className="text-red-600">OFFICE</span> <span className="text-blue-400">FURNITURE</span>
          </h1>
          <p className="text-sm text-zinc-300 font-bold tracking-wider mt-1">EST.1999</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide border-2 border-blue-600 hover:border-blue-700 transition-all duration-500 ${
                isScrolled ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"
              }`}
              onClick={() => {
                window.open('/catolog no page one.pdf', '_blank')
              }}
            >
              <FileText className={`${isScrolled ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
              CATALOG
            </Button>

            <Button
              className={`bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide border-2 border-red-600 hover:border-red-700 transition-all duration-500 ${
                isScrolled ? "px-3 py-1 text-sm" : "px-6 py-2"
              }`}
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              GET QUOTE
            </Button>
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