'use client'

import { useState, useEffect, FormEvent } from 'react'
import VoidModal from '@/components/ui/VoidModal'
import MagicBento, { ParticleCard } from '@/components/ui/MagicBento'
import CroppedImageWithLoader from '@/components/ui/CroppedImageWithLoader'
import { X, Phone, MapPin, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import MapConfirmModal from '@/components/ui/MapConfirmModal'

interface Product {
  id: number
  title: string
  image: string
  description?: string
  features?: string[]
  price?: string
}

interface ProductInfoModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  category: 'new' | 'battleTested' | 'seating'
  cropSettings?: { scale: number; x: number; y: number }
  getImageUrl?: (imagePath: string) => string
}

export default function ProductInfoModal({
  isOpen,
  onClose,
  product,
  category,
  cropSettings,
  getImageUrl = (path) => path
}: ProductInfoModalProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showMapConfirm, setShowMapConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: product ? `I am interested in the ${product.title}` : ''
  })
  
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  if (!product) return null
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    
    try {
      // Load EmailJS dynamically only when needed
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
      document.body.appendChild(script)
      
      script.onload = async () => {
        // @ts-ignore
        const emailjs = window.emailjs
        emailjs.init("wKKzekYUUdTxH10PY")
        
        await emailjs.send(
          'service_8q4uafn',
          'template_8u7ppqb',
          {
            from_name: formData.name || 'Anonymous',
            from_email: formData.contact || 'No contact provided',
            message: formData.message || 'No message provided',
            to_name: 'FoxBuilt',
          }
        )
        
        setSubmitStatus('success')
        setFormData({ name: '', contact: '', message: '' })
        
        // Show success message and close form after delay
        setTimeout(() => {
          setShowContactForm(false)
          setSubmitStatus('idle')
        }, 2000)
        
        // Clean up script
        document.body.removeChild(script)
      }
      
      script.onerror = () => {
        console.error('Failed to load EmailJS')
        setSubmitStatus('error')
        setTimeout(() => setSubmitStatus('idle'), 3000)
        setIsSubmitting(false)
        document.body.removeChild(script)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
      setIsSubmitting(false)
    }
  }
  
  // All cards now use purple glow
  const getGlowColor = () => {
    return '147, 51, 234' // purple-600
  }
  
  // All cards now use purple ring with thicker border
  const getRingClass = () => {
    return 'ring-4 ring-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.6)]'
  }
  
  return (
    <>
    {/* Modals at top level - always rendered when state is true */}
    {showMapConfirm && (
      <div style={{ position: 'relative', zIndex: 999999 }}>
        <MapConfirmModal 
          isOpen={true}
          onClose={() => setShowMapConfirm(false)}
          onConfirm={() => {}}
        />
      </div>
    )}
    
    {showContactForm && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
        <div className="bg-slate-800 rounded-lg w-full max-w-md relative">
          <button
            onClick={() => setShowContactForm(false)}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            aria-label="Close contact form"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="p-6 pt-12">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="NAME"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                disabled={isSubmitting}
              />
              
              <input
                type="text"
                placeholder="EMAIL / PHONE"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                disabled={isSubmitting}
              />
              
              <textarea
                placeholder="TELL US WHAT YOU NEED"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                disabled={isSubmitting}
              />
              
              <button
                type="submit"
                className={`w-full font-bold py-3 rounded-lg transition-colors ${
                  submitStatus === 'success' 
                    ? 'bg-green-600 text-white' 
                    : submitStatus === 'error'
                    ? 'bg-red-800 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SENDING...' : 
                 submitStatus === 'success' ? 'MESSAGE SENT!' :
                 submitStatus === 'error' ? 'FAILED - TRY AGAIN' :
                 'SEND A MESSAGE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )}
    
    <VoidModal
      isOpen={isOpen}
      onClose={onClose}
      className={`${isMobile ? 'h-screen flex items-center justify-center max-w-md' : 'max-w-5xl'} w-full bg-slate-800 ${isMobile ? '' : 'rounded-lg'} relative ${isMobile ? 'overflow-auto' : 'overflow-visible'}`}
      backdropClassName='bg-slate-800'
      closeOnEscape={true}
      closeOnBackdrop={false}
      showParticles={false}
      zIndex={1000}
    >
      {/* Mobile Header - matches products page style */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-[90] bg-slate-900 border-b-4 border-red-600 shadow-xl py-1.5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <button 
                onClick={() => window.location.href = '/'}
                className="scale-100 select-none"
              >
                <Image
                  src="/images/foxbuilt-logo.png"
                  alt="FoxBuilt Logo"
                  width={120}
                  height={45}
                  className="h-auto select-none pointer-events-none"
                  draggable={false}
                />
              </button>

              {/* Empty center (no title) */}
              <div />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = 'tel:+18018999406'}
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
                  aria-label="Call us"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMapConfirm(true)}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center"
                  aria-label="View on map"
                >
                  <MapPin className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      message: `I am interested in the ${product?.title || 'product'}`
                    })
                    setShowContactForm(true)
                  }}
                  className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center"
                  aria-label="Send message"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Back to Images button with locked position */}
      {isMobile && !showContactForm && (
        <button
          onClick={onClose}
          className="fixed bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-bold shadow-lg border-2 border-red-600"
          style={{ 
            position: 'fixed',
            top: '80px', 
            right: '20px', 
            zIndex: 99999,
            backgroundColor: 'rgb(147, 51, 234)'
          }}
          aria-label="Back to images"
        >
          BACK TO IMAGES
        </button>
      )}
      
      {/* Single product card with MagicBento wrapper */}
      {isMobile ? (
        <div className="pt-20 pb-4 px-4 relative z-[100]">
          <MagicBento
                textAutoHide={false}
                enableStars={true}
                enableSpotlight={false} // No spotlight in modal
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={false}
                clickEffect={true}
                spotlightRadius={250}
                particleCount={30}
                glowColor={getGlowColor()}
                disableAnimations={false}
              >
                <ParticleCard
              className={`card featured-card card--border-glow ${getRingClass()}`}
              style={{
                backgroundColor: '#060010',
                '--glow-color': getGlowColor(),
                width: '100%',
                maxWidth: '350px',
                margin: '0 auto'
              } as React.CSSProperties}
              particleCount={30}
              glowColor={getGlowColor()}
              enableTilt={true}
              clickEffect={true}
              enableMagnetism={false}
              disableAnimations={false}
              alwaysShowParticles={true}
            >
              <div 
                className="card__image relative select-none" 
                style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none', userSelect: 'none', touchAction: 'manipulation' }}
                onPointerDown={(e) => {
                  // Start timer for press and hold
                  const target = e.currentTarget
                  const timer = window.setTimeout(() => {
                    onClose() // Return to carousel after hold
                  }, 400) // 400ms hold time
                  
                  // Store timer ID to clear on release
                  target.dataset.pressTimer = timer.toString()
                }}
                onPointerUp={(e) => {
                  // Clear timer on release
                  const timer = e.currentTarget.dataset.pressTimer
                  if (timer) {
                    clearTimeout(parseInt(timer))
                    delete e.currentTarget.dataset.pressTimer
                  }
                }}
                onPointerCancel={(e) => {
                  // Clear timer if cancelled
                  const timer = e.currentTarget.dataset.pressTimer
                  if (timer) {
                    clearTimeout(parseInt(timer))
                    delete e.currentTarget.dataset.pressTimer
                  }
                }}
                onClick={() => {
                  // Handle regular tap
                  onClose() // Return to carousel on tap
                }}
              >
                <CroppedImageWithLoader 
                  src={getImageUrl(product.image)} 
                  alt={product.title} 
                  crop={cropSettings || { scale: 1, x: 50, y: 50 }}
                  width={500}
                  height={500}
                  className="w-full h-full object-contain select-none pointer-events-none"
                  style={{ WebkitUserDrag: 'none', userDrag: 'none', touchAction: 'none' }}
                  draggable={false}
                  unoptimized
                />
              </div>
              
              <div className="card__content">
                <h2 className="card__title">{product.title}</h2>
                {product.description && (
                  <p className="card__description">{product.description}</p>
                )}
                {product.features && (
                  <ul className="card__features">
                    {product.features.map((feature, idx) => (
                      <li key={idx}>
                        <span style={{
                          backgroundColor: "rgb(147, 51, 234)" // purple-600
                        }}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {product.price && (
                  <div className="card__price" style={{
                    color: category === "new"
                      ? "rgb(220, 38, 38)"
                      : category === "battleTested"
                        ? "rgb(37, 99, 235)"
                        : "rgb(34, 197, 94)"
                  }}>
                    {product.price}
                  </div>
                )}
              </div>
                </ParticleCard>
              </MagicBento>
        </div>
      ) : (
        // Desktop: Larger centered card with purple theme - no container
        <>
          {/* Floating Action Buttons - Top Right for Desktop (larger size) */}
          <div style={{ 
            position: 'fixed', 
            top: '32px', 
            right: '32px', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px', 
            zIndex: 10000 
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => window.location.href = 'tel:+18018999406'}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                aria-label="Call us"
              >
                <Phone className="w-7 h-7" />
              </button>
              <button
                onClick={() => setShowMapConfirm(true)}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                aria-label="View on map"
              >
                <MapPin className="w-7 h-7" />
              </button>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    message: `I am interested in the ${product?.title || 'product'}`
                  })
                  setShowContactForm(true)
                }}
                className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                aria-label="Send message"
              >
                <MessageCircle className="w-7 h-7" />
              </button>
            </div>
            {/* Yellow rectangular Return to Images button */}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-xl text-sm tracking-wider"
              aria-label="Return to images"
            >
              RETURN TO IMAGES
            </button>
          </div>
          
          {/* Animated background for desktop */}
          <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
            {/* Animated gradient background */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
              animation: 'voidPulse 8s ease-in-out infinite'
            }} />
            
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-purple-500/20"
                style={{
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `floatParticle ${15 + Math.random() * 20}s linear infinite`,
                  animationDelay: `${Math.random() * 10}s`
                }}
              />
            ))}
          </div>
          
          {/* Add CSS animations */}
          <style jsx>{`
            @keyframes voidPulse {
              0%, 100% { opacity: 0.5; transform: scale(1) rotate(0deg); }
              50% { opacity: 0.8; transform: scale(1.1) rotate(180deg); }
            }
            
            @keyframes floatParticle {
              0% { transform: translateY(100vh) translateX(0); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
            }
          `}</style>
          
          <div className="flex items-center justify-center" style={{ 
            zIndex: 100, 
            minHeight: '90vh',
            padding: '2rem 0',
            position: 'relative'
          }}>
            <MagicBento
              textAutoHide={false}
              enableStars={true}
              enableSpotlight={true}  // Enable spotlight for hover glow
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={60}  // 60% smaller radius for scaled card (150 * 0.4 = 60)
              particleCount={30}
              glowColor={getGlowColor()}
              disableAnimations={false}
            >
              <ParticleCard
                className={`card featured-card card--border-glow ${getRingClass()}`}
                style={{
                  backgroundColor: '#060010',
                  '--glow-color': getGlowColor(),
                  width: '100%',
                  maxWidth: '500px',
                  transform: 'scale(1.4)',
                  transformOrigin: 'center',
                  position: 'relative',
                  zIndex: 100
                } as React.CSSProperties}
                particleCount={30}
                glowColor={getGlowColor()}
                enableTilt={true}
                clickEffect={true}
                enableMagnetism={false}
                disableAnimations={false}
                alwaysShowParticles={true}
              >
                <div className="card__image relative">
                  <CroppedImageWithLoader 
                    src={getImageUrl(product.image)} 
                    alt={product.title} 
                    crop={cropSettings || { scale: 1, x: 50, y: 50 }}
                    width={700}
                    height={700}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                
                <div className="card__content">
                  <h2 className="card__title text-xl">{product.title}</h2>
                  {product.description && (
                    <p className="card__description text-base">{product.description}</p>
                  )}
                  {product.features && (
                    <ul className="card__features">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="text-base">
                          <span style={{
                            backgroundColor: "rgb(147, 51, 234)" // purple-600
                          }}></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  {product.price && (
                    <div className="card__price text-xl" style={{
                      color: category === "new"
                        ? "rgb(220, 38, 38)"
                        : category === "battleTested"
                          ? "rgb(37, 99, 235)"
                          : "rgb(34, 197, 94)"
                    }}>
                      {product.price}
                    </div>
                  )}
                </div>
              </ParticleCard>
            </MagicBento>
          </div>
        </>
      )}
    </VoidModal>
    </>
  )
}