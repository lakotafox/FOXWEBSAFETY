'use client'

import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollFloatProps {
  children: React.ReactNode
  scrollContainerRef?: React.RefObject<HTMLElement>
  containerClassName?: string
  textClassName?: string
  animationDuration?: number
  ease?: string
  scrollStart?: string
  scrollEnd?: string
  stagger?: number
}

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03
}: ScrollFloatProps) => {
  const containerRef = useRef<HTMLHeadingElement>(null)

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : ''
    return text.split("").map((char, index) => {
      // Apply blue color to FAVORITES
      const isFavorites = text.indexOf('FAVORITES') !== -1 && index >= text.indexOf('FAVORITES')
      return (
        <span 
          className={`char inline-block ${isFavorites ? 'text-blue-400' : ''}`} 
          key={index}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      )
    })
  }, [children])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const charElements = el.querySelectorAll('.char')

    // Animate when element reaches center of viewport
    gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%'
      },
      {
        duration: animationDuration,
        ease: ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top bottom-=200', // Start when top of element is 200px from bottom of viewport
          end: 'bottom center', // End when bottom hits center
          toggleActions: 'play none none none', // Play once when triggered
          once: true // Only animate once
        }
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [animationDuration, ease, stagger])

  return (
    <h2 ref={containerRef} className={`overflow-visible ${containerClassName}`}>
      <span className={`inline-block ${textClassName}`}>
        {splitText}
      </span>
    </h2>
  )
}

export default ScrollFloat