'use client'

import { Button } from '@/components/ui/button'

interface CategoryButtonsProps {
  productCategory: 'new' | 'battleTested' | 'seating'
  onCategoryChange: (category: string) => void
}

export default function CategoryButtons({ productCategory, onCategoryChange }: CategoryButtonsProps) {
  return (
    <>
      <Button
        className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
          productCategory === "new"
            ? "bg-red-600 text-white border-2 border-red-600"
            : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
        }`}
        onClick={() => onCategoryChange("new")}
      >
        NEW
      </Button>
      <Button
        className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
          productCategory === "battleTested"
            ? "bg-blue-600 text-white border-2 border-blue-600"
            : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
        }`}
        onClick={() => onCategoryChange("battleTested")}
      >
        PRE-OWNED
      </Button>
      <Button
        className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
          productCategory === "seating"
            ? "bg-green-600 text-white border-2 border-green-600"
            : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
        }`}
        onClick={() => onCategoryChange("seating")}
      >
        SEATING
      </Button>
    </>
  )
}