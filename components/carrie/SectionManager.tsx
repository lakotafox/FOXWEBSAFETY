"use client"

import React from 'react'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useEditorContext } from './providers/EditorProvider'

// Import all the section components
import HeroSection from '@/components/carrie/sections/HeroSection'
// Gallery section removed - no longer on public page
import FeaturedProducts from '@/components/carrie/sections/FeaturedProducts'

export default function SectionManager() {
  const {
    isScrolled,
    isEditMode,
    currentSlide,
    featuredCategory,
    featuredProducts,
    editingId,
    cropSettings,
    editingCrop,
    pendingGalleryImages,
    pendingMobileGalleryImages,
    galleryViewMode,
    showAddress,
    setShowAddress,
    setFeaturedCategory,
    setEditingId,
    updateProduct,
    handleImageUpload,
    setEditingCrop,
    getImageUrl,
    nextSlide,
    prevSlide,
    setCurrentSlide,
    setIsGalleryUserControlled,
    setShowGalleryEditor
  } = useEditorContext()

  return (
    <div>
      {/* Header - Hidden in admin mode */}
      {!isEditMode && (
        <header
          className={`fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-4 border-red-600 shadow-xl transition-all duration-500 ${
            isScrolled ? "py-0.25" : "py-1.5"
          }`}
        >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className={`transition-all duration-500 ${isScrolled ? "scale-50" : "scale-100"}`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/images/foxbuilt-logo.png"
                  alt="FoxBuilt Logo"
                  width={isScrolled ? 80 : 160}
                  height={isScrolled ? 30 : 60}
                  className="h-auto transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* Centered FOXBUILT OFFICE FURNITURE text - Desktop only */}
          <h1 className="hidden md:block text-2xl font-black text-white tracking-tight absolute left-1/2 transform -translate-x-1/2">
            FOXBUILT <span className="text-red-600">OFFICE</span> <span className="text-blue-400">FURNITURE</span>
          </h1>

          <div className="flex items-center space-x-4">
            <Button
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide border-2 border-blue-600 hover:border-blue-700 transition-all duration-500 ${
                isScrolled ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"
              }`}
              onClick={() => window.open('/catolog no page one.pdf', '_blank')}
            >
              <FileText className={`${isScrolled ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
              CATALOG
            </Button>

            <Button
              className={`bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide border-2 border-red-600 hover:border-red-700 transition-all duration-500 ${
                isScrolled ? "px-3 py-1 text-sm" : "px-6 py-2"
              }`}
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              GET QUOTE
            </Button>
          </div>
        </div>
      </header>
      )}

      <HeroSection isEditMode={isEditMode} />

      {/* Gallery Section removed - no longer on public page */}

      {/* Featured Products Section - EDITABLE */}
      <FeaturedProducts
        isEditMode={isEditMode}
        featuredCategory={featuredCategory}
        featuredProducts={featuredProducts}
        editingId={editingId}
        cropSettings={cropSettings}
        editingCrop={editingCrop}
        onCategorySelect={setFeaturedCategory}
        onEditingIdChange={setEditingId}
        onUpdateProduct={updateProduct}
        onImageUpload={handleImageUpload}
        onSetEditingCrop={setEditingCrop}
        getImageUrl={getImageUrl}
      />
    </div>
  )
}