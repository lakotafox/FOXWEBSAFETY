'use client'

import Image from 'next/image'
import { useProductsEditor } from '@/components/products-editor/hooks/useProductsEditor'
import ProductsGrid from '@/components/products-editor/ProductsGrid'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import WelcomeMessage from '@/components/products-editor/ui/WelcomeMessage'
import HelpModal from '@/components/ui/HelpModal'
import YellowHeader from '@/components/products-editor/ui/YellowHeader'
import SaveMessage from '@/components/products-editor/ui/SaveMessage'
import '@/components/ui/MagicBento.css'

export default function ProductsEditorPage() {
  const {
    // State
    saveMessage,
    showHelp,
    showPublishLoadingOverlay,
    publishMessage,
    showWelcomeMessage,
    showLoadingOverlay,
    productCategory,
    currentProducts,
    editingId,
    editingCrop,
    cropSettings,
    
    // Setters
    setShowHelp,
    setShowWelcomeMessage,
    setProductCategory,
    setEditingId,
    setEditingCrop,
    
    // Functions
    handlePublish,
    updateProduct,
    handleImageUpload,
    getImageUrl
  } = useProductsEditor()


  return (
    <div className="min-h-screen bg-slate-800 relative">
      {/* Loading Overlays */}
      <LoadingOverlay 
        show={showLoadingOverlay} 
        type="upload" 
      />
      <LoadingOverlay 
        show={showPublishLoadingOverlay} 
        type="publish" 
        publishMessage={publishMessage}
        onPlayGame={() => window.open('/games', '_blank')}
      />
      
      {/* Yellow Header */}
      <YellowHeader 
        onPublish={handlePublish}
      />
      
      {/* Save message */}
      <SaveMessage show={!!saveMessage} message={saveMessage} />

      {/* Header */}
      <div className="bg-slate-900 py-8 pt-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black text-center text-white tracking-tight">
            PRODUCTS <span className="text-red-600">EDITOR</span>
          </h1>
        </div>
      </div>

      {/* Products Grid */}
      <ProductsGrid
        productCategory={productCategory}
        currentProducts={currentProducts}
        editingId={editingId}
        editingCrop={editingCrop}
        cropSettings={cropSettings}
        setProductCategory={setProductCategory}
        setEditingId={setEditingId}
        setEditingCrop={setEditingCrop}
        updateProduct={updateProduct}
        handleImageUpload={handleImageUpload}
        getImageUrl={getImageUrl}
      />

      {/* Welcome Message Modal */}
      <WelcomeMessage 
        show={showWelcomeMessage}
        onClose={() => setShowWelcomeMessage(false)}
      />

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed top-8 left-8 w-16 h-16 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
        style={{ position: 'fixed' }}
      >
        <Image
          src="/icons/questionmark.png"
          alt="Help"
          width={64}
          height={64}
          className="drop-shadow-lg hover:drop-shadow-xl transition-all"
        />
      </button>

      {/* Help Modal */}
      <HelpModal 
        show={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  )
}