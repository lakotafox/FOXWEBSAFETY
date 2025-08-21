'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getCategoryNames } from '@/lib/category-names'
import CloudinarySettings from '@/components/products-editor/ui/CloudinarySettings'

const defaultCategories = [
  // Desks & Workstations
  { id: 'executive-desks', name: 'Executive Desks', group: 'Desks & Workstations' },
  { id: 'computer-desks', name: 'Computer Desks', group: 'Desks & Workstations' },
  { id: 'standing-desks', name: 'Standing Desks', group: 'Desks & Workstations' },
  { id: 'modular-benching', name: 'Modular Benching Systems', group: 'Desks & Workstations' },
  
  // Cubicles
  { id: 'cubicle-workstations', name: 'Cubicle Workstations', group: 'Cubicles' },
  { id: 'panel-systems', name: 'Panel Systems', group: 'Cubicles' },
  { id: 'modular-cubicles', name: 'Modular Cubicles', group: 'Cubicles' },
  { id: 'privacy-screens', name: 'Privacy Screens', group: 'Cubicles' },
  
  // Seating
  { id: 'task-chairs', name: 'Task Chairs', group: 'Seating' },
  { id: 'executive-chairs', name: 'Executive Chairs', group: 'Seating' },
  { id: 'conference-chairs', name: 'Conference Chairs', group: 'Seating' },
  { id: 'drafting-stools', name: 'Drafting Stools', group: 'Seating' },
  { id: 'ergonomic-seating', name: 'Ergonomic Seating', group: 'Seating' },
  
  // Storage
  { id: 'filing-cabinets', name: 'Filing Cabinets', group: 'Storage' },
  { id: 'shelving-units', name: 'Shelving Units', group: 'Storage' },
  { id: 'bookcases', name: 'Bookcases', group: 'Storage' },
  { id: 'lockers', name: 'Lockers', group: 'Storage' },
  { id: 'credenzas', name: 'Credenzas', group: 'Storage' },
  
  // Conference & Meeting
  { id: 'conference-tables', name: 'Conference Tables', group: 'Conference & Meeting' },
  { id: 'meeting-chairs', name: 'Meeting Room Chairs', group: 'Conference & Meeting' },
  { id: 'collaborative-tables', name: 'Collaborative Tables', group: 'Conference & Meeting' },
  { id: 'av-carts', name: 'AV Carts', group: 'Conference & Meeting' },
  
  // Reception & Lounge
  { id: 'reception-desks', name: 'Reception Desks', group: 'Reception & Lounge' },
  { id: 'sofas', name: 'Sofas', group: 'Reception & Lounge' },
  { id: 'lounge-chairs', name: 'Lounge Chairs', group: 'Reception & Lounge' },
  { id: 'coffee-tables', name: 'Coffee Tables', group: 'Reception & Lounge' },
  { id: 'side-tables', name: 'Side Tables', group: 'Reception & Lounge' },
]

export default function ProductsEditorSelect() {
  const router = useRouter()
  const [categories, setCategories] = useState(defaultCategories)
  const [categoryNames, setCategoryNames] = useState<any>(null)
  
  useEffect(() => {
    // Load category names
    const loadCategoryNames = async () => {
      const names = await getCategoryNames()
      setCategoryNames(names)
      
      // Update categories with custom names but keep original groups
      setCategories(defaultCategories.map(cat => ({
        ...cat,
        name: names.subcategories?.[cat.id] || cat.name,
        // Keep the original group structure
        group: cat.group
      })))
    }
    loadCategoryNames()
  }, [])
  
  // Group categories by their group
  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.group]) {
      acc[cat.group] = []
    }
    acc[cat.group].push(cat)
    return acc
  }, {} as Record<string, typeof categories>)

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <div className="bg-slate-900 py-8 border-b-4 border-red-600">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white tracking-tight">
              SELECT CATEGORY TO 
              <span className="text-red-600 ml-4">EDIT</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Editor Settings Button */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/products-editor/visibility')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-lg px-8 py-4 rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            MANAGE NAMES AND VISIBILITY
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="container mx-auto px-4 pb-12">
        {Object.entries(groupedCategories).map(([group, items]) => (
          <div key={group} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-red-600 pb-2">
              {group}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((category) => (
                <button
                  key={category.id}
                  onClick={() => router.push(`/products-editor?category=${category.id}`)}
                  className="bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-red-600 rounded-lg p-6 text-left transition-all hover:scale-105 group"
                >
                  <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">
                    Click to edit products
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Back to Home Button */}
      <div className="fixed bottom-8 left-8">
        <button
          onClick={() => router.push('/')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          ← Back to Home
        </button>
      </div>
      
      {/* Cloudinary Settings - Center of page */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <CloudinarySettings />
      </div>
    </div>
  )
}