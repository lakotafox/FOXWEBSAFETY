'use client'

import { useEffect, useRef, useState } from 'react'
import ASCIIText from '@/components/ui/ASCIIText'

export default function ASCIISection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isDuckDuckGo, setIsDuckDuckGo] = useState(false)

  useEffect(() => {
    // Detect DuckDuckGo browser
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()
      // DuckDuckGo browser includes 'duckduckgo' in the user agent
      const isDDG = userAgent.includes('duckduckgo') || 
                    userAgent.includes('ddg') ||
                    // Also check for DuckDuckGo on desktop which might use modified Chrome/Safari UA
                    (userAgent.includes('chrome') && window.navigator.vendor === 'DuckDuckGo')
      setIsDuckDuckGo(isDDG)
    }
  }, [])

  useEffect(() => {
    // Skip mouse tracking on mobile or DuckDuckGo browser
    if (typeof window === 'undefined' || window.innerWidth < 768 || isDuckDuckGo) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return
      
      // Get the ASCII section's position
      const rect = sectionRef.current.getBoundingClientRect()
      
      // Check if cursor is in the contact section (above ASCII section)
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        const contactRect = contactSection.getBoundingClientRect()
        
        // If mouse is in contact section or ASCII section, dispatch event to ASCII container
        if ((e.clientY >= contactRect.top && e.clientY <= rect.bottom) && 
            (e.clientX >= 0 && e.clientX <= window.innerWidth)) {
          
          // Create a synthetic mouse event for the ASCII container
          const asciiContainer = sectionRef.current.querySelector('.ascii-text-container')
          if (asciiContainer) {
            const syntheticEvent = new MouseEvent('mousemove', {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true
            })
            asciiContainer.dispatchEvent(syntheticEvent)
          }
        }
      }
    }

    // Add global listener
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDuckDuckGo])

  return (
    <section ref={sectionRef} className="relative bg-slate-900 py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative" style={{ height: '120px' }}>
          <ASCIIText
            text="FOXBUILT"
            asciiFontSize={7}
            textFontSize={200}
            textColor="#fdf9f3"
            planeBaseHeight={8}
            enableWaves={false}
          />
        </div>
      </div>
    </section>
  )
}