'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface PongGameProps {
  onExit: () => void
}

export default function PongGame({ onExit }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scores, setScores] = useState({ player: 0, ai: 0 })
  const touchYRef = useRef<number | null>(null)
  const waitingForServeRef = useRef(false)
  const gameStateRef = useRef({
    ballX: 0,
    ballY: 0,
    ballDX: 4,
    ballDY: 4,
    playerY: 0,
    aiY: 0,
    paddleHeight: 120,
    paddleWidth: 20,
    baseSpeed: 4,
    speedMultiplier: 1.05
  })
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set canvas to full viewport
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const gameState = gameStateRef.current
    
    // Initialize positions
    gameState.ballX = canvas.width / 2
    gameState.ballY = canvas.height / 2
    gameState.playerY = canvas.height / 2 - gameState.paddleHeight / 2
    gameState.aiY = canvas.height / 2 - gameState.paddleHeight / 2
    
    // Sound helper functions
    const playHitSound = () => {
      const hitSounds = ['/sounds/ponghit2.mp3', '/sounds/ponghit4.mp3']
      const randomSound = hitSounds[Math.floor(Math.random() * hitSounds.length)]
      const audio = new Audio(randomSound)
      audio.play().catch(e => console.log('Hit sound failed:', e))
    }
    
    const playGoalSound = () => {
      const audio = new Audio('/sounds/ponggoal.mp3')
      audio.play().catch(e => console.log('Goal sound failed:', e))
      return audio
    }
    
    const playStartSound = () => {
      const audio = new Audio('/sounds/pongstart.mp3')
      audio.play().catch(e => console.log('Start sound failed:', e))
    }
    
    // Play start sound when game begins
    setTimeout(() => playStartSound(), 100)
    
    // Create scanline effect
    const scanlineCanvas = document.createElement('canvas')
    scanlineCanvas.width = canvas.width
    scanlineCanvas.height = canvas.height
    const scanlineCtx = scanlineCanvas.getContext('2d')!
    
    // Draw scanlines
    scanlineCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    for (let i = 0; i < canvas.height; i += 4) {
      scanlineCtx.fillRect(0, i, canvas.width, 2)
    }
    
    const gameLoop = () => {
      if (waitingForServeRef.current) return
      
      // Clear canvas with slight flicker effect
      const flicker = Math.random() > 0.98 ? 0.85 : 1
      ctx.fillStyle = `rgba(0, 0, 0, ${flicker})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw center line (blocky style)
      ctx.fillStyle = '#fff'
      const dashHeight = 20
      const gapHeight = 20
      for (let y = 0; y < canvas.height; y += dashHeight + gapHeight) {
        ctx.fillRect(canvas.width / 2 - 4, y, 8, dashHeight)
      }
      
      // Move ball
      gameState.ballX += gameState.ballDX
      gameState.ballY += gameState.ballDY
      
      // Ball collision with top/bottom
      if (gameState.ballY <= 10 || gameState.ballY >= canvas.height - 10) {
        gameState.ballDY = -gameState.ballDY
        playHitSound()
      }
      
      // Ball collision with paddles
      if (gameState.ballX <= 40 && 
          gameState.ballY >= gameState.playerY && 
          gameState.ballY <= gameState.playerY + gameState.paddleHeight &&
          gameState.ballDX < 0) {
        // Calculate where ball hit the paddle (from -1 to 1)
        let collidePoint = (gameState.ballY - (gameState.playerY + gameState.paddleHeight / 2))
        collidePoint = collidePoint / (gameState.paddleHeight / 2)
        
        // Calculate bounce angle (max 45 degrees)
        let angle = collidePoint * Math.PI / 4
        
        // Set new ball speeds based on angle and increase speed slightly
        let speed = Math.sqrt(gameState.ballDX * gameState.ballDX + gameState.ballDY * gameState.ballDY)
        speed = Math.min(speed * gameState.speedMultiplier, 15) // Cap at max speed
        gameState.ballDX = speed * Math.cos(angle)
        gameState.ballDY = speed * Math.sin(angle)
        playHitSound()
      }
      
      if (gameState.ballX >= canvas.width - 40 && 
          gameState.ballY >= gameState.aiY && 
          gameState.ballY <= gameState.aiY + gameState.paddleHeight &&
          gameState.ballDX > 0) {
        // Calculate where ball hit the paddle (from -1 to 1)
        let collidePoint = (gameState.ballY - (gameState.aiY + gameState.paddleHeight / 2))
        collidePoint = collidePoint / (gameState.paddleHeight / 2)
        
        // Calculate bounce angle (max 45 degrees)
        let angle = collidePoint * Math.PI / 4
        
        // Set new ball speeds based on angle and increase speed slightly
        let speed = Math.sqrt(gameState.ballDX * gameState.ballDX + gameState.ballDY * gameState.ballDY)
        speed = Math.min(speed * gameState.speedMultiplier, 15) // Cap at max speed
        gameState.ballDX = -speed * Math.cos(angle)
        gameState.ballDY = speed * Math.sin(angle)
        playHitSound()
      }
      
      // Score
      if (gameState.ballX <= 0) {
        setScores(prev => ({ ...prev, ai: prev.ai + 1 }))
        waitingForServeRef.current = true
        playGoalSound()
        
        // Reset ball position immediately
        gameState.ballX = canvas.width / 2
        gameState.ballY = canvas.height / 2
        gameState.ballDX = 0
        gameState.ballDY = 0
        
        // Wait 1.5 seconds then serve
        setTimeout(() => {
          gameState.ballDX = -gameState.baseSpeed
          gameState.ballDY = (Math.random() - 0.5) * gameState.baseSpeed
          waitingForServeRef.current = false
          playStartSound()
        }, 1500)
      }
      if (gameState.ballX >= canvas.width) {
        setScores(prev => ({ ...prev, player: prev.player + 1 }))
        waitingForServeRef.current = true
        playGoalSound()
        
        // Reset ball position immediately
        gameState.ballX = canvas.width / 2
        gameState.ballY = canvas.height / 2
        gameState.ballDX = 0
        gameState.ballDY = 0
        
        // Wait 1.5 seconds then serve
        setTimeout(() => {
          gameState.ballDX = gameState.baseSpeed
          gameState.ballDY = (Math.random() - 0.5) * gameState.baseSpeed
          waitingForServeRef.current = false
          playStartSound()
        }, 1500)
      }
      
      // AI movement - original Pong style (perfect tracking with speed limit)
      const aiSpeed = 5.5 // Slightly slower than ball max speed
      const aiCenter = gameState.aiY + gameState.paddleHeight / 2
      const targetY = gameState.ballY
      
      // Move towards ball position, limited by max speed
      if (targetY > aiCenter) {
        gameState.aiY = Math.min(gameState.aiY + aiSpeed, canvas.height - gameState.paddleHeight)
      } else if (targetY < aiCenter) {
        gameState.aiY = Math.max(gameState.aiY - aiSpeed, 0)
      }
      
      // Draw paddles (blocky style)
      ctx.fillStyle = '#fff'
      ctx.fillRect(20, gameState.playerY, gameState.paddleWidth, gameState.paddleHeight)
      ctx.fillRect(canvas.width - 40, gameState.aiY, gameState.paddleWidth, gameState.paddleHeight)
      
      // Draw ball trail (ghosting effect)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fillRect(gameState.ballX - gameState.ballDX - 6, gameState.ballY - gameState.ballDY - 6, 12, 12)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.fillRect(gameState.ballX - gameState.ballDX * 0.5 - 6, gameState.ballY - gameState.ballDY * 0.5 - 6, 12, 12)
      
      // Draw ball (square instead of circle)
      ctx.fillStyle = '#fff'
      ctx.fillRect(gameState.ballX - 6, gameState.ballY - 6, 12, 12)
      
      // Draw scores (pixelated style)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 80px monospace'
      ctx.fillText(scores.player.toString(), canvas.width / 4, 100)
      ctx.fillText(scores.ai.toString(), 3 * canvas.width / 4 - 80, 100)
      
      // Apply scanlines over everything
      ctx.globalAlpha = 0.1
      ctx.drawImage(scanlineCanvas, 0, 0)
      ctx.globalAlpha = 1
      
      // Add green phosphor tint
      ctx.fillStyle = 'rgba(0, 255, 0, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    const interval = setInterval(gameLoop, 16)
    
    // Keyboard controls
    const keys: {[key: string]: boolean} = {}
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }
    
    // Update player position based on keys
    const updatePlayerPosition = () => {
      const paddleSpeed = 5 // Slower, like original Pong
      if (keys['ArrowUp'] && gameState.playerY > 0) {
        gameState.playerY -= paddleSpeed
      }
      if (keys['ArrowDown'] && gameState.playerY < canvas.height - gameState.paddleHeight) {
        gameState.playerY += paddleSpeed
      }
    }
    
    const controlInterval = setInterval(updatePlayerPosition, 16)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // Touch controls for mobile
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const canvasRect = canvas.getBoundingClientRect()
      const touchY = touch.clientY - canvasRect.top
      
      // Directly set player paddle position to follow touch
      gameState.playerY = Math.max(0, Math.min(touchY - gameState.paddleHeight / 2, canvas.height - gameState.paddleHeight))
    }
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      handleTouchMove(e)
    }
    
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    
    return () => {
      clearInterval(interval)
      clearInterval(controlInterval)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
    }
  }, [scores])
  
  return (
    <div className="fixed inset-0 bg-black">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0"
      />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-center">
        <p className="text-xl mb-2">First to 10 wins!</p>
      </div>
      {(scores.player >= 10 || scores.ai >= 10) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <h2 className="text-6xl mb-4">
              {scores.player >= 10 ? 'You Win!' : 'AI Wins!'}
            </h2>
            <Button onClick={() => window.location.reload()} className="bg-white text-black mr-4">
              Play Again
            </Button>
            <Button onClick={onExit} className="bg-gray-600 text-white">
              Back to Games
            </Button>
          </div>
        </div>
      )}
      <Button 
        onClick={onExit} 
        className="absolute top-4 right-4 bg-gray-800 text-white"
      >
        Exit
      </Button>
    </div>
  )
}