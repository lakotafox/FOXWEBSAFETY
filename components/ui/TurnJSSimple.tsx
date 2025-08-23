'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

export default function TurnJSSimple() {
  const [isReady, setIsReady] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [PageFlipModule, setPageFlipModule] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const flipbookRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<any>(null)
  
  const totalPages = 148

  // Array of page turn sound files - KEEPING YOUR SOUNDS!
  const pageTurnSounds = [
    '/turning-paper (mp3cut.net).mp3',
    '/turning-paper (mp3cut.net) (1).mp3',
    '/turning-paper (mp3cut.net) (2).mp3',
    '/turning-paper (mp3cut.net) (3).mp3',
    '/turning-paper (mp3cut.net) (4).mp3',
    '/turning-paper (mp3cut.net) (5).mp3',
    '/turning-paper (mp3cut.net) (6).mp3'
  ]

  // Pre-load audio objects for better mobile performance
  const audioPoolRef = useRef<HTMLAudioElement[]>([])
  const coverAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Initialize audio pool on first user interaction
  const initAudioPool = () => {
    if (audioPoolRef.current.length === 0) {
      audioPoolRef.current = pageTurnSounds.map(sound => {
        const audio = new Audio(sound)
        audio.volume = 1.0
        audio.preload = 'auto'
        return audio
      })
    }
    // Also pre-load cover sound for mobile
    if (!coverAudioRef.current) {
      coverAudioRef.current = new Audio('/cover.mp3')
      coverAudioRef.current.volume = 1.0
      coverAudioRef.current.preload = 'auto'
    }
  }
  
  const playRandomPageTurnSound = () => {
    initAudioPool()
    const randomIndex = Math.floor(Math.random() * pageTurnSounds.length)
    const audio = audioPoolRef.current[randomIndex]
    
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      const fallbackAudio = new Audio(pageTurnSounds[randomIndex])
      fallbackAudio.volume = 1.0
      fallbackAudio.play().catch(() => {})
    }
  }

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Initialize audio on first user interaction (mobile)
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudioPool()
      document.removeEventListener('touchstart', handleFirstInteraction)
      document.removeEventListener('click', handleFirstInteraction)
    }
    
    document.addEventListener('touchstart', handleFirstInteraction, { passive: true })
    document.addEventListener('click', handleFirstInteraction, { passive: true })
    
    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction)
      document.removeEventListener('click', handleFirstInteraction)
    }
  }, [])

  // Load PageFlip module
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('page-flip').then(module => {
        setPageFlipModule(() => module.PageFlip)
        console.log('PageFlip module loaded successfully')
      }).catch(err => {
        console.error('Failed to load PageFlip module:', err)
        setLoadingError(`Failed to load flipbook library: ${err.message || 'Unknown error'}`)
        // Set ready anyway to show static fallback
        setTimeout(() => {
          setIsReady(true)
        }, 2000)
      })
    }
  }, [])

  // Initialize StPageFlip when module is ready
  useEffect(() => {
    if (!PageFlipModule || !flipbookRef.current) return

    console.log('Starting flipbook initialization...')
    
    try {
      const isMobile = window.innerWidth < 768
      const containerWidth = window.innerWidth
      const containerHeight = window.innerHeight - 80  // Minimal space for header/footer
      
      let bookWidth, bookHeight
      if (isMobile) {
        // Mobile: Use smaller size - maybe full screen is too big
        bookWidth = Math.min(containerWidth * 0.9, 400)  // Max 400px wide
        // Height based on standard 8.5x11 aspect ratio (1.294)
        bookHeight = Math.min(bookWidth * 1.294, containerHeight * 0.8)
      } else {
        // Desktop - balanced dimensions for double page spread
        bookWidth = Math.min(containerWidth * 0.78, 1150)  // Slightly narrower pages
        bookHeight = Math.min(containerHeight * 0.88, 950)  // Reduce height to prevent spilling
      }

      console.log(`Initializing with dimensions: ${bookWidth}x${bookHeight}, mobile: ${isMobile}`)

      // Initialize StPageFlip with proper portrait/landscape modes
      const pageFlip = new PageFlipModule(flipbookRef.current, {
        width: isMobile ? bookWidth : bookWidth / 2,  // Full width on mobile, half on desktop
        height: bookHeight,
        showCover: true,
        mobileScrollSupport: true,  // Enable for mobile
        useMouseEvents: true,  // Enable for both
        swipeDistance: 30,  // Standard swipe distance
        flippingTime: 600,  // 0.6s for both mobile and desktop
        drawShadow: true,
        autoSize: false,
        maxShadowOpacity: 0.5,
        startPage: 0,
        size: 'fixed',
        minWidth: 100,
        maxWidth: 2000,
        minHeight: 100,
        maxHeight: 1500,
        showPageCorners: true,  // Show corners on both mobile and desktop
        disableFlipByClick: isMobile,  // Disable tap to flip on mobile to allow pinch zoom
        usePortrait: isMobile,  // Single page on mobile, double on desktop
        clickEventForward: false,  // Don't forward click events
        startZIndex: 0
      })

      console.log('PageFlip instance created')
      pageFlipRef.current = pageFlip
      
      // Debug: Log available methods
      console.log('Available methods on pageFlip:', Object.getOwnPropertyNames(Object.getPrototypeOf(pageFlip)))

      // Load pages immediately like it was originally
      const pages = flipbookRef.current?.querySelectorAll('.page')
      console.log(`Found ${pages?.length || 0} pages to load`)
      
      if (pages && pages.length > 0) {
        pageFlip.loadFromHTML(pages)
        console.log('Pages loaded into flipbook')
      } else {
        console.error('No pages found to load')
        setLoadingError('No pages found')
      }

      // Track if we're in a user drag operation
      let isDragging = false
      let soundPlayed = false
      let isInitialLoad = true  // Track if this is the initial cover load
      let flipCount = 0  // Track number of flips to ensure we skip the initial one

      // Add event listeners
      pageFlip.on('flip', (e: any) => {
        console.log('Page flip event:', e)
        // Library uses 0-based index, but we'll treat it as 1-based for our logic
        const newPage = (e.data || 0) + 1  // This makes cover = page 1 internally
        const oldPage = currentPage  // Get the page we're coming FROM
        console.log(`Flipping from page ${oldPage} to page ${newPage}`)
        
        // Check if this is truly the initial load (first flip event)
        flipCount++
        const isFirstFlip = flipCount === 1
        
        setCurrentPage(newPage)
        
        // Sound logic based on transition - NEVER play sound on first flip (page load)
        if (!isFirstFlip) {
          // Cover sound ONLY for these specific transitions:
          // 1. Any page -> page 1 (closing book to cover)
          // 2. Page 1 -> page 2 (opening book from cover)
          // 3. Page 2 -> page 1 (closing from inside cover to cover)
          if ((newPage === 1) || (oldPage === 1 && newPage === 2)) {
            // Play cover sound
            setTimeout(() => {
              initAudioPool()
              if (coverAudioRef.current) {
                coverAudioRef.current.currentTime = 0
                coverAudioRef.current.play().catch(() => {})
              } else {
                const coverAudio = new Audio('/cover.mp3')
                coverAudio.volume = 1.0
                coverAudio.play().catch(() => {})
              }
            }, 550)
          } else if (!soundPlayed) {
            // Play page turn sound for all other transitions
            // Including: page 3 -> page 2, page 2 -> page 3, etc.
            playRandomPageTurnSound()
          }
        }
        
        // Reset flags
        isDragging = false
        soundPlayed = false
        isInitialLoad = false  // No longer initial load after first flip
      })

      // Play sound at the START of flip animation for programmatic flips
      pageFlip.on('changeState', (e: any) => {
        console.log('State change:', e, 'isDragging:', isDragging)
        
        // Simplified - just play sound on programmatic flips
        if (e.data === 'flipping' && !isDragging && !isInitialLoad) {
          const currentPageNum = (pageFlipRef.current?.getCurrentPageIndex() || 0) + 1
          // Only play page turn sound if we're not on cover pages
          if (currentPageNum > 2) {
            playRandomPageTurnSound()
            soundPlayed = true
          }
        }
      })

      // Detect user drag operations
      pageFlip.on('userStart', (e: any) => {
        console.log('User started dragging')
        isDragging = true
        soundPlayed = false
      })


      // Add manual swipe detection for mobile since flipPrev is broken
      if (window.innerWidth < 768 && flipbookRef.current) {
        let touchStartX = 0
        let touchStartY = 0
        
        const handleTouchStart = (e: TouchEvent) => {
          touchStartX = e.touches[0].clientX
          touchStartY = e.touches[0].clientY
        }
        
        
        const handleTouchEnd = (e: TouchEvent) => {
          if (!e.changedTouches[0]) return
          
          const touchEndX = e.changedTouches[0].clientX
          const touchEndY = e.changedTouches[0].clientY
          const deltaX = touchEndX - touchStartX
          const deltaY = Math.abs(touchEndY - touchStartY)
          
          // Detect right swipe (prev page)
          if (deltaX > 50 && deltaY < 100) {
            console.log('Manual swipe right detected!')
            prevPage()
            e.preventDefault()
            e.stopPropagation()
          }
        }
        
        flipbookRef.current.addEventListener('touchstart', handleTouchStart, { passive: true })
        flipbookRef.current.addEventListener('touchend', handleTouchEnd, { passive: false })
      }
      
      console.log('Flipbook initialization complete!')
      setIsReady(true)
      
      // Play cover sound when book loads (after animation completes)
      setTimeout(() => {
        initAudioPool() // Ensure audio is initialized
        if (coverAudioRef.current) {
          coverAudioRef.current.currentTime = 0
          coverAudioRef.current.play().catch(() => {
            console.log('Cover sound could not play - user interaction may be required')
          })
        } else {
          const coverAudio = new Audio('/cover.mp3')
          coverAudio.volume = 1.0
          coverAudio.play().catch(() => {
            console.log('Cover sound could not play - user interaction may be required')
          })
        }
      }, 1300) // Delay for cover drop effect
      
    } catch (error) {
      console.error('Error initializing flipbook:', error)
      setLoadingError(`Initialization failed: ${error}`)
      setIsReady(true) // Set ready anyway to show fallback
    }

    return () => {
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy()
        } catch (e) {
          console.error('Error destroying flipbook:', e)
        }
      }
    }
  }, [PageFlipModule])

  // Handle window resize
  useEffect(() => {
    if (!isReady || !pageFlipRef.current) return

    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      const containerWidth = window.innerWidth
      const containerHeight = window.innerHeight - 80  // Match initial setup
      
      let bookWidth, bookHeight
      if (isMobile) {
        // Match the initial mobile setup exactly - smaller size
        bookWidth = Math.min(containerWidth * 0.9, 400)  // Max 400px wide
        bookHeight = Math.min(bookWidth * 1.294, containerHeight * 0.8)
      } else {
        // Match the initial desktop setup
        bookWidth = Math.min(containerWidth * 0.78, 1150)
        bookHeight = Math.min(containerHeight * 0.88, 950)
      }

      try {
        pageFlipRef.current?.updateState({
          width: isMobile ? bookWidth : bookWidth / 2,  // Match initial setup
          height: bookHeight,
          usePortrait: isMobile  // Match initial setup
        })
      } catch (e) {
        console.error('Error updating flipbook size:', e)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isReady])

  const nextPage = () => {
    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.flipNext()
        // Sound will be played by the changeState event listener at start of animation
      } catch (e) {
        console.error('Error flipping next:', e)
      }
    }
  }

  const prevPage = () => {
    if (pageFlipRef.current && currentPage > 1) {
      const isMobile = window.innerWidth < 768
      
      if (!isMobile) {
        // Desktop: Use normal flip animation
        try {
          pageFlipRef.current.flipPrev('bottom')
        } catch (e) {
          // Fallback for desktop
          const targetPage = currentPage - 2
          if (targetPage >= 0) {
            pageFlipRef.current.flip(targetPage, 'bottom')
          }
        }
      } else {
        // Mobile: Since flipPrev is broken, let's do a static slide like you had working
        const targetPage = currentPage - 1
        
        // Update the page immediately (static change, no animation)
        setCurrentPage(targetPage)
        
        // Try to sync with the library
        try {
          // Use turnToPage which might bypass the broken flipPrev
          if (pageFlipRef.current.turnToPage) {
            pageFlipRef.current.turnToPage(targetPage - 1) // 0-based
          } else {
            // Force update the display without animation
            const pages = flipbookRef.current?.querySelectorAll('.page')
            if (pages && pages.length > 0) {
              // Reload at the target page
              pageFlipRef.current.loadFromHTML(pages)
              pageFlipRef.current.currentPageIndex = targetPage - 1
              pageFlipRef.current.update()
            }
          }
        } catch (e) {
          console.log('Static page change, library sync failed:', e)
        }
        
        // Play sound for feedback even if animation doesn't work
        if (targetPage === 1) {
          // Cover sound - only for actual cover, not inside cover
          if (coverAudioRef.current) {
            coverAudioRef.current.currentTime = 0
            coverAudioRef.current.play().catch(() => {})
          }
        } else {
          // Page turn sound for all other pages including inside cover
          playRandomPageTurnSound()
        }
      }
    }
  }

  const goToPage = (catalogPageNumber: number) => {
    if (pageFlipRef.current) {
      try {
        const pageIndex = catalogPageNumber + 1 // Adjust for 0-based index
        pageFlipRef.current.flip(pageIndex)
        setActiveDropdown(null)
      } catch (e) {
        console.error('Error going to page:', e)
      }
    }
  }

  // Generate pages HTML
  const generatePages = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <div key={i} className="page" data-density="soft">
          <div className="page-content">
            <img 
              src={`/catalog-pages/page-${i.toString().padStart(3, '0')}.jpg`}
              alt={`Page ${i}`}
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
              loading="lazy"
            />
          </div>
        </div>
      )
    }
    return pages
  }

  return (
    <>
    <div 
      ref={containerRef}
      className="relative w-full bg-slate-800"
      style={{ zIndex: 30 }}
    >
      {/* Navigation Bar - KEEPING YOUR SUPERIOR NAVIGATION! */}
      <div className="bg-slate-900 px-4 border-b border-slate-700 relative" style={{ zIndex: activeDropdown ? 10000 : 10, position: 'relative' }}>
        <div className="max-w-7xl mx-auto">
          {/* Catalog Index Header */}
          <div className="text-center mb-2">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider">CATALOG INDEX</h2>
          </div>
          {/* Navigation Dropdowns */}
          <div className="flex items-center justify-center gap-6">
            {/* Desking Dropdown */}
            <div className="relative" style={{ zIndex: activeDropdown === 'desking' ? 10000 : 'auto' }}>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'desking' ? null : 'desking')}
                className="text-yellow-500 hover:text-yellow-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Desking
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'desking' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'desking' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 9999 }}>
                  <button onClick={() => goToPage(4)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">04-28: Classic Laminate</button>
                  <button onClick={() => goToPage(30)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">30-37: Elements Laminate</button>
                  <button onClick={() => goToPage(38)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">38-39: Encore Collection</button>
                  <button onClick={() => goToPage(40)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">40-45: Signature Collection</button>
                  <button onClick={() => goToPage(48)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">48-49: Riser Series</button>
                  <button onClick={() => goToPage(50)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">50-53: Height Adjustable</button>
                  <button onClick={() => goToPage(140)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">140-143: Accessories</button>
                </div>
              )}
            </div>

            {/* Panels Dropdown */}
            <div className="relative" style={{ zIndex: activeDropdown === 'panels' ? 10000 : 'auto' }}>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'panels' ? null : 'panels')}
                className="text-blue-500 hover:text-blue-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Panels
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'panels' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'panels' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 9999 }}>
                  <button onClick={() => goToPage(56)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">56-59: Webb Panels</button>
                  <button onClick={() => goToPage(60)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">60-61: Borders</button>
                  <button onClick={() => goToPage(62)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">62: SpaceMax Panels</button>
                  <button onClick={() => goToPage(63)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">63: Drawing Services</button>
                </div>
              )}
            </div>

            {/* Tables Dropdown */}
            <div className="relative" style={{ zIndex: activeDropdown === 'tables' ? 10000 : 'auto' }}>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'tables' ? null : 'tables')}
                className="text-green-500 hover:text-green-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Tables
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'tables' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'tables' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 9999 }}>
                  <button onClick={() => goToPage(66)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">66-67: Gathering Tables</button>
                  <button onClick={() => goToPage(68)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">68-71: Training Room</button>
                  <button onClick={() => goToPage(73)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">73-78: Conference Tables</button>
                  <button onClick={() => goToPage(79)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">79-83: Occasional Tables</button>
                </div>
              )}
            </div>

            {/* Seating Dropdown */}
            <div className="relative" style={{ zIndex: activeDropdown === 'seating' ? 10000 : 'auto' }}>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'seating' ? null : 'seating')}
                className="text-red-500 hover:text-red-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Seating
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'seating' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'seating' && (
                <div className="absolute top-full right-0 md:left-0 md:right-auto mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 9999 }}>
                  <button onClick={() => goToPage(86)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">86-89: Chair Guide</button>
                  <button onClick={() => goToPage(90)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">90-98: Reception & Lounge</button>
                  <button onClick={() => goToPage(99)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">99-113: Management</button>
                  <button onClick={() => goToPage(114)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">114-121: Task</button>
                  <button onClick={() => goToPage(122)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">122-123: Big & Tall</button>
                  <button onClick={() => goToPage(124)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">124-125: Drafting</button>
                  <button onClick={() => goToPage(126)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">126-139: Guest & Multi</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flipbook Container */}
      <div className="flex-grow-0 md:flex-1 relative flex items-start justify-center overflow-visible" style={{ zIndex: 100 }}>
        {/* Show loading or error message */}
        {!isReady && (
          <div className="text-white text-2xl font-bold">
            Loading Catalog...
            {loadingError && (
              <div className="text-red-500 text-sm mt-2">
                Error: {loadingError}
              </div>
            )}
          </div>
        )}
        
        {/* Always render the flipbook container, even while loading */}
        <div 
          ref={flipbookRef}
          id="flipbook"
          className="flipbook"
          style={{
            position: 'relative',
            touchAction: 'pinch-zoom',  // Allow pinch zoom on mobile
            userSelect: 'none',
            WebkitUserSelect: 'none',
            display: 'block',
            visibility: isReady ? 'visible' : 'hidden',
            zIndex: 200
          }}
        >
          {generatePages()}
        </div>

        {/* Navigation - Hidden on mobile */}
        {isReady && (
          <>
            <button
              onClick={prevPage}
              className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextPage}
              className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      <style jsx global>{`
        .flipbook {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          transition: none;
        }
        
        /* Peel away animation for back navigation on mobile - mimics corner grab */
        @media (max-width: 767px) {
          .flipbook.page-sliding-in .stf__wrapper {
            animation: peelAway 0.6s ease-out forwards;
            transform-origin: left center;
          }
          
          @keyframes peelAway {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(100vw);
            }
          }
        }
        
        .flipbook .page {
          background-color: white !important;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        .flipbook .page-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }
        
        .flipbook .page img {
          pointer-events: none;
          -webkit-user-drag: none;
          user-drag: none;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* Mobile: Show full page width */
        @media (max-width: 767px) {
          .flipbook .page {
            background-color: transparent !important;
          }
          
          .flipbook .page-content {
            padding: 0 !important;
            background: transparent !important;
          }
          
          .flipbook .page img {
            object-fit: cover;
            object-position: center;
            width: 100% !important;
            height: 100% !important;
          }
          
          .flipbook {
            width: 100vw !important;
          }
          
          .stf__parent {
            width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }

        /* StPageFlip adds its own shadow classes for spine effect */
        .stf__block {
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        /* The library handles the spine shadow automatically! */
      `}</style>
    </div>

    {/* Static page indicator below catalog with mobile back button */}
    <div className="bg-slate-800 text-center" style={{ zIndex: 5, position: 'relative' }}>
      <div className="flex items-center justify-center gap-2">
        {/* Back button - Now with monkey-patch fix */}
        {!isDesktop && currentPage > 1 && (
          <button
            onClick={prevPage}
            className="bg-black/60 text-white p-2 rounded-full"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        {/* Page indicator */}
        <div className="bg-black/60 text-white px-3 py-1 md:px-4 md:py-2 rounded-full inline-block text-xs md:text-base">
          {currentPage === 1 ? 'Cover' : 
           currentPage === 2 ? 'Inside Cover' :
           `Page ${currentPage - 2} of ${totalPages - 2}`}
        </div>
        
        {/* Forward button - only show on mobile when not on last page */}
        {!isDesktop && currentPage < totalPages && (
          <button
            onClick={nextPage}
            className="bg-black/60 text-white p-2 rounded-full"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    </>
  )
}