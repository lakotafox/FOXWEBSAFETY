'use client'

import { useEffect, useRef, useState } from "react"

// Animated year counter with individual digit rolling
export default function RollingYearCounter({ 
  year = 1999,
  delay = 0.5,
  duration = 6,
  className = ""
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const startYear = 2025
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted || !containerRef.current) return
    
    // Create 4 digit rollers
    containerRef.current.innerHTML = `
      <div class="inline-flex" style="font-variant-numeric: tabular-nums;">
        <div class="digit-roller" data-digit="0" style="position: relative; display: inline-block; height: 1.2em; overflow: hidden; vertical-align: middle;">
          <div class="digit-strip" style="position: relative; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
            ${[0,1,2].map(d => `<div style="height: 1.2em; line-height: 1.2em;">${d}</div>`).join('')}
          </div>
        </div>
        <div class="digit-roller" data-digit="1" style="position: relative; display: inline-block; height: 1.2em; overflow: hidden; vertical-align: middle;">
          <div class="digit-strip" style="position: relative; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
            ${[0,1,2,3,4,5,6,7,8,9].map(d => `<div style="height: 1.2em; line-height: 1.2em;">${d}</div>`).join('')}
          </div>
        </div>
        <div class="digit-roller" data-digit="2" style="position: relative; display: inline-block; height: 1.2em; overflow: hidden; vertical-align: middle;">
          <div class="digit-strip" style="position: relative; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
            ${[0,1,2,3,4,5,6,7,8,9].map(d => `<div style="height: 1.2em; line-height: 1.2em;">${d}</div>`).join('')}
          </div>
        </div>
        <div class="digit-roller" data-digit="3" style="position: relative; display: inline-block; height: 1.2em; overflow: hidden; vertical-align: middle;">
          <div class="digit-strip" style="position: relative; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
            ${[0,1,2,3,4,5,6,7,8,9].map(d => `<div style="height: 1.2em; line-height: 1.2em;">${d}</div>`).join('')}
          </div>
        </div>
      </div>
    `
    
    const digitRollers = containerRef.current.querySelectorAll('.digit-roller')
    const digitStrips = containerRef.current.querySelectorAll('.digit-strip') as NodeListOf<HTMLElement>
    
    // Set initial position to 2025
    digitStrips[0].style.transform = 'translateY(-2.4em)' // 2
    digitStrips[1].style.transform = 'translateY(0)' // 0
    digitStrips[2].style.transform = 'translateY(-2.4em)' // 2
    digitStrips[3].style.transform = 'translateY(-6em)' // 5
    
    let currentYear = startYear
    let previousDigits = ['2', '0', '2', '5']
    
    const setYearDigits = (yearNum: number, transitionSpeed: string) => {
      const yearStr = yearNum.toString().padStart(4, '0')
      const newDigits = yearStr.split('')
      
      // Thousands digit (0-2)
      if (newDigits[0] !== previousDigits[0]) {
        digitStrips[0].style.transition = `transform ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`
        digitStrips[0].style.transform = `translateY(-${parseInt(newDigits[0]) * 1.2}em)`
      }
      
      // Hundreds digit (0-9)
      if (newDigits[1] !== previousDigits[1]) {
        digitStrips[1].style.transition = `transform ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`
        const hundredsPos = parseInt(newDigits[1])
        digitStrips[1].style.transform = `translateY(-${hundredsPos * 1.2}em)`
      }
      
      // Tens digit (0-9)
      if (newDigits[2] !== previousDigits[2]) {
        digitStrips[2].style.transition = `transform ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`
        const tensPos = parseInt(newDigits[2])
        digitStrips[2].style.transform = `translateY(-${tensPos * 1.2}em)`
      }
      
      // Ones digit (0-9)
      if (newDigits[3] !== previousDigits[3]) {
        digitStrips[3].style.transition = `transform ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`
        digitStrips[3].style.transform = `translateY(-${parseInt(newDigits[3]) * 1.2}em)`
      }
      
      previousDigits = [...newDigits]
    }
    
    // Start animation after delay
    const timeoutId = setTimeout(() => {
      const animate = () => {
        currentYear--
        
        // Calculate how close we are to the end
        const remaining = currentYear - year
        let transitionSpeed: string
        let nextDelay: number
        
        if (remaining > 20) {
          // Very fast for years 2025-2020
          transitionSpeed = '0.05s'
          nextDelay = 60
        } else if (remaining > 10) {
          // Slow down for 2020-2010
          transitionSpeed = '0.1s'
          nextDelay = 120
        } else if (remaining > 5) {
          // Much slower for 2010-2005
          transitionSpeed = '0.2s'
          nextDelay = 250
        } else if (remaining > 3) {
          // Very slow for 2005-2003
          transitionSpeed = '0.4s'
          nextDelay = 450
        } else if (remaining > 1) {
          // Extremely slow for 2003-2001
          transitionSpeed = '0.6s'
          nextDelay = 700
        } else if (remaining === 1) {
          // 2001 to 2000 - slow
          transitionSpeed = '0.8s'
          nextDelay = 900
        } else {
          // Most dramatic pause for 2000 to 1999 - all digits roll
          transitionSpeed = '1.2s'
          nextDelay = 1500
        }
        
        setYearDigits(currentYear, transitionSpeed)
        
        if (currentYear > year) {
          setTimeout(animate, nextDelay)
        }
      }
      
      animate()
    }, delay * 1000)
    
    return () => clearTimeout(timeoutId)
  }, [mounted, year, delay, duration])
  
  if (!mounted) return <span className={className}>2025</span>
  
  return (
    <span 
      ref={containerRef} 
      className={className}
      style={{ display: 'inline-block' }}
    />
  )
}