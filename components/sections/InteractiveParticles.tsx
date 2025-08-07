'use client'

import { useEffect, useRef } from 'react'

export default function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Particle array
    const particles: any[] = []
    const mouse = { x: -1000, y: -1000 }
    let globalHue = 0

    // Create particles
    const particleCount = 150
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 5 + 3,
        hue: (i / particleCount) * 360
      })
    }

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    // Track scroll prevention and touch timing
    let scrollPreventTimeout: NodeJS.Timeout | null = null
    let shouldPreventScroll = false
    let touchStartTime = 0
    let lastTouchEndTime = 0

    // Handle touch movement for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        const touch = e.touches[0]
        const touchY = touch.clientY - rect.top
        const canvasHeight = rect.height
        
        touchStartTime = Date.now()
        
        // Check if this touch came quickly after the last one ended
        const gapSinceLastTouch = touchStartTime - lastTouchEndTime
        if (gapSinceLastTouch < 300 && lastTouchEndTime > 0) {
          // User is making repeated touch attempts - allow scroll
          shouldPreventScroll = false
        } else {
          // Check if touch is in top 15% - always allow scroll there
          const topBoundary = canvasHeight * 0.15
          
          if (touchY < topBoundary) {
            // Top edge - always allow scroll
            shouldPreventScroll = false
          } else {
            // Rest of canvas (bottom 85%) - prevent scroll
            shouldPreventScroll = true
            
            // Allow scroll again after 600ms
            if (scrollPreventTimeout) clearTimeout(scrollPreventTimeout)
            scrollPreventTimeout = setTimeout(() => {
              shouldPreventScroll = false
            }, 600)
          }
        }
        
        mouse.x = touch.clientX - rect.left
        mouse.y = touchY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        
        // ALWAYS update mouse position for particle interaction
        mouse.x = touch.clientX - rect.left
        mouse.y = touch.clientY - rect.top
        
        // Only prevent scroll if conditions are met
        const touchDuration = Date.now() - touchStartTime
        
        // If touch is held for more than 150ms, prevent scroll
        // If it's a quick swipe (less than 150ms), allow scroll
        if (shouldPreventScroll && touchDuration > 150) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = () => {
      mouse.x = -1000
      mouse.y = -1000
      lastTouchEndTime = Date.now()
      shouldPreventScroll = false
      if (scrollPreventTimeout) {
        clearTimeout(scrollPreventTimeout)
        scrollPreventTimeout = null
      }
    }

    // Mouse events
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', () => {
      mouse.x = -1000
      mouse.y = -1000
    })

    // Touch events - note: touchmove is NOT passive when we need to prevent scroll
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Animation loop
    function animate() {
      // Create trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update global hue
      globalHue = (globalHue + 0.5) % 360

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off walls
        if (particle.x < particle.radius || particle.x > canvas.width - particle.radius) {
          particle.vx *= -1
        }
        if (particle.y < particle.radius || particle.y > canvas.height - particle.radius) {
          particle.vy *= -1
        }

        // Mouse repulsion
        const dx = mouse.x - particle.x
        const dy = mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          const force = (150 - distance) / 150
          particle.x -= (dx / distance) * force * 5
          particle.y -= (dy / distance) * force * 5
        }

        // Draw particle
        const hue = (globalHue + particle.hue) % 360
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()

        // Connect nearby particles
        particles.slice(index + 1).forEach(other => {
          const dist = Math.sqrt(
            Math.pow(other.x - particle.x, 2) + 
            Math.pow(other.y - particle.y, 2)
          )
          if (dist < 100) {
            ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${1 - dist / 100})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener('resize', handleResize)

    // Start animation
    animate()

    // Cleanup
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('resize', handleResize)
      if (scrollPreventTimeout) {
        clearTimeout(scrollPreventTimeout)
      }
    }
  }, [])

  return (
    <section 
      className="relative w-full bg-slate-900 overflow-hidden"
      style={{ height: '600px', minHeight: '600px' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* SPACE DESIGN AND PLANNING SERVICES text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h2 className="text-3xl md:text-5xl font-thin text-white tracking-[0.2em] uppercase text-center px-4">
          SPACE DESIGN AND PLANNING SERVICES
        </h2>
      </div>
    </section>
  )
}