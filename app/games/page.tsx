"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import dynamic from "next/dynamic"
import SnakeGame from "./snake/SnakeGame"
import PongGame from "./pong/PongGame"
import GalagaGame from "./galaga/GalagaGame"

// Dynamically import DitherSimple to avoid SSR issues
const DitherSimple = dynamic(() => import("@/components/ui/DitherSimple"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
})

export default function GamesPage() {
  const [gameMode, setGameMode] = useState<'select' | 'snake' | 'pong' | 'galaga'>('select')
  const [clickCount, setClickCount] = useState(0)
  const [jumpCount, setJumpCount] = useState(0)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [isJumping, setIsJumping] = useState(false)
  const [errorImages, setErrorImages] = useState<Array<{x: number, y: number, id: number}>>([])
  const [showBugMessage, setShowBugMessage] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Play Atari sound when games page loads
    if (gameMode === 'select') {
      const audio = new Audio('/sounds/Atari.mp3')
      audio.loop = true
      audio.play().catch(e => console.log('Atari audio failed:', e))
      audioRef.current = audio
    } else {
      // Stop audio when entering a game
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [gameMode])

  if (gameMode === 'select') {
    return (
      <div className="min-h-screen bg-black relative">
        {/* Dithered wave background */}
        <div className="absolute inset-0 z-0">
          <DitherSimple />
        </div>
        
        {/* Game content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
          <div className="text-center" style={{ pointerEvents: 'auto' }}>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <Button 
              onClick={() => setGameMode('snake')} 
              className="bg-green-600 hover:bg-green-700 text-white text-2xl md:text-3xl lg:text-4xl py-8 md:py-10 lg:py-12 px-12 md:px-16 lg:px-24 rounded-xl w-full md:w-auto"
            >
              SNAKE
            </Button>
            <Button 
              onClick={() => setGameMode('pong')} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-2xl md:text-3xl lg:text-4xl py-8 md:py-10 lg:py-12 px-12 md:px-16 lg:px-24 rounded-xl w-full md:w-auto"
            >
              PONG
            </Button>
            <Button 
              onClick={() => setGameMode('galaga')} 
              className="bg-purple-600 hover:bg-purple-700 text-white text-2xl md:text-3xl lg:text-4xl py-8 md:py-10 lg:py-12 px-12 md:px-16 lg:px-24 rounded-xl w-full md:w-auto"
            >
              GALAGA
            </Button>
          </div>
          <div className="fixed inset-0 pointer-events-none">
            <Button 
              onClick={() => {
                if (jumpCount < 10) {
                  setClickCount(prev => prev + 1)
                  setJumpCount(prev => prev + 1)
                  
                  // Jump to new position - can go anywhere on screen
                  const positions = [
                    { x: 50, y: 50 }, // Near top-left
                    { x: window.innerWidth - 200, y: 50 }, // Near top-right
                    { x: 50, y: window.innerHeight - 100 }, // Near bottom-left
                    { x: window.innerWidth - 200, y: window.innerHeight - 100 }, // Near bottom-right
                    { x: window.innerWidth / 2 - 100, y: 50 }, // Top center
                    { x: window.innerWidth / 2 - 100, y: window.innerHeight - 100 }, // Bottom center
                    { x: 50, y: window.innerHeight / 2 - 50 }, // Left center
                    { x: window.innerWidth - 200, y: window.innerHeight / 2 - 50 }, // Right center
                    { x: Math.random() * (window.innerWidth - 200), y: Math.random() * (window.innerHeight - 100) }, // Random
                    { x: Math.random() * (window.innerWidth - 200), y: Math.random() * (window.innerHeight - 100) } // Random
                  ]
                  
                  const newPos = positions[Math.floor(Math.random() * positions.length)]
                  setButtonPosition(newPos)
                } else {
                  // Play shutdown sound first
                  const shutdownAudio = new Audio('/sounds/shutdown.mp3')
                  shutdownAudio.play().catch(e => console.log('Shutdown audio failed:', e))
                  
                  // Wait for shutdown sound to play a bit before starting error sequence
                  setTimeout(() => {
                    // Trigger error image sequence with exponential timing
                    const showErrorSequence = async () => {
                    // Function to play error sound (let them overlap)
                    const playErrorSound = () => {
                      const audio = new Audio('/sounds/windows-error-sound-effect.mp3')
                      audio.play().catch(e => console.log('Audio play failed:', e))
                    }
                    
                    let allImages = []
                    let soundLoop = null
                    let soundDelay = 165 // Perfect speed from testing
                    
                    // Show 1 image (wait 2 seconds)
                    allImages.push({
                      x: Math.random() * (window.innerWidth - 438),
                      y: Math.random() * (window.innerHeight - 438),
                      id: 1
                    })
                    setErrorImages([...allImages])
                    playErrorSound()
                    
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    
                    // Show 2nd image (wait 1.5 seconds)
                    allImages.push({
                      x: Math.random() * (window.innerWidth - 438),
                      y: Math.random() * (window.innerHeight - 438),
                      id: 2
                    })
                    setErrorImages([...allImages])
                    playErrorSound()
                    
                    await new Promise(resolve => setTimeout(resolve, 1500))
                    
                    // Add images progressively faster up to 100
                    let delay = 1000
                    
                    for (let i = 3; i <= 100; i++) {
                      allImages.push({
                        x: Math.random() * (window.innerWidth - 438),
                        y: Math.random() * (window.innerHeight - 438),
                        id: i
                      })
                      setErrorImages([...allImages])
                      
                      // Play individual sounds only up to image 17
                      if (i <= 17) {
                        playErrorSound()
                      } else if (i === 18) {
                        // Start accelerating sound loop at image 18
                        const startTime = Date.now()
                        const createAcceleratingLoop = () => {
                          playErrorSound()
                          
                          // Only accelerate for 3.5 seconds
                          if (Date.now() - startTime < 3500) {
                            soundDelay = Math.max(50, soundDelay * 0.92) // Speed up by 8% each time
                          }
                          // After 3.5 seconds, maintain the current speed
                          
                          soundLoop = setTimeout(createAcceleratingLoop, soundDelay)
                        }
                        createAcceleratingLoop()
                      }
                      
                      // Exponentially decrease delay, minimum 50ms
                      delay = Math.max(50, delay * 0.9)
                      await new Promise(resolve => setTimeout(resolve, delay))
                    }
                    
                    // Stop sound loop after all images
                    if (soundLoop) {
                      setTimeout(() => clearTimeout(soundLoop), 2000)
                    }
                    
                    // Wait a bit with all images showing
                    await new Promise(resolve => setTimeout(resolve, 3000))
                    
                    // Play shutdown sound again before showing bug message
                    const shutdownAudio2 = new Audio('/sounds/shutdown.mp3')
                    shutdownAudio2.play().catch(e => console.log('Second shutdown audio failed:', e))
                    
                    // Show bug message (keep images visible)
                    setShowBugMessage(true)
                  }
                  
                  showErrorSequence()
                  }, 1000) // Wait 1 second after shutdown sound starts
                }
              }}
              style={{
                position: 'fixed',
                left: `${buttonPosition.x}px`,
                top: `${buttonPosition.y}px`,
                transition: 'all 0.2s ease',
                transform: isJumping ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-bold pointer-events-auto shadow-lg hover:shadow-xl"
              onMouseEnter={() => setIsJumping(true)}
              onMouseLeave={() => setIsJumping(false)}
            >
              {jumpCount < 10 ? 'EXIT' : 'WARNING!'}
            </Button>
          </div>
          {/* Error images */}
          {errorImages.map(error => (
            <Image 
              key={error.id}
              src="/icons/errorpic.png" 
              alt="Error" 
              width={438}
              height={354}
              className="fixed z-50"
              style={{ 
                left: `${error.x}px`, 
                top: `${error.y}px`,
                pointerEvents: 'none'
              }}
              priority
            />
          ))}
          {/* Bug message */}
          {showBugMessage && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
              <div className="bg-gray-900 border-4 border-green-500 rounded-xl p-12 max-w-2xl text-center animate-pulse">
                <h2 className="text-6xl font-mono text-green-500 mb-6">SYSTEM ERROR</h2>
                <p className="text-3xl text-white mb-8 font-mono">
                  Must be a bug... 🐛
                  <br />
                  <br />
                  Oh well, we can use the website for games at least!
                </p>
                <Button 
                  onClick={() => {
                    setShowBugMessage(false)
                    setErrorImages([])  // Clear all error images
                    setJumpCount(0)
                    setButtonPosition({ x: 0, y: 0 })
                    // Stop any playing audio
                    if (audioRef.current) {
                      audioRef.current.pause()
                      audioRef.current = null
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-xl rounded"
                >
                  CLOSE & RESET
                </Button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    )
  }

  // Game components
  if (gameMode === 'snake') return <SnakeGame onExit={() => setGameMode('select')} />
  if (gameMode === 'pong') return <PongGame onExit={() => setGameMode('select')} />
  if (gameMode === 'galaga') return <GalagaGame onExit={() => setGameMode('select')} />
}