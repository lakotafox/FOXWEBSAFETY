'use client'

import { useState, useEffect } from 'react'

export function useProductsCrop() {
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [editingCrop, setEditingCrop] = useState<string | null>(null)

  // Load crop settings from localStorage and products.json
  useEffect(() => {
    // Load from localStorage
    const savedCrops = localStorage.getItem('foxbuilt-products-page-crops')
    if (savedCrops) {
      try {
        setCropSettings(JSON.parse(savedCrops))
      } catch (e) {
        console.error('Error loading crop settings:', e)
      }
    }

    // Also try to load from products.json
    fetch('/products.json', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.productsCrops) {
          setCropSettings(prev => ({ ...prev, ...data.productsCrops }))
        }
      })
      .catch(() => console.log('Could not load crop settings from products.json'))
  }, [])

  // Save crop settings to localStorage
  const saveCropSettings = (settings: typeof cropSettings) => {
    localStorage.setItem('foxbuilt-products-page-crops', JSON.stringify(settings))
  }

  // Handle crop changes
  const handleCropChange = (imagePath: string, axis: 'scale' | 'x' | 'y', delta: number) => {
    setCropSettings(prev => {
      const current = prev[imagePath] || { scale: 1, x: 50, y: 50 }
      const newSettings = { ...prev }
      
      if (axis === 'scale') {
        newSettings[imagePath] = { 
          ...current, 
          scale: Math.max(0.1, Math.min(5, current.scale + delta)) 
        }
      } else {
        newSettings[imagePath] = { 
          ...current, 
          [axis]: Math.max(0, Math.min(100, current[axis] + delta)) 
        }
      }
      
      saveCropSettings(newSettings)
      return newSettings
    })
  }

  // Handle scroll for zoom
  const handleScroll = (e: React.WheelEvent, imagePath: string) => {
    if (editingCrop === imagePath) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setCropSettings(prev => {
        const current = prev[imagePath] || { scale: 1, x: 50, y: 50 }
        const newScale = Math.max(0.17, Math.min(9, current.scale * delta))
        const newSettings = {
          ...prev,
          [imagePath]: { ...current, scale: newScale }
        }
        saveCropSettings(newSettings)
        return newSettings
      })
    }
  }

  // Global keyboard and wheel event handlers
  useEffect(() => {
    if (!editingCrop) return
    
    // Prevent body scroll when editing
    document.body.style.overflow = 'hidden'
    
    const pressedKeys = new Set<string>()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingCrop) return
      
      pressedKeys.add(e.key)
      
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      const pressedArrows = arrowKeys.filter(key => pressedKeys.has(key))
      
      if (pressedArrows.length !== 1) return
      
      const moveAmount = 2
      const currentCrop = cropSettings[editingCrop] || { scale: 1, x: 50, y: 50 }
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setCropSettings(prev => {
            const newSettings = {
              ...prev,
              [editingCrop]: { ...currentCrop, y: Math.max(0, currentCrop.y - moveAmount) }
            }
            saveCropSettings(newSettings)
            return newSettings
          })
          break
        case 'ArrowDown':
          e.preventDefault()
          setCropSettings(prev => {
            const newSettings = {
              ...prev,
              [editingCrop]: { ...currentCrop, y: Math.min(100, currentCrop.y + moveAmount) }
            }
            saveCropSettings(newSettings)
            return newSettings
          })
          break
        case 'ArrowLeft':
          e.preventDefault()
          setCropSettings(prev => {
            const newSettings = {
              ...prev,
              [editingCrop]: { ...currentCrop, x: Math.max(0, currentCrop.x - moveAmount) }
            }
            saveCropSettings(newSettings)
            return newSettings
          })
          break
        case 'ArrowRight':
          e.preventDefault()
          setCropSettings(prev => {
            const newSettings = {
              ...prev,
              [editingCrop]: { ...currentCrop, x: Math.min(100, currentCrop.x + moveAmount) }
            }
            saveCropSettings(newSettings)
            return newSettings
          })
          break
        case 'Escape':
          setEditingCrop(null)
          break
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key)
    }
    
    const handleWheel = (e: WheelEvent) => {
      if (!editingCrop) return
      e.preventDefault()
      
      const currentCrop = cropSettings[editingCrop] || { scale: 1, x: 50, y: 50 }
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.17, Math.min(9, currentCrop.scale * delta))
      
      setCropSettings(prev => {
        const newSettings = {
          ...prev,
          [editingCrop]: { ...currentCrop, scale: newScale }
        }
        saveCropSettings(newSettings)
        return newSettings
      })
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [editingCrop, cropSettings])

  return {
    cropSettings,
    setCropSettings,
    editingCrop,
    setEditingCrop,
    handleCropChange,
    handleScroll,
    saveCropSettings
  }
}