'use client'

import { useRef, useEffect, useCallback, useState } from "react"
import { gsap } from "gsap"
import "./MagicBento.css"

const DEFAULT_PARTICLE_COUNT = 12
const DEFAULT_SPOTLIGHT_RADIUS = 300
const DEFAULT_GLOW_COLOR = "132, 0, 255"
const MOBILE_BREAKPOINT = 768

interface ParticleCardProps {
  children: React.ReactNode
  className?: string
  disableAnimations?: boolean
  style?: React.CSSProperties
  particleCount?: number
  glowColor?: string
  enableTilt?: boolean
  clickEffect?: boolean
  enableMagnetism?: boolean
  alwaysShowParticles?: boolean
}

interface GlobalSpotlightProps {
  gridRef: React.MutableRefObject<HTMLDivElement | null>
  disableAnimations?: boolean
  enabled?: boolean
  spotlightRadius?: number
  glowColor?: string
}

interface BentoCardGridProps {
  children: React.ReactNode
  gridRef: React.MutableRefObject<HTMLDivElement | null>
}

interface MagicBentoProps {
  children: React.ReactNode
  textAutoHide?: boolean
  enableStars?: boolean
  enableSpotlight?: boolean
  enableBorderGlow?: boolean
  disableAnimations?: boolean
  spotlightRadius?: number
  particleCount?: number
  enableTilt?: boolean
  glowColor?: string
  clickEffect?: boolean
  enableMagnetism?: boolean
}

const createParticleElement = (
  x: number,
  y: number,
  color: string = DEFAULT_GLOW_COLOR
): HTMLDivElement => {
  const el = document.createElement("div")
  el.className = "particle"
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
})

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect()
  
  // Check if element has a transform scale applied
  const computedStyle = window.getComputedStyle(card)
  const transform = computedStyle.transform
  let scale = 1
  
  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix.*\((.+)\)/)
    if (matrix) {
      const values = matrix[1].split(', ')
      scale = parseFloat(values[0]) // Get X scale value
    }
  }
  
  // Adjust mouse position for scale
  const relativeX = ((mouseX - rect.left) / scale / (rect.width / scale)) * 100
  const relativeY = ((mouseY - rect.top) / scale / (rect.height / scale)) * 100

  card.style.setProperty("--glow-x", `${relativeX}%`)
  card.style.setProperty("--glow-y", `${relativeY}%`)
  card.style.setProperty("--glow-intensity", glow.toString())
  card.style.setProperty("--glow-radius", `${radius}px`)
}

export const ParticleCard: React.FC<ParticleCardProps> = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  alwaysShowParticles = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const isHoveredRef = useRef(false)
  const memoizedParticles = useRef<HTMLDivElement[]>([])
  const particlesInitialized = useRef(false)
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null)
  const lastSoundPlayedRef = useRef<number>(0) // Track last sound play time for mobile

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return

    const { width, height } = cardRef.current.getBoundingClientRect()
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    )
    particlesInitialized.current = true
  }, [particleCount, glowColor])

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    magnetismAnimationRef.current?.kill()

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle)
        },
      })
    })
    particlesRef.current = []
  }, [])

  const animateParticles = useCallback(() => {
    if (!cardRef.current || (!isHoveredRef.current && !alwaysShowParticles)) return

    if (!particlesInitialized.current) {
      initializeParticles()
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if ((!isHoveredRef.current && !alwaysShowParticles) || !cardRef.current) return

        const clone = particle.cloneNode(true) as HTMLDivElement
        cardRef.current.appendChild(clone)
        particlesRef.current.push(clone)

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        )

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        })

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        })
      }, index * 100)

      timeoutsRef.current.push(timeoutId)
    })
  }, [initializeParticles, alwaysShowParticles])

  // Effect to show particles on mount if alwaysShowParticles is true
  useEffect(() => {
    if (alwaysShowParticles && !disableAnimations) {
      // Small delay to ensure card is rendered
      const timer = setTimeout(() => {
        animateParticles()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [alwaysShowParticles, animateParticles, disableAnimations])

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return

    const element = cardRef.current

    const handleMouseEnter = () => {
      isHoveredRef.current = true
      // Only animate particles on desktop (unless alwaysShowParticles is true)
      if (window.innerWidth >= 768 || alwaysShowParticles) {
        animateParticles()
      }

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 10,
          rotateY: 10,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        })
      }
    }

    const handleMouseLeave = () => {
      isHoveredRef.current = false
      if (!alwaysShowParticles) {
        clearAllParticles()
      }

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -30  // Increased to -30 for more tilt
        const rotateY = ((x - centerX) / centerX) * 30   // Increased to 30 for more tilt

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
          force3D: true,
        })
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.1  // Increased from 0.05 to 0.1
        const magnetY = (y - centerY) * 0.1  // Increased from 0.05 to 0.1

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }

    // Track if touch was just handled to prevent double ripple
    let touchHandled = false
    
    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return
      
      // Skip click if touch was just handled (prevents double ripple on mobile)
      if (touchHandled) {
        touchHandled = false
        return
      }

      const rect = element.getBoundingClientRect()
      
      // Check if element has a transform scale applied
      const computedStyle = window.getComputedStyle(element)
      const transform = computedStyle.transform
      let scale = 1
      
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix.*\((.+)\)/)
        if (matrix) {
          const values = matrix[1].split(', ')
          scale = parseFloat(values[0]) // Get X scale value
        }
      }
      
      // Adjust mouse position for scale
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale
      const isMobile = window.innerWidth < 768

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width / scale, y),
        Math.hypot(x, y - rect.height / scale),
        Math.hypot(x - rect.width / scale, y - rect.height / scale)
      )

      // Check if this is a desktop void card (scaled card)
      const isDesktopVoidCard = !isMobile && scale > 1.3
      
      // Only play water drop sound for DESKTOP void cards (mobile handled in touchstart)
      if (isDesktopVoidCard) {
        const audio = new Audio('/water_drop.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {
          // Ignore errors if audio can't play
        })
      }
      // Skip sound for mobile here - it's handled in handleTouchStart to avoid double-playing
      
      // Increase ripple intensity by 30% for desktop void cards
      const baseOpacity = isMobile ? 0.9 : (isDesktopVoidCard ? 0.52 : 0.4) // 0.4 * 1.3 = 0.52
      const secondaryOpacity = isMobile ? 0.6 : (isDesktopVoidCard ? 0.26 : 0.2) // 0.2 * 1.3 = 0.26
      
      const ripple = document.createElement("div")
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, ${baseOpacity}) 0%, rgba(${glowColor}, ${secondaryOpacity}) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `

      element.appendChild(ripple)

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: isMobile ? 1.5 : 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      )
    }

    // Add touch handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      isHoveredRef.current = true
      // No particles on mobile
      
      if (clickEffect && e.touches.length > 0) {
        // Mark that touch was handled to prevent double ripple from click event
        touchHandled = true
        
        const touch = e.touches[0]
        const rect = element.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        
        // Check if this is a mobile void card
        const isMobileVoidCard = element.closest('.pt-20.pb-4.px-4') !== null
        
        // Play water drop sound for mobile void cards with debounce
        if (isMobileVoidCard) {
          const now = Date.now()
          // Only play sound if at least 300ms has passed since last sound (prevent rapid double sounds)
          if (now - lastSoundPlayedRef.current > 300) {
            const audio = new Audio('/water_drop.mp3')
            audio.volume = 0.5
            audio.play().catch(() => {
              // Ignore errors if audio can't play
            })
            lastSoundPlayedRef.current = now
          }
          // If rapid touch detected (within 300ms), skip playing the sound entirely
        }
        
        // Create bright ripple effect for touch
        const maxDistance = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height)
        )

        const ripple = document.createElement("div")
        ripple.style.cssText = `
          position: absolute;
          width: ${maxDistance * 2}px;
          height: ${maxDistance * 2}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 1) 0%, rgba(${glowColor}, 0.7) 30%, transparent 70%);
          left: ${x - maxDistance}px;
          top: ${y - maxDistance}px;
          pointer-events: none;
          z-index: 1000;
        `

        element.appendChild(ripple)

        gsap.fromTo(
          ripple,
          {
            scale: 0,
            opacity: 1,
          },
          {
            scale: 1,
            opacity: 0,
            duration: 2, // Longer duration for mobile
            ease: "power2.out",
            onComplete: () => ripple.remove(),
          }
        )
      }
      
      if (enableTilt && e.touches.length > 0) {
        const touch = e.touches[0]
        const rect = element.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        
        const rotateX = ((y - centerY) / centerY) * -25  // Even more tilt for mobile
        const rotateY = ((x - centerX) / centerX) * 25
        
        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.2,
          ease: "power2.out",
          transformPerspective: 800,
        })
      }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!enableTilt) return
      
      const touch = e.touches[0]
      const rect = element.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const rotateX = ((y - centerY) / centerY) * -25
      const rotateY = ((x - centerX) / centerX) * 25
      
      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: "power2.out",
        transformPerspective: 800,
      })
    }
    
    const handleTouchEnd = () => {
      isHoveredRef.current = false
      if (!alwaysShowParticles) {
        clearAllParticles()
      }
      
      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }

    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)
    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("click", handleClick)
    element.addEventListener("touchstart", handleTouchStart, { passive: true })
    element.addEventListener("touchmove", handleTouchMove, { passive: true })
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      isHoveredRef.current = false
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("click", handleClick)
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
      clearAllParticles()
    }
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ])

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  )
}

export const GlobalSpotlight: React.FC<GlobalSpotlightProps> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null)
  const isInsideSection = useRef(false)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return

    const spotlight = document.createElement("div")
    spotlight.className = "global-spotlight"
    spotlight.style.cssText = `
      position: fixed;
      width: 1200px;
      height: 1200px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.23) 0%,
        rgba(${glowColor}, 0.12) 15%,
        rgba(${glowColor}, 0.06) 25%,
        rgba(${glowColor}, 0.03) 40%,
        rgba(${glowColor}, 0.015) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `
    document.body.appendChild(spotlight)
    spotlightRef.current = spotlight

    // Helper function to start fade-out timer
    const startFadeTimer = () => {
      // Only fade on mobile, not desktop
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      if (!isMobile) return // No fade on desktop
      
      // Clear any existing timer
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      
      // Start fade animation immediately but slowly (mobile only)
      fadeTimeoutRef.current = setTimeout(() => {
        // Start gradual fade out over 2.5 seconds
        if (spotlightRef.current) {
          gsap.to(spotlightRef.current, {
            opacity: 0,
            duration: 2.5,  // Fade over 2.5 seconds
            ease: "power2.inOut",
            overwrite: "auto",  // Allow this to be interrupted
          })
        }
        
        // Fade out card glows gradually
        if (gridRef.current) {
          const cards = gridRef.current.querySelectorAll(".card")
          cards.forEach((card) => {
            const cardElement = card as HTMLElement
            
            // Gradually reduce glow intensity
            gsap.to(cardElement, {
              "--glow-intensity": 0,
              duration: 2.5,  // Match spotlight fade duration
              ease: "power2.inOut",
              overwrite: "auto",  // Allow this to be interrupted
            })
          })
        }
      }, 100) // Start fade almost immediately after stopping
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return
      
      // Clear fade timer on movement
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      
      // Kill only opacity/glow fade animations, not tilt or other transforms
      gsap.killTweensOf(spotlightRef.current, { opacity: true })
      
      // Force spotlight to be visible immediately if it was faded
      const currentOpacity = parseFloat(spotlightRef.current.style.opacity || "0")
      if (currentOpacity < 0.1) {
        gsap.set(spotlightRef.current, { opacity: 0.2 }) // Set minimum visible opacity instantly
      }
      
      gridRef.current.querySelectorAll(".card").forEach((card) => {
        // Only kill the glow intensity animation, not transforms
        gsap.killTweensOf(card as HTMLElement, { "--glow-intensity": true })
      })

      const section = gridRef.current.closest(".bento-section")
      const rect = section?.getBoundingClientRect()
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      isInsideSection.current = mouseInside || false
      const cards = gridRef.current.querySelectorAll(".card")

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        })
        cards.forEach((card) => {
          (card as HTMLElement).style.setProperty("--glow-intensity", "0")
        })
        return
      }

      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius)
      let minDistance = Infinity

      cards.forEach((card) => {
        const cardElement = card as HTMLElement
        const cardRect = cardElement.getBoundingClientRect()
        const centerX = cardRect.left + cardRect.width / 2
        const centerY = cardRect.top + cardRect.height / 2
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2
        const effectiveDistance = Math.max(0, distance)

        minDistance = Math.min(minDistance, effectiveDistance)

        let glowIntensity = 0
        if (effectiveDistance <= proximity) {
          glowIntensity = 1
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity)
        }

        updateCardGlowProperties(
          cardElement,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        )
      })

      // Smoothly move spotlight to cursor position
      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.3,  // Slower, smoother movement
        ease: "power3.out",
        overwrite: "auto",  // Allow interruption
      })

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0

      // Emanate glow smoothly
      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.6 : 0.8,  // Slower fade in/out
        ease: "power2.inOut",
        overwrite: "auto",  // Allow interruption
      })
      
      // Start fade timer after movement stops
      startFadeTimer()
    }

    const handleMouseLeave = () => {
      // Clear fade timer on leave
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      isInsideSection.current = false
      gridRef.current?.querySelectorAll(".card").forEach((card) => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0")
      })
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }

    // Add touch handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      // Clear any fade timer immediately
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      
      // Kill fade animations
      if (spotlightRef.current) {
        gsap.killTweensOf(spotlightRef.current, { opacity: true })
        // Force visible immediately on touch
        gsap.set(spotlightRef.current, { opacity: 0.3 })
      }
      
      // Initialize glow on touch start
      if (e.touches.length > 0) {
        handleTouchMove(e)
      }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!spotlightRef.current || !gridRef.current || e.touches.length === 0) return
      
      // Clear fade timer on movement
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      
      // Kill only opacity/glow fade animations, not tilt or other transforms
      gsap.killTweensOf(spotlightRef.current, { opacity: true })
      
      // Force spotlight to be visible immediately if it was faded
      const currentOpacity = parseFloat(spotlightRef.current.style.opacity || "0")
      if (currentOpacity < 0.1) {
        gsap.set(spotlightRef.current, { opacity: 0.2 }) // Set minimum visible opacity instantly
      }
      
      gridRef.current.querySelectorAll(".card").forEach((card) => {
        // Only kill the glow intensity animation, not transforms
        gsap.killTweensOf(card as HTMLElement, { "--glow-intensity": true })
      })
      
      const touch = e.touches[0]
      const section = gridRef.current.closest(".bento-section")
      const rect = section?.getBoundingClientRect()
      const touchInside =
        rect &&
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom

      isInsideSection.current = touchInside || false
      const cards = gridRef.current.querySelectorAll(".card")

      if (!touchInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        })
        cards.forEach((card) => {
          (card as HTMLElement).style.setProperty("--glow-intensity", "0")
        })
        return
      }

      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius)
      let minDistance = Infinity

      cards.forEach((card) => {
        const cardElement = card as HTMLElement
        const cardRect = cardElement.getBoundingClientRect()
        const centerX = cardRect.left + cardRect.width / 2
        const centerY = cardRect.top + cardRect.height / 2
        const distance =
          Math.hypot(touch.clientX - centerX, touch.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2
        const effectiveDistance = Math.max(0, distance)

        minDistance = Math.min(minDistance, effectiveDistance)

        let glowIntensity = 0
        if (effectiveDistance <= proximity) {
          glowIntensity = 1
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity)
        }

        updateCardGlowProperties(
          cardElement,
          touch.clientX,
          touch.clientY,
          glowIntensity,
          spotlightRadius
        )
      })

      // Smoothly move spotlight to touch position
      gsap.to(spotlightRef.current, {
        left: touch.clientX,
        top: touch.clientY,
        duration: 0.3,  // Slower, smoother movement
        ease: "power3.out",
      })

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0

      // Emanate glow smoothly
      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.6 : 0.8,  // Slower fade in/out
        ease: "power2.inOut",
        overwrite: "auto",  // Allow interruption
      })
      
      // Start fade timer after movement stops
      startFadeTimer()
    }
    
    const handleTouchEnd = () => {
      // Clear fade timer on touch end
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      isInsideSection.current = false
      // Force immediate reset of all cards
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(".card")
        cards.forEach((card) => {
          const cardElement = card as HTMLElement
          cardElement.style.setProperty("--glow-intensity", "0")
          cardElement.style.setProperty("--glow-x", "50%")
          cardElement.style.setProperty("--glow-y", "50%")
        })
      }
      if (spotlightRef.current) {
        gsap.set(spotlightRef.current, { opacity: 0 })
      }
    }
    
    const handleTouchCancel = () => {
      // Same as touchend to ensure cleanup
      handleTouchEnd()
    }

    // Handle mouse enter to immediately show glow
    const handleMouseEnter = (e: MouseEvent) => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      if (spotlightRef.current) {
        gsap.killTweensOf(spotlightRef.current, { opacity: true })
        gsap.set(spotlightRef.current, { opacity: 0.3 })
      }
      handleMouseMove(e)
    }
    
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd)
    document.addEventListener("touchcancel", handleTouchCancel)

    return () => {
      // Clear fade timer
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("touchcancel", handleTouchCancel)
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current)
    }
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor])

  return null
}

export const BentoCardGrid: React.FC<BentoCardGridProps> = ({
  children,
  gridRef
}) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
)

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobileDetection()
  // Don't auto-disable animations on mobile - let them work everywhere
  const shouldDisableAnimations = disableAnimations

  return (
    <>
      {enableSpotlight && (  // Enable spotlight on all devices now that we have touch support
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {children}
      </BentoCardGrid>
    </>
  )
}

export default MagicBento