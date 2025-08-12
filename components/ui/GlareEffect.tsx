'use client'

import React, { useState, useEffect } from "react"
import "./GlareEffect.css"

interface GlareEffectProps {
  width?: string
  height?: string
  background?: string
  borderRadius?: string
  borderColor?: string
  children?: React.ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  triggerOnClick?: boolean
  className?: string
  style?: React.CSSProperties
}

const GlareEffect: React.FC<GlareEffectProps> = ({
  width = "100%",
  height = "100%",
  background = "transparent",
  borderRadius = "16px",
  borderColor = "transparent",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.4,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  triggerOnClick = true,
  className = "",
  style = {},
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Convert hex to rgba
  const hex = glareColor.replace("#", "")
  let rgba = glareColor
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  }

  const vars: React.CSSProperties & { [k: string]: string } = {
    "--ge-width": width,
    "--ge-height": height,
    "--ge-bg": background,
    "--ge-br": borderRadius,
    "--ge-angle": `${glareAngle}deg`,
    "--ge-duration": `${transitionDuration}ms`,
    "--ge-size": `${glareSize}%`,
    "--ge-rgba": rgba,
    "--ge-border": borderColor,
  }

  const handleClick = () => {
    if (triggerOnClick && !isAnimating) {
      setIsAnimating(true)
      // Reset animation after it completes
      setTimeout(() => {
        setIsAnimating(false)
      }, transitionDuration)
    }
  }

  // Also trigger on touch for mobile
  const handleTouch = (e: React.TouchEvent) => {
    if (triggerOnClick && !isAnimating) {
      e.preventDefault() // Prevent double-firing with click
      setIsAnimating(true)
      setTimeout(() => {
        setIsAnimating(false)
      }, transitionDuration)
    }
  }

  return (
    <div
      className={`glare-effect ${isAnimating ? 'glare-effect--animating' : ''} ${className}`}
      style={{ ...vars, ...style } as React.CSSProperties}
      onClick={handleClick}
      onTouchEnd={handleTouch}
    >
      {children}
    </div>
  )
}

export default GlareEffect