'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import { useProductsEditor } from '@/components/products-editor/hooks/useProductsEditor'
import ProductsGrid from '@/components/products-editor/ProductsGrid'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import WelcomeMessage from '@/components/products-editor/ui/WelcomeMessage'
import HelpModal from '@/components/ui/HelpModal'
import YellowHeader from '@/components/products-editor/ui/YellowHeader'
import SaveMessage from '@/components/products-editor/ui/SaveMessage'
import '@/components/ui/MagicBento.css'

function ProductsEditorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category')
  
  // If no category is specified, redirect to the select page
  useEffect(() => {
    if (!categoryParam) {
      router.push('/products-editor/select')
    }
  }, [categoryParam, router])
  const {
    // State
    saveMessage,
    showHelp,
    showPublishLoadingOverlay,
    publishMessage,
    showSuccessScreen,
    showWelcomeMessage,
    showLoadingOverlay,
    productCategory,
    currentProducts,
    editingId,
    editingCrop,
    cropSettings,
    pageName,
    
    // Setters
    setShowHelp,
    setShowWelcomeMessage,
    setShowSuccessScreen,
    setProductCategory,
    setEditingId,
    setEditingCrop,
    setPageName,
    setCropSettings,
    
    // Functions
    handlePublish,
    updateProduct,
    handleImageUpload,
    getImageUrl
  } = useProductsEditor(categoryParam || 'executive-desks')


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
      <LoadingOverlay 
        show={showSuccessScreen} 
        type="success"
        publishMessage="success"
        onPlayGame={() => window.open('/games', '_blank')}
      />
      
      {/* Yellow Header */}
      <YellowHeader 
        onPublish={handlePublish}
      />
      
      {/* Debug button - remove after testing */}
      <button
        onClick={() => {
          console.log('Manual trigger: showing success screen')
          setShowPublishLoadingOverlay(false)
          setShowSuccessScreen(true)
        }}
        className="fixed bottom-4 right-4 z-[200] bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
      >
        TEST SUCCESS SCREEN
      </button>
      
      {/* Save message */}
      <SaveMessage show={!!saveMessage} message={saveMessage} />

      {/* Header */}
      <div className="bg-slate-900 py-8 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <span className="text-5xl font-black text-white tracking-tight">
              {pageName || 'Executive Desks'}
            </span>
            <span className="text-5xl font-black text-red-600 tracking-tight ml-4">EDITOR</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <ProductsGrid
        productCategory={productCategory}
        currentProducts={currentProducts}
        editingId={editingId}
        editingCrop={editingCrop}
        cropSettings={cropSettings}
        setCropSettings={setCropSettings}
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

export default function ProductsEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ProductsEditorContent />
    </Suspense>
  )
}