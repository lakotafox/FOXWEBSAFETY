'use client'

import { useState, useRef } from 'react'

interface RocketButtonProps {
  volume?: number
  cooldownTime?: number
  scrollDelay?: number
  className?: string
  imageClassName?: string
}

export default function RocketButton({
  volume = 0.117,
  cooldownTime = 5000,
  scrollDelay = 3750,
  className = '',
  imageClassName = 'w-16 h-16 md:w-24 md:h-24'
}: RocketButtonProps) {
  const [rocketDisabled, setRocketDisabled] = useState(false)
  const rocketTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const handleClick = () => {
    if (rocketDisabled) return
    
    // Disable rocket for cooldown period
    setRocketDisabled(true)
    
    // Play sound with mobile volume reduction
    const audio = new Audio('/sounds/rocketlaunch.mp3')
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    audio.volume = isMobile ? volume * 0.3 : volume // 70% reduction on mobile (50% of the already reduced 60%)
    audio.play()
    
    // Scroll to top after delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, scrollDelay)
    
    // Re-enable after cooldown
    rocketTimeoutRef.current = setTimeout(() => {
      setRocketDisabled(false)
    }, cooldownTime)
  }
  
  // Cleanup timeout on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (rocketTimeoutRef.current) {
        clearTimeout(rocketTimeoutRef.current)
      }
    })
  }
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={rocketDisabled}
      className={`group flex flex-col items-center justify-center px-2 md:px-4 transition-transform ${
        rocketDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
      } ${className}`}
      aria-label="Back to top"
    >
      <img 
        src="/rocket.png" 
        alt="Launch to top" 
        className={`drop-shadow-lg ${imageClassName}`}
      />
      <span className="text-xs font-bold text-white mt-1">
        {rocketDisabled ? 'LAUNCHING...' : 'TOP'}
      </span>
    </button>
  )
}