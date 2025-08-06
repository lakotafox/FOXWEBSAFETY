'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface GalagaGameProps {
  onExit: () => void
}

export default function GalagaGame({ onExit }: GalagaGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [wave, setWave] = useState(1)
  
  const gameStateRef = useRef({
    player: { x: 0, y: 0, width: 40, height: 40 },
    bullets: [] as Array<{x: number, y: number, width: number, height: number}>,
    enemies: [] as Array<{x: number, y: number, width: number, height: number, type: string, dx: number, dy: number, health: number}>,
    enemyBullets: [] as Array<{x: number, y: number, width: number, height: number}>,
    stars: [] as Array<{x: number, y: number, speed: number, size: number}>,
    lastShot: 0,
    enemyDirection: 1,
    enemyDropTimer: 0,
    currentScore: 0,
    currentLives: 3,
    currentWave: 1,
    powerUps: [] as Array<{x: number, y: number, type: string}>
  })
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const gameState = gameStateRef.current
    
    // Initialize player
    gameState.player.x = canvas.width / 2 - 20
    gameState.player.y = canvas.height - 100
    
    // Initialize stars background
    for (let i = 0; i < 100; i++) {
      gameState.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 0.5,
        size: Math.random() * 2
      })
    }
    
    // Create enemy wave
    const createWave = (waveNum: number) => {
      gameState.enemies = []
      const rows = Math.min(3 + Math.floor(waveNum / 2), 6)
      const cols = Math.min(8 + Math.floor(waveNum / 3), 12)
      const enemyWidth = 35
      const enemyHeight = 35
      const startX = (canvas.width - (cols * (enemyWidth + 15))) / 2
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const enemyType = row === 0 ? 'boss' : row < rows / 2 ? 'medium' : 'basic'
          gameState.enemies.push({
            x: startX + col * (enemyWidth + 15),
            y: 80 + row * (enemyHeight + 15),
            width: enemyWidth,
            height: enemyHeight,
            type: enemyType,
            dx: 0,
            dy: 0,
            health: enemyType === 'boss' ? 3 : enemyType === 'medium' ? 2 : 1
          })
        }
      }
    }
    
    createWave(gameState.currentWave)
    
    // Game loop
    const gameLoop = () => {
      if (gameOver) return
      
      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw stars
      gameState.stars.forEach(star => {
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
        ctx.fillStyle = '#fff'
        ctx.fillRect(star.x, star.y, star.size, star.size)
      })
      
      // Move enemies
      gameState.enemyDropTimer++
      let shouldDrop = false
      
      // Check if enemies hit edges
      gameState.enemies.forEach(enemy => {
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
          shouldDrop = true
        }
      })
      
      if (shouldDrop) {
        gameState.enemyDirection *= -1
        gameState.enemies.forEach(enemy => {
          enemy.y += 30
        })
      }
      
      // Update enemies
      gameState.enemies.forEach((enemy, enemyIndex) => {
        enemy.x += gameState.enemyDirection * (1 + gameState.currentWave * 0.3)
        
        // Randomly shoot
        if (Math.random() < 0.002 * gameState.currentWave) {
          gameState.enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 10
          })
        }
        
        // Draw enemy
        if (enemy.type === 'boss') {
          ctx.fillStyle = '#ff0000'
        } else if (enemy.type === 'medium') {
          ctx.fillStyle = '#ffff00'
        } else {
          ctx.fillStyle = '#00ff00'
        }
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
        
        // Draw health indicator
        if (enemy.health > 1) {
          ctx.fillStyle = '#fff'
          ctx.font = '12px monospace'
          ctx.fillText(enemy.health.toString(), enemy.x + 15, enemy.y + 20)
        }
      })
      
      // Update player bullets
      gameState.bullets = gameState.bullets.filter(bullet => {
        bullet.y -= 10
        
        // Check collision with enemies
        let hit = false
        gameState.enemies = gameState.enemies.filter(enemy => {
          if (bullet.x < enemy.x + enemy.width &&
              bullet.x + bullet.width > enemy.x &&
              bullet.y < enemy.y + enemy.height &&
              bullet.y + bullet.height > enemy.y) {
            enemy.health--
            if (enemy.health <= 0) {
              // Score based on enemy type
              const points = enemy.type === 'boss' ? 50 : enemy.type === 'medium' ? 20 : 10
              gameState.currentScore += points
              setScore(gameState.currentScore)
              
              // Chance for power-up
              if (Math.random() < 0.1) {
                gameState.powerUps.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y,
                  type: 'rapid'
                })
              }
              
              hit = true
              return false
            }
            hit = true
          }
          return true
        })
        
        return bullet.y > 0 && !hit
      })
      
      // Update enemy bullets
      gameState.enemyBullets = gameState.enemyBullets.filter(bullet => {
        bullet.y += 5
        
        // Check collision with player
        if (bullet.x < gameState.player.x + gameState.player.width &&
            bullet.x + bullet.width > gameState.player.x &&
            bullet.y < gameState.player.y + gameState.player.height &&
            bullet.y + bullet.height > gameState.player.y) {
          gameState.currentLives--
          setLives(gameState.currentLives)
          if (gameState.currentLives <= 0) {
            setGameOver(true)
          }
          return false
        }
        
        return bullet.y < canvas.height
      })
      
      // Update power-ups
      gameState.powerUps = gameState.powerUps.filter(powerUp => {
        powerUp.y += 2
        
        // Check collection
        if (powerUp.x < gameState.player.x + gameState.player.width &&
            powerUp.x + 20 > gameState.player.x &&
            powerUp.y < gameState.player.y + gameState.player.height &&
            powerUp.y + 20 > gameState.player.y) {
          // Apply power-up effect
          gameState.lastShot -= 300 // Rapid fire bonus
          return false
        }
        
        return powerUp.y < canvas.height
      })
      
      // Draw bullets
      ctx.fillStyle = '#fff'
      gameState.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      })
      
      // Draw enemy bullets
      ctx.fillStyle = '#ff6600'
      gameState.enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      })
      
      // Draw power-ups
      ctx.fillStyle = '#00ffff'
      gameState.powerUps.forEach(powerUp => {
        ctx.beginPath()
        ctx.arc(powerUp.x, powerUp.y, 10, 0, Math.PI * 2)
        ctx.fill()
      })
      
      // Draw player ship (triangle)
      ctx.fillStyle = '#0099ff'
      ctx.beginPath()
      ctx.moveTo(gameState.player.x + 20, gameState.player.y)
      ctx.lineTo(gameState.player.x, gameState.player.y + 40)
      ctx.lineTo(gameState.player.x + 40, gameState.player.y + 40)
      ctx.closePath()
      ctx.fill()
      
      // Draw UI
      ctx.fillStyle = '#fff'
      ctx.font = '24px monospace'
      ctx.fillText(`Score: ${gameState.currentScore}`, 20, 40)
      ctx.fillText(`Lives: ${gameState.currentLives}`, 20, 70)
      ctx.fillText(`Wave: ${gameState.currentWave}`, 20, 100)
      
      // Check wave complete
      if (gameState.enemies.length === 0) {
        gameState.currentWave++
        setWave(gameState.currentWave)
        createWave(gameState.currentWave)
      }
    }
    
    const interval = setInterval(gameLoop, 16)
    
    // Controls
    const keys: {[key: string]: boolean} = {}
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }
    
    // Update player position
    const updatePlayer = () => {
      if (keys['ArrowLeft'] && gameState.player.x > 0) {
        gameState.player.x -= 8
      }
      if (keys['ArrowRight'] && gameState.player.x < canvas.width - gameState.player.width) {
        gameState.player.x += 8
      }
      if (keys[' '] && Date.now() - gameState.lastShot > 200) {
        gameState.bullets.push({
          x: gameState.player.x + 18,
          y: gameState.player.y,
          width: 4,
          height: 10
        })
        gameState.lastShot = Date.now()
      }
    }
    
    const playerInterval = setInterval(updatePlayer, 16)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      clearInterval(interval)
      clearInterval(playerInterval)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameOver])
  
  return (
    <div className="fixed inset-0 bg-black">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0"
      />
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <h2 className="text-6xl mb-4">Game Over!</h2>
            <p className="text-3xl mb-2">Final Score: {score}</p>
            <p className="text-2xl mb-6">Wave Reached: {wave}</p>
            <Button onClick={() => window.location.reload()} className="bg-white text-black mr-4 text-xl px-6 py-3">
              Play Again
            </Button>
            <Button onClick={onExit} className="bg-gray-600 text-white text-xl px-6 py-3">
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
        <p className="text-lg">Arrow Keys: Move | Space: Shoot</p>
      </div>
      
    </div>
  )
}