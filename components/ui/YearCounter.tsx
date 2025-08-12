'use client'

import { useEffect, useRef } from "react"

// Animated year counter with easing - fast start, slow finish
export default function YearCounter({ 
  year = 1999,
  delay = 0.5,
  duration = 6,  // Increased total duration for more dramatic effect
  className = ""
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const startYear = 2025  // Start from 2025 instead of 1900
  
  useEffect(() => {
    if (!ref.current) return
    
    // Initial value
    ref.current.textContent = String(startYear)
    
    // Start animation after delay
    const timeoutId = setTimeout(() => {
      let currentYear = startYear
      
      const animate = () => {
        currentYear--
        
        if (ref.current) {
          ref.current.textContent = String(currentYear)
        }
        
        if (currentYear > year) {
          // Calculate how close we are to the end
          const remaining = currentYear - year
          let nextDelay: number
          
          if (remaining > 20) {
            // Very fast for years 2025-2020
            nextDelay = 30
          } else if (remaining > 10) {
            // Slow down for 2020-2010
            nextDelay = 100
          } else if (remaining > 5) {
            // Much slower for 2010-2005
            nextDelay = 200
          } else if (remaining > 3) {
            // Very slow for 2005-2003
            nextDelay = 400
          } else if (remaining > 1) {
            // Extremely slow for 2003-2001
            nextDelay = 600
          } else {
            // Most dramatic pause before hitting 1999
            nextDelay = 1000
          }
          
          setTimeout(animate, nextDelay)
        } else {
          // Ensure we end on exactly 1999 with a final dramatic pause
          setTimeout(() => {
            if (ref.current) {
              ref.current.textContent = String(year)
            }
          }, 500)
        }
      }
      
      animate()
    }, delay * 1000)
    
    return () => clearTimeout(timeoutId)
  }, [year, delay, duration])
  
  return <span className={className} ref={ref} />
}