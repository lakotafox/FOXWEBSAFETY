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

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', () => {
      mouse.x = -1000
      mouse.y = -1000
    })

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
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <section className="relative w-full h-[600px] bg-slate-900 overflow-hidden">
      {/* Fallback background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* WE OFFER SPACE PLANNING AND DESIGN text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h2 className="text-4xl md:text-6xl font-thin text-white tracking-[0.2em] uppercase text-center px-4">
          WE OFFER SPACE PLANNING AND DESIGN
        </h2>
      </div>
    </section>
  )
}