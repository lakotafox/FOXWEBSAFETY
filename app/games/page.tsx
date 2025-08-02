"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function GamesPage() {
  const [gameMode, setGameMode] = useState<'select' | 'snake' | 'pong' | 'galaga'>('select')
  const [clickCount, setClickCount] = useState(0)
  const [jumpCount, setJumpCount] = useState(0)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [isJumping, setIsJumping] = useState(false)
  const [errorImages, setErrorImages] = useState<Array<{x: number, y: number, id: number}>>([])
  const [showBugMessage, setShowBugMessage] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Snake Game Component
  const SnakeGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const gameStateRef = useRef({
      snake: [{ x: 10, y: 10 }],
      dx: 0,
      dy: 0,
      foodX: 15,
      foodY: 15,
      running: false,
      currentScore: 0
    })
    
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      // Set canvas to full viewport
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const gridSize = 30
      const tileCountX = Math.floor(canvas.width / gridSize)
      const tileCountY = Math.floor(canvas.height / gridSize)
      
      // Initialize game state
      const gameState = gameStateRef.current
      const startX = Math.floor(tileCountX / 2)
      const startY = Math.floor(tileCountY / 2)
      
      // Start with a snake of length 3
      gameState.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
      ]
      gameState.foodX = Math.floor(Math.random() * tileCountX)
      gameState.foodY = Math.floor(Math.random() * tileCountY)
      gameState.currentScore = 0
      
      const gameLoop = () => {
        // Clear canvas
        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        if (gameState.running && !gameOver) {
          // Move snake head
          const head = { 
            x: gameState.snake[0].x + gameState.dx, 
            y: gameState.snake[0].y + gameState.dy 
          }
          
          // Check walls
          if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
            setGameOver(true)
            gameState.running = false
            return
          }
          
          // Check self collision
          for (let i = 0; i < gameState.snake.length; i++) {
            if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
              setGameOver(true)
              gameState.running = false
              return
            }
          }
          
          gameState.snake.unshift(head)
          
          // Check food
          if (head.x === gameState.foodX && head.y === gameState.foodY) {
            gameState.currentScore++
            setScore(gameState.currentScore)
            // Find new food position that's not on the snake
            do {
              gameState.foodX = Math.floor(Math.random() * tileCountX)
              gameState.foodY = Math.floor(Math.random() * tileCountY)
            } while (gameState.snake.some(segment => 
              segment.x === gameState.foodX && segment.y === gameState.foodY
            ))
          } else {
            gameState.snake.pop()
          }
        }
        
        // Draw snake with gradient effect
        gameState.snake.forEach((segment, index) => {
          const brightness = 255 - (index * 5)
          ctx.fillStyle = `rgb(0, ${Math.max(brightness, 100)}, 0)`
          ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4)
        })
        
        // Draw food
        ctx.fillStyle = '#f00'
        ctx.beginPath()
        ctx.arc(
          gameState.foodX * gridSize + gridSize / 2, 
          gameState.foodY * gridSize + gridSize / 2, 
          gridSize / 2 - 4, 
          0, 
          Math.PI * 2
        )
        ctx.fill()
        
        // Draw score
        ctx.fillStyle = 'white'
        ctx.font = '30px monospace'
        ctx.fillText(`Score: ${gameState.currentScore}`, 20, 40)
      }
      
      const interval = setInterval(gameLoop, 100)
      
      // Controls
      const handleKeyPress = (e: KeyboardEvent) => {
        if (!gameState.running && !gameOver && e.key.startsWith('Arrow')) {
          gameState.running = true
          setGameStarted(true)
        }
        
        switch(e.key) {
          case 'ArrowUp': 
            if (gameState.dy === 0 && gameState.running) { 
              gameState.dx = 0; 
              gameState.dy = -1; 
            } 
            break
          case 'ArrowDown': 
            if (gameState.dy === 0 && gameState.running) { 
              gameState.dx = 0; 
              gameState.dy = 1; 
            } 
            break
          case 'ArrowLeft': 
            if (gameState.dx === 0 && gameState.running) { 
              gameState.dx = -1; 
              gameState.dy = 0; 
            } 
            break
          case 'ArrowRight': 
            if (gameState.dx === 0 && gameState.running) { 
              gameState.dx = 1; 
              gameState.dy = 0; 
            } 
            break
        }
      }
      
      window.addEventListener('keydown', handleKeyPress)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('keydown', handleKeyPress)
      }
    }, [gameOver])
    
    return (
      <div className="fixed inset-0 bg-black">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0"
        />
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-6xl font-bold mb-4">SNAKE</h1>
              <p className="text-2xl">Press any arrow key to start</p>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <h2 className="text-4xl mb-4">Game Over!</h2>
              <p className="text-2xl mb-4">Final Score: {score}</p>
              <Button onClick={() => window.location.reload()} className="bg-white text-black mr-4">
                Play Again
              </Button>
              <Button onClick={() => setGameMode('select')} className="bg-gray-600 text-white">
                Back to Games
              </Button>
            </div>
          </div>
        )}
        <Button 
          onClick={() => setGameMode('select')} 
          className="absolute top-4 right-4 bg-gray-800 text-white"
        >
          Exit
        </Button>
      </div>
    )
  }
  
  // Pong Game Component
  const PongGame = () => {
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
              <Button onClick={() => setGameMode('select')} className="bg-gray-600 text-white">
                Back to Games
              </Button>
            </div>
          </div>
        )}
        <Button 
          onClick={() => setGameMode('select')} 
          className="absolute top-4 right-4 bg-gray-800 text-white"
        >
          Exit
        </Button>
      </div>
    )
  }
  
  // Game selection screen
  if (gameMode === 'select') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-white mb-12">CHOOSE YOUR GAME</h1>
          <div className="flex gap-12">
            <Button 
              onClick={() => setGameMode('snake')} 
              className="bg-green-600 hover:bg-green-700 text-white text-4xl py-12 px-24 rounded-xl"
            >
              SNAKE
            </Button>
            <Button 
              onClick={() => setGameMode('pong')} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-4xl py-12 px-24 rounded-xl"
            >
              PONG
            </Button>
            <Button 
              onClick={() => setGameMode('galaga')} 
              className="bg-purple-600 hover:bg-purple-700 text-white text-4xl py-12 px-24 rounded-xl"
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
                  const shutdownAudio = new Audio('/shutdown.mp3')
                  shutdownAudio.play().catch(e => console.log('Shutdown audio failed:', e))
                  
                  // Wait for shutdown sound to play a bit before starting error sequence
                  setTimeout(() => {
                    // Trigger error image sequence with exponential timing
                    const showErrorSequence = async () => {
                    // Function to play error sound (let them overlap)
                    const playErrorSound = () => {
                      const audio = new Audio('/windows-error-sound-effect.mp3')
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
                    const shutdownAudio2 = new Audio('/shutdown.mp3')
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
                pointerEvents: 'auto'
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-4"
            >
              {jumpCount === 0 ? 'Close' : jumpCount < 10 ? `Catch me! (${10 - jumpCount} more clicks)` : 'ESCAPE TO MAIN SITE'}
            </Button>
          </div>
        </div>
        
        {/* Error Images */}
        {errorImages.map((img) => (
          <div
            key={img.id}
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${img.x}px`,
              top: `${img.y}px`,
              animation: 'pop-in 0.3s ease-out'
            }}
          >
            <Image
              src="/errorpic.png"
              alt="Error"
              width={438}
              height={438}
              className=""
            />
          </div>
        ))}
        
        {/* Bug Message */}
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
                className="bg-green-600 hover:bg-green-700 text-white text-2xl py-4 px-8 font-mono"
              >
                &lt; PLAY MORE GAMES /&gt;
              </Button>
            </div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes pop-in {
            0% { 
              transform: scale(0) rotate(0deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) rotate(10deg);
            }
            100% { 
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }
  
  // Galaga Game Component
  const GalagaGame = () => {
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
              <Button onClick={() => setGameMode('select')} className="bg-gray-600 text-white text-xl px-6 py-3">
                Back to Games
              </Button>
            </div>
          </div>
        )}
        <Button 
          onClick={() => setGameMode('select')} 
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
  
  if (gameMode === 'snake') return <SnakeGame />
  if (gameMode === 'pong') return <PongGame />
  if (gameMode === 'galaga') return <GalagaGame />
  
  return null
}