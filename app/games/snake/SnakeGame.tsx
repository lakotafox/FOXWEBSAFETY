'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface SnakeGameProps {
  onExit: () => void
}

export default function SnakeGame({ onExit }: SnakeGameProps) {
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