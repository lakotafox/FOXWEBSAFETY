'use client'

import { useState, useEffect } from 'react'

interface BouncingEmojiProps {
  emoji: string
  delay?: number
}

export default function BouncingEmoji({ emoji, delay = 0 }: BouncingEmojiProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [velocity, setVelocity] = useState({ x: 0.3, y: 0.3 })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize with random values after mount to avoid hydration issues
    setPosition({ x: Math.random() * 80, y: Math.random() * 80 })
    setVelocity({ 
      x: (Math.random() - 0.5) * 0.5, 
      y: (Math.random() - 0.5) * 0.5 
    })
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + velocity.x
        let newY = prev.y + velocity.y
        let newVelX = velocity.x
        let newVelY = velocity.y

        // Bounce off edges
        if (newX <= 0 || newX >= 90) {
          newVelX = -velocity.x
          newX = newX <= 0 ? 0 : 90
        }
        if (newY <= 0 || newY >= 90) {
          newVelY = -velocity.y
          newY = newY <= 0 ? 0 : 90
        }

        setVelocity({ x: newVelX, y: newVelY })
        return { x: newX, y: newY }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [velocity, isInitialized])

  return (
    <div 
      className="absolute text-6xl transition-all duration-50"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        animationDelay: `${delay}s`
      }}
    >
      {emoji}
    </div>
  )
}