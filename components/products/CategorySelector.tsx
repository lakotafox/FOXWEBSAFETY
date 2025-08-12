'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import CategorySlider from '@/components/ui/CategorySlider'

interface CategorySelectorProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onFloatingVisibilityChange: (isVisible: boolean) => void
}

export default function CategorySelector({ 
  selectedCategory, 
  onCategoryChange,
  onFloatingVisibilityChange 
}: CategorySelectorProps) {
  const router = useRouter()
  const categoryButtonsRef = useRef<HTMLDivElement>(null)

  // Handle scroll effects for floating categories
  useEffect(() => {
    const handleScroll = () => {
      // Check if category buttons are out of view
      if (categoryButtonsRef.current) {
        const rect = categoryButtonsRef.current.getBoundingClientRect()
        onFloatingVisibilityChange(rect.bottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [onFloatingVisibilityChange])

  return (
    <>
      <div ref={categoryButtonsRef}>
        <CategorySlider
          categories={[
            { id: 'new', label: 'NEW', color: 'text-white', bgColor: 'bg-red-600' },
            { id: 'battleTested', label: 'PRE-OWNED', color: 'text-white', bgColor: 'bg-blue-600' },
            { id: 'seating', label: 'SEATING', color: 'text-white', bgColor: 'bg-green-600' }
          ]}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          className="mb-2"
        />
      </div>
      
      {/* List View button */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <Button
          onClick={() => {
            router.push('/list-view')
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm md:text-base px-6 py-3 tracking-wider transition-all shadow-lg hover:shadow-xl"
        >
          LIST VIEW
        </Button>
      </div>
    </>
  )
}