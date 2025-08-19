'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, MapPin, Mail, ChevronDown, Menu, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MapConfirmModal from '@/components/ui/MapConfirmModal'
import RollingYearCounter from '@/components/ui/RollingYearCounter'
import { getCategoryVisibility } from '@/lib/category-visibility'
import { getCategoryNames } from '@/lib/category-names'

interface HeaderProps {
  showAddress: boolean
  setShowAddress: (show: boolean) => void
}

export default function Header({ showAddress, setShowAddress }: HeaderProps) {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMapConfirm, setShowMapConfirm] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [dynamicPageName, setDynamicPageName] = useState('Executive Desks')
  const [searchQuery, setSearchQuery] = useState('')
  const [isHomePage, setIsHomePage] = useState(false)
  const [categoryVisibility, setCategoryVisibility] = useState<any>({})
  const [showSearchBar, setShowSearchBar] = useState(true)
  const [categoryNames, setCategoryNames] = useState<any>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Check if we're on the home page
    setIsHomePage(window.location.pathname === '/')
  }, [])

  useEffect(() => {
    // Load category visibility settings and names
    const loadSettings = async () => {
      const [visibility, names] = await Promise.all([
        getCategoryVisibility(),
        getCategoryNames()
      ])
      setCategoryVisibility(visibility)
      setCategoryNames(names)
      // Check if search bar should be shown
      if (visibility.showSearchBar !== undefined) {
        setShowSearchBar(visibility.showSearchBar)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    // Load the dynamic page name from products.json
    const loadPageName = async () => {
      try {
        const response = await fetch('/products.json', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          if (data.pageName) {
            setDynamicPageName(data.pageName)
          }
        }
      } catch (e) {
        console.log('Using default page name')
      }
    }
    loadPageName()
  }, [])

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 shadow-xl">
      {/* Top Section with Logo, Search, and Action Buttons */}
      <div className="bg-slate-900">
        <div className="container mx-auto px-4 py-1">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            {/* When navbar is hidden, show different layout */}
            {categoryVisibility.showNavBar === false ? (
              <>
                {/* Logo on left */}
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src="/images/foxbuilt-logo.png"
                    alt="FoxBuilt Logo"
                    width={120}
                    height={45}
                    className="h-auto w-[120px]"
                  />
                </Link>

                {/* Center content */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-2xl font-bold">FOXBUILT</span>
                    <span className="text-red-600 text-2xl font-bold">OFFICE</span>
                    <span className="text-blue-500 text-2xl font-bold">FURNITURE</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white text-sm font-bold">EST.</span>
                    <RollingYearCounter year={1999} delay={3} duration={5} className="text-white text-sm font-bold ml-1" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.location.href = 'tel:+18018999406'}
                    className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Call us"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowMapConfirm(true)}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="View on map"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Send message"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Original layout when navbar is shown */}
                {/* Small Logo and EST 1999 - Desktop only */}
                <div className="flex items-center gap-6">
                  <Link href="/" className="flex-shrink-0">
                    <Image
                      src="/images/foxbuilt-logo.png"
                      alt="FoxBuilt Logo"
                      width={120}
                      height={45}
                      className="h-auto w-[120px]"
                    />
                  </Link>
                  {/* EST 1999 - moved more to the right */}
                  <div className="flex items-center">
                    <span className="text-white text-xs font-bold">EST.</span>
                    <RollingYearCounter year={1999} delay={3} duration={5} className="text-white text-xs font-bold ml-1" />
                  </div>
                </div>

                {/* Search Bar - Desktop (only show if enabled) */}
                {showSearchBar ? (
                  <div className="flex flex-1 max-w-xl mx-8">
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      if (searchQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                      }
                    }} className="relative w-full">
                      <input
                        type="text"
                        placeholder="Start your search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-600 bg-slate-800 rounded-full focus:outline-none focus:border-red-500 text-white placeholder-gray-400"
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label="Search"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1"></div>
                )}

                {/* Action Buttons - Desktop */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.location.href = 'tel:+18018999406'}
                    className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Call us"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowMapConfirm(true)}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="View on map"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Send message"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* When navbar is hidden, show simplified mobile layout */}
            {categoryVisibility.showNavBar === false ? (
              <div className="flex items-center justify-between py-2">
                {/* Logo on left */}
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src="/images/foxbuilt-logo.png"
                    alt="FoxBuilt Logo"
                    width={80}
                    height={30}
                    className="h-auto w-[80px]"
                  />
                </Link>

                {/* Center content */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-white text-xs font-bold">FOXBUILT</span>
                    <span className="text-red-600 text-xs font-bold">OFFICE</span>
                    <span className="text-blue-500 text-xs font-bold">FURNITURE</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white text-[10px] font-bold">EST.</span>
                    <RollingYearCounter year={1999} delay={3} duration={5} className="text-white text-[10px] font-bold ml-0.5" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => window.location.href = 'tel:+18018999406'}
                    className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Call us"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowMapConfirm(true)}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="View on map"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Send message"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Original mobile layout when navbar is shown */
              <>
                <div className="flex flex-col gap-2">
                  {/* First row with menu, search, and buttons */}
                  <div className="flex items-center gap-2">
                  {/* Mobile Hamburger - Top Left - Only show if nav is enabled */}
                  {categoryVisibility.showNavBar !== false && (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center transition-all flex-shrink-0"
                    aria-label="Menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  )}

                  {/* Search Bar - Mobile (only show if enabled) */}
                  {showSearchBar ? (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      if (searchQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                        setMobileMenuOpen(false)
                      }
                    }} className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Start your search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 pr-9 border border-gray-600 bg-slate-800 rounded-full focus:outline-none focus:border-red-500 text-white placeholder-gray-400 text-sm"
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label="Search"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex-1"></div>
                  )}

                  {/* Action Buttons - Mobile (compact) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => window.location.href = 'tel:+18018999406'}
                      className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all"
                      aria-label="Call us"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowMapConfirm(true)}
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all"
                      aria-label="View on map"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all"
                      aria-label="Send message"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Second row with EST 1999 centered */}
                <div className="flex justify-center pb-2">
                  <span className="text-white text-sm font-bold">EST.</span>
                  <RollingYearCounter year={1999} delay={3} duration={5} className="text-white text-sm font-bold ml-1" />
                </div>
              </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu - Desktop Only */}
      {categoryVisibility.showNavBar !== false && (
      <nav className="hidden md:block bg-slate-800 border-b-4 border-red-600 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center py-3">
              {/* Home Link - Only show when not on home page */}
              {!isHomePage && (
                <Link 
                  href="/" 
                  className="text-white hover:text-red-500 font-medium whitespace-nowrap transition-colors px-6"
                >
                  Home
                </Link>
              )}
              
              {/* Desks & Workstations Dropdown */}
              {categoryVisibility.showDesksWorkstations !== false && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'desks' ? null : 'desks')}
                  className="text-white hover:text-red-500 font-medium whitespace-nowrap transition-colors px-6 flex items-center"
                >
                  {categoryNames?.groups?.['desks-workstations'] || 'Desks & Workstations'}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'desks' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'desks' && (
                  <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-md shadow-lg py-2 min-w-[250px] z-50">
                    {categoryVisibility['executive-desks'] !== false && (
                      <Link href="/products?category=executive-desks" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{dynamicPageName}</Link>
                    )}
                    {categoryVisibility['computer-desks'] !== false && (
                      <Link href="/products?category=computer-desks" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['computer-desks'] || 'Computer Desks'}</Link>
                    )}
                    {categoryVisibility['standing-desks'] !== false && (
                      <Link href="/products?category=standing-desks" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['standing-desks'] || 'Standing Desks'}</Link>
                    )}
                    {categoryVisibility['modular-benching'] !== false && (
                      <Link href="/products?category=modular-benching" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['modular-benching'] || 'Modular Benching Systems'}</Link>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Cubicles Dropdown */}
              {categoryVisibility.showCubicles !== false && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'cubicles' ? null : 'cubicles')}
                  className="text-white hover:text-red-500 font-medium whitespace-nowrap transition-colors px-6 flex items-center"
                >
                  {categoryNames?.groups?.['cubicles'] || 'Cubicles'}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'cubicles' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'cubicles' && (
                  <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-md shadow-lg py-2 min-w-[250px] z-50">
                    {categoryVisibility['cubicle-workstations'] !== false && (
                      <Link href="/products?category=cubicle-workstations" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['cubicle-workstations'] || 'Cubicle Workstations'}</Link>
                    )}
                    {categoryVisibility['panel-systems'] !== false && (
                      <Link href="/products?category=panel-systems" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['panel-systems'] || 'Panel Systems'}</Link>
                    )}
                    {categoryVisibility['modular-cubicles'] !== false && (
                      <Link href="/products?category=modular-cubicles" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['modular-cubicles'] || 'Modular Cubicles'}</Link>
                    )}
                    {categoryVisibility['privacy-screens'] !== false && (
                      <Link href="/products?category=privacy-screens" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['privacy-screens'] || 'Privacy Screens'}</Link>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Seating Dropdown */}
              {categoryVisibility.showSeating !== false && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'seating' ? null : 'seating')}
                  className="text-white hover:text-red-500 font-medium whitespace-nowrap transition-colors px-6 flex items-center"
                >
                  {categoryNames?.groups?.['seating'] || 'Seating'}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'seating' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'seating' && (
                  <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-md shadow-lg py-2 min-w-[250px] z-50">
                    <Link href="/products?category=task-chairs" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['task-chairs'] || 'Task Chairs'}</Link>
                    <Link href="/products?category=executive-chairs" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['executive-chairs'] || 'Executive Chairs'}</Link>
                    <Link href="/products?category=conference-chairs" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['conference-chairs'] || 'Conference Chairs'}</Link>
                    <Link href="/products?category=drafting-stools" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['drafting-stools'] || 'Drafting Stools'}</Link>
                    <Link href="/products?category=ergonomic-seating" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['ergonomic-seating'] || 'Ergonomic Seating'}</Link>
                  </div>
                )}
              </div>
              )}

              {/* Storage Dropdown */}
              {categoryVisibility.showStorage !== false && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'storage' ? null : 'storage')}
                  className="text-white hover:text-red-500 font-medium whitespace-nowrap transition-colors px-6 flex items-center"
                >
                  {categoryNames?.groups?.['storage'] || 'Storage'}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'storage' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'storage' && (
                  <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-md shadow-lg py-2 min-w-[250px] z-50">
                    <Link href="/products?category=filing-cabinets" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['filing-cabinets'] || 'Filing Cabinets'}</Link>
                    <Link href="/products?category=shelving-units" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['shelving-units'] || 'Shelving Units'}</Link>
                    <Link href="/products?category=bookcases" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['bookcases'] || 'Bookcases'}</Link>
                    <Link href="/products?category=lockers" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['lockers'] || 'Lockers'}</Link>
                    <Link href="/products?category=credenzas" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['credenzas'] || 'Credenzas'}</Link>
                  </div>
                )}
              </div>
              )}

              {/* Conference & Meeting Dropdown */}
              {categoryVisibility.showConferenceMeeting !== false && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'conference' ? null : 'conference')}
                  className="text-white hover:text-red-500 font-medium whitespace-nowrap transition-colors px-6 flex items-center"
                >
                  {categoryNames?.groups?.['conference-meeting'] || 'Conference & Meeting'}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'conference' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'conference' && (
                  <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-md shadow-lg py-2 min-w-[250px] z-50">
                    <Link href="/products?category=conference-tables" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['conference-tables'] || 'Conference Tables'}</Link>
                    <Link href="/products?category=meeting-chairs" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['meeting-chairs'] || 'Meeting Room Chairs'}</Link>
                    <Link href="/products?category=collaborative-tables" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['collaborative-tables'] || 'Collaborative Tables'}</Link>
                    <Link href="/products?category=av-carts" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['av-carts'] || 'AV Carts'}</Link>
                  </div>
                )}
              </div>
              )}

              {/* Reception & Lounge Dropdown */}
              {categoryVisibility.showReceptionLounge !== false && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'reception' ? null : 'reception')}
                  className="text-white hover:text-red-500 font-medium whitespace-nowrap transition-colors px-6 flex items-center"
                >
                  {categoryNames?.groups?.['reception-lounge'] || 'Reception & Lounge'}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'reception' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'reception' && (
                  <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-md shadow-lg py-2 min-w-[250px] z-50">
                    <Link href="/products?category=reception-desks" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['reception-desks'] || 'Reception Desks'}</Link>
                    <Link href="/products?category=sofas" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['sofas'] || 'Sofas'}</Link>
                    <Link href="/products?category=lounge-chairs" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['lounge-chairs'] || 'Lounge Chairs'}</Link>
                    <Link href="/products?category=coffee-tables" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['coffee-tables'] || 'Coffee Tables'}</Link>
                    <Link href="/products?category=side-tables" className="block px-4 py-2 text-white hover:bg-slate-600 hover:text-red-500">{categoryNames?.subcategories?.['side-tables'] || 'Side Tables'}</Link>
                  </div>
                )}
              </div>
              )}

              {/* FOXBOT AI Assistant */}
              {categoryVisibility.showFoxbot !== false && (
              <Link 
                href="/foxbot" 
                className="text-yellow-500 hover:text-yellow-400 font-bold whitespace-nowrap transition-colors px-6 flex items-center animate-pulse"
              >
                FOXBOT AI
              </Link>
              )}

            </div>

            {/* Empty space on the right for balance */}
            <div className="hidden lg:flex items-center">
              {/* Removed EST 1999 from here - now below search bar */}
            </div>
          </div>
        </div>
      </nav>
      )}
    </header>

    {/* Mobile Menu Overlay */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-40 bg-white overflow-y-auto" style={{ paddingTop: '56px' }}>
        <div className="py-4">
          {/* Home Link - Only show when not on home page */}
          {!isHomePage && (
            <div className="border-b">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-lg font-medium hover:bg-gray-50"
              >
                Home
              </Link>
            </div>
          )}
          
          {/* Desks & Workstations */}
          {categoryVisibility.showDesksWorkstations !== false && (
          <div className="border-b">
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'desks' ? null : 'desks')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <span className="text-lg font-medium">{categoryNames?.groups?.['desks-workstations'] || 'Desks & Workstations'}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === 'desks' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedCategory === 'desks' && (
              <div className="bg-gray-50">
                <Link href="/products?category=executive-desks" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{dynamicPageName}</Link>
                <Link href="/products?category=computer-desks" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['computer-desks'] || 'Computer Desks'}</Link>
                <Link href="/products?category=standing-desks" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['standing-desks'] || 'Standing Desks'}</Link>
                <Link href="/products?category=modular-benching" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['modular-benching'] || 'Modular Benching Systems'}</Link>
              </div>
            )}
          </div>
          )}

          {/* Cubicles */}
          {categoryVisibility.showCubicles !== false && (
          <div className="border-b">
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'cubicles' ? null : 'cubicles')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <span className="text-lg font-medium">{categoryNames?.groups?.['cubicles'] || 'Cubicles'}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === 'cubicles' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedCategory === 'cubicles' && (
              <div className="bg-gray-50">
                <Link href="/products?category=cubicle-workstations" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['cubicle-workstations'] || 'Cubicle Workstations'}</Link>
                <Link href="/products?category=panel-systems" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['panel-systems'] || 'Panel Systems'}</Link>
                <Link href="/products?category=modular-cubicles" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['modular-cubicles'] || 'Modular Cubicles'}</Link>
                <Link href="/products?category=privacy-screens" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['privacy-screens'] || 'Privacy Screens'}</Link>
              </div>
            )}
          </div>
          )}

          {/* Seating */}
          {categoryVisibility.showSeating !== false && (
          <div className="border-b">
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'seating' ? null : 'seating')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <span className="text-lg font-medium">{categoryNames?.groups?.['seating'] || 'Seating'}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === 'seating' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedCategory === 'seating' && (
              <div className="bg-gray-50">
                <Link href="/products?category=task-chairs" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['task-chairs'] || 'Task Chairs'}</Link>
                <Link href="/products?category=executive-chairs" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['executive-chairs'] || 'Executive Chairs'}</Link>
                <Link href="/products?category=conference-chairs" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['conference-chairs'] || 'Conference Chairs'}</Link>
                <Link href="/products?category=drafting-stools" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['drafting-stools'] || 'Drafting Stools'}</Link>
                <Link href="/products?category=ergonomic-seating" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['ergonomic-seating'] || 'Ergonomic Seating'}</Link>
              </div>
            )}
          </div>
          )}

          {/* Storage */}
          {categoryVisibility.showStorage !== false && (
          <div className="border-b">
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'storage' ? null : 'storage')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <span className="text-lg font-medium">{categoryNames?.groups?.['storage'] || 'Storage'}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === 'storage' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedCategory === 'storage' && (
              <div className="bg-gray-50">
                <Link href="/products?category=filing-cabinets" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['filing-cabinets'] || 'Filing Cabinets'}</Link>
                <Link href="/products?category=shelving-units" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['shelving-units'] || 'Shelving Units'}</Link>
                <Link href="/products?category=bookcases" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['bookcases'] || 'Bookcases'}</Link>
                <Link href="/products?category=lockers" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['lockers'] || 'Lockers'}</Link>
                <Link href="/products?category=credenzas" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['credenzas'] || 'Credenzas'}</Link>
              </div>
            )}
          </div>
          )}

          {/* Conference & Meeting */}
          {categoryVisibility.showConferenceMeeting !== false && (
          <div className="border-b">
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'conference' ? null : 'conference')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <span className="text-lg font-medium">{categoryNames?.groups?.['conference-meeting'] || 'Conference & Meeting'}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === 'conference' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedCategory === 'conference' && (
              <div className="bg-gray-50">
                <Link href="/products?category=conference-tables" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['conference-tables'] || 'Conference Tables'}</Link>
                <Link href="/products?category=meeting-chairs" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['meeting-chairs'] || 'Meeting Room Chairs'}</Link>
                <Link href="/products?category=collaborative-tables" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['collaborative-tables'] || 'Collaborative Tables'}</Link>
                <Link href="/products?category=av-carts" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['av-carts'] || 'AV Carts'}</Link>
              </div>
            )}
          </div>
          )}

          {/* Reception & Lounge */}
          {categoryVisibility.showReceptionLounge !== false && (
          <div className="border-b">
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'reception' ? null : 'reception')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <span className="text-lg font-medium">{categoryNames?.groups?.['reception-lounge'] || 'Reception & Lounge'}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === 'reception' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedCategory === 'reception' && (
              <div className="bg-gray-50">
                <Link href="/products?category=reception-desks" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['reception-desks'] || 'Reception Desks'}</Link>
                <Link href="/products?category=sofas" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['sofas'] || 'Sofas'}</Link>
                <Link href="/products?category=lounge-chairs" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['lounge-chairs'] || 'Lounge Chairs'}</Link>
                <Link href="/products?category=coffee-tables" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['coffee-tables'] || 'Coffee Tables'}</Link>
                <Link href="/products?category=side-tables" onClick={() => setMobileMenuOpen(false)} className="block px-12 py-3 hover:bg-gray-100">{categoryNames?.subcategories?.['side-tables'] || 'Side Tables'}</Link>
              </div>
            )}
          </div>
          )}

          {/* FOXBOT AI Assistant */}
          {categoryVisibility.showFoxbot !== false && (
          <div className="border-b">
            <Link 
              href="/foxbot" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-6 py-4 text-lg font-bold text-yellow-500 hover:bg-gray-50 animate-pulse"
            >
              FOXBOT AI Assistant
            </Link>
          </div>
          )}

        </div>
      </div>
    )}
    
    <MapConfirmModal 
      isOpen={showMapConfirm}
      onClose={() => setShowMapConfirm(false)}
      onConfirm={() => {}}
    />
    </>
  )
}