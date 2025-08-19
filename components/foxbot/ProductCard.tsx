import { Product } from '@/lib/foxbot/product-search'
import { useState } from 'react'
import { Phone, MapPin, MessageSquare, X } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <div 
        className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all cursor-pointer border border-gray-700 hover:border-yellow-500"
        onClick={() => setShowContactModal(true)}
      >
      <div className="aspect-video bg-gray-900 relative overflow-hidden">
        {!imageError && product.image ? (
          <img
            src={product.image.startsWith('/') ? product.image : `/${product.image}`}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-2">🪑</div>
              <div className="text-sm">No image available</div>
            </div>
          </div>
        )}
        {product.category && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold uppercase">
            {product.category.replace('-', ' ')}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-white mb-2">{product.title}</h3>
        
        {product.description && (
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
        )}
        
        {product.features && product.features.length > 0 && (
          <ul className="text-xs text-gray-500 space-y-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        {product.price && (
          <div className="mt-3 text-yellow-500 font-bold">{product.price}</div>
        )}
      </div>
    </div>

    {/* Contact Modal */}
    {showContactModal && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setShowContactModal(false)}
            className="absolute top-4 right-4 text-white hover:text-yellow-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-black text-yellow-500 mb-4">
            CONTACT US TO GET IT!! IDK WHAT TO SAY
          </h2>
          
          <div className="space-y-4">
            <a
              href="tel:+18777693768"
              className="flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 rounded-lg font-bold transition-colors w-full"
            >
              <Phone className="w-5 h-5" />
              <span>CALL (877) 769-3768</span>
            </a>
            
            <a
              href="https://maps.google.com/?q=FOXBUILT+Office+Furniture"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 rounded-lg font-bold transition-colors w-full"
            >
              <MapPin className="w-5 h-5" />
              <span>VISIT SHOWROOM</span>
            </a>
            
            <button
              onClick={() => {
                // Close this modal and try to open the main contact form
                setShowContactModal(false)
                const messageButton = document.querySelector('[data-message-button]') as HTMLElement
                messageButton?.click()
              }}
              className="flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 rounded-lg font-bold transition-colors w-full"
            >
              <MessageSquare className="w-5 h-5" />
              <span>SEND MESSAGE</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}