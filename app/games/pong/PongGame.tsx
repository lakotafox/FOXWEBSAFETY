'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface PongGameProps {
  onExit: () => void
}

export default function PongGame({ onExit }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scores, setScores] = useState({ player: 0, ai: 0 })
  const gameStateRef = useRef({
    ballX: 0,
    ballY: 0,
    ballDX: 7,
    ballDY: 7,
    playerY: 0,
    aiY: 0,
    paddleHeight: 120,
    paddleWidth: 20,
    baseSpeed: 7,
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
    
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw center line
      ctx.setLineDash([10, 10])
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, 0)
      ctx.lineTo(canvas.width / 2, canvas.height)
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 5
      ctx.stroke()
      ctx.setLineDash([])
      
      // Move ball
      gameState.ballX += gameState.ballDX
      gameState.ballY += gameState.ballDY
      
      // Ball collision with top/bottom
      if (gameState.ballY <= 10 || gameState.ballY >= canvas.height - 10) {
        gameState.ballDY = -gameState.ballDY
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
      }
      
      // Score
      if (gameState.ballX <= 0) {
        setScores(prev => ({ ...prev, ai: prev.ai + 1 }))
        gameState.ballX = canvas.width / 2
        gameState.ballY = canvas.height / 2
        gameState.ballDX = -gameState.baseSpeed
        gameState.ballDY = (Math.random() - 0.5) * gameState.baseSpeed
      }
      if (gameState.ballX >= canvas.width) {
        setScores(prev => ({ ...prev, player: prev.player + 1 }))
        gameState.ballX = canvas.width / 2
        gameState.ballY = canvas.height / 2
        gameState.ballDX = gameState.baseSpeed
        gameState.ballDY = (Math.random() - 0.5) * gameState.baseSpeed
      }
      
      // AI movement (improved)
      const aiSpeed = 4
      const aiCenter = gameState.aiY + gameState.paddleHeight / 2
      if (gameState.ballY > aiCenter + 20) {
        gameState.aiY = Math.min(gameState.aiY + aiSpeed, canvas.height - gameState.paddleHeight)
      } else if (gameState.ballY < aiCenter - 20) {
        gameState.aiY = Math.max(gameState.aiY - aiSpeed, 0)
      }
      
      // Draw paddles
      ctx.fillStyle = '#fff'
      ctx.fillRect(20, gameState.playerY, gameState.paddleWidth, gameState.paddleHeight)
      ctx.fillRect(canvas.width - 40, gameState.aiY, gameState.paddleWidth, gameState.paddleHeight)
      
      // Draw ball
      ctx.beginPath()
      ctx.arc(gameState.ballX, gameState.ballY, 10, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw scores
      ctx.font = '60px monospace'
      ctx.fillText(scores.player.toString(), canvas.width / 4, 80)
      ctx.fillText(scores.ai.toString(), 3 * canvas.width / 4 - 60, 80)
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
      const paddleSpeed = 8
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
    
    return () => {
      clearInterval(interval)
      clearInterval(controlInterval)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
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
        <p className="text-sm text-gray-400">Use ↑↓ Arrow Keys to move</p>
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