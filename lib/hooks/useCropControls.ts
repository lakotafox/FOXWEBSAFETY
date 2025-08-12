import { useEffect } from 'react'

interface CropSettings {
  [key: string]: { scale: number; x: number; y: number }
}

interface UseCropControlsProps {
  editingCrop: string | null
  cropSettings: CropSettings
  setCropSettings: React.Dispatch<React.SetStateAction<CropSettings>>
  setEditingCrop: React.Dispatch<React.SetStateAction<string | null>>
}

export function useCropControls({
  editingCrop,
  cropSettings,
  setCropSettings,
  setEditingCrop
}: UseCropControlsProps) {
  useEffect(() => {
    if (!editingCrop) return
    
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    
    // Track currently pressed keys
    const pressedKeys = new Set<string>()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingCrop) return
      
      // Add key to pressed set
      pressedKeys.add(e.key)
      
      // Count how many arrow keys are pressed
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      const pressedArrows = arrowKeys.filter(key => pressedKeys.has(key))
      
      // Only process movement if exactly one arrow key is pressed
      if (pressedArrows.length !== 1) return
      
      const moveAmount = 0.5 // percentage to move per key press - much more precise
      const currentCrop = cropSettings[editingCrop] || { scale: 1, x: 50, y: 50 }
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, y: Math.max(0, currentCrop.y - moveAmount) }
          }))
          break
        case 'ArrowDown':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, y: Math.min(100, currentCrop.y + moveAmount) }
          }))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, x: Math.max(0, currentCrop.x - moveAmount) }
          }))
          break
        case 'ArrowRight':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, x: Math.min(100, currentCrop.x + moveAmount) }
          }))
          break
        case 'Escape':
          setEditingCrop(null)
          break
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Remove key from pressed set
      pressedKeys.delete(e.key)
    }
    
    const handleWheel = (e: WheelEvent) => {
      if (!editingCrop) return
      e.preventDefault()
      
      const currentCrop = cropSettings[editingCrop] || { scale: 1, x: 50, y: 50 }
      const delta = e.deltaY > 0 ? 0.98 : 1.02 // Much slower zoom for fine control
      const newScale = Math.max(0.1, Math.min(10, currentCrop.scale * delta))
      
      setCropSettings(prev => ({
        ...prev,
        [editingCrop]: { ...currentCrop, scale: newScale }
      }))
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      // Restore body scroll
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [editingCrop, cropSettings, setCropSettings, setEditingCrop])
}