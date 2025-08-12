'use client'

import { Button } from '@/components/ui/button'

interface FloatingCategoryButtonsProps {
  showFloatingCategories: boolean
  productCategory: string
  onCategoryChange: (category: string) => void
}

export default function FloatingCategoryButtons({ 
  showFloatingCategories, 
  productCategory, 
  onCategoryChange 
}: FloatingCategoryButtonsProps) {
  if (!showFloatingCategories) {
    return null
  }

  return (
    <div className="hidden md:flex fixed top-1/2 right-2 -translate-y-1/2 flex-col gap-4 z-50">
      <Button
        className={`font-black text-sm px-3 py-3 tracking-wide transition-all shadow-lg ${
          productCategory === "new"
            ? "bg-red-600 text-white border-2 border-red-600"
            : "bg-slate-700 text-zinc-300 hover:text-white border-2 border-slate-600 hover:bg-slate-600"
        }`}
        onClick={() => onCategoryChange("new")}
      >
        NEW
      </Button>
      <Button
        className={`font-black text-sm px-3 py-3 tracking-wide transition-all shadow-lg ${
          productCategory === "battleTested"
            ? "bg-blue-600 text-white border-2 border-blue-600"
            : "bg-slate-700 text-zinc-300 hover:text-white border-2 border-slate-600 hover:bg-slate-600"
        }`}
        onClick={() => onCategoryChange("battleTested")}
      >
        PRE OWN
      </Button>
      <Button
        className={`font-black text-sm px-3 py-3 tracking-wide transition-all shadow-lg ${
          productCategory === "seating"
            ? "bg-green-600 text-white border-2 border-green-600"
            : "bg-slate-700 text-zinc-300 hover:text-white border-2 border-slate-600 hover:bg-slate-600"
        }`}
        onClick={() => onCategoryChange("seating")}
      >
        SEAT
      </Button>
    </div>
  )
}