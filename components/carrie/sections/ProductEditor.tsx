'use client'

interface Product {
  id: number
  title: string
  description: string
  features: string[]
  image: string
  price: string
}

interface ProductEditorProps {
  product: Product
  featuredCategory: string
  editingId: number | null
  onEditingIdChange: (id: number | null) => void
  onUpdateProduct: (category: string, productId: number, field: string, value: any) => void
}

export default function ProductEditor({
  product,
  featuredCategory,
  editingId,
  onEditingIdChange,
  onUpdateProduct
}: ProductEditorProps) {
  return (
    <>
      {/* Title */}
      {editingId === product.id ? (
        <input
          type="text"
          value={product.title}
          onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'title', e.target.value)}
          className="text-xl font-black mb-3 tracking-wide w-full p-1 border rounded"
          onBlur={() => onEditingIdChange(null)}
          autoFocus
        />
      ) : (
        <h3 
          className="text-xl font-black mb-1 tracking-wide cursor-pointer hover:bg-yellow-100 p-1 rounded"
          onClick={() => onEditingIdChange(product.id)}
        >
          {product.title}
        </h3>
      )}

      {/* Description */}
      {editingId === -product.id ? (
        <textarea
          value={product.description}
          onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'description', e.target.value)}
          className="text-slate-600 mb-1 font-semibold w-full p-1 border rounded resize-none"
          rows={2}
          onBlur={() => onEditingIdChange(null)}
          autoFocus
        />
      ) : (
        <p 
          className="text-slate-600 mb-1 font-semibold cursor-pointer hover:bg-yellow-100 p-1 rounded"
          onClick={() => onEditingIdChange(-product.id)}
        >
          {product.description}
        </p>
      )}

      {/* Features */}
      {product.features && (
        <ul className="text-sm text-slate-500 space-y-0.5">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  featuredCategory === "new"
                    ? "bg-red-600"
                    : featuredCategory === "battleTested"
                      ? "bg-blue-600"
                      : "bg-green-600"
                }`}
              ></span>
              {editingId === product.id * 1000 + index ? (
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...product.features]
                    newFeatures[index] = e.target.value
                    onUpdateProduct(featuredCategory, product.id, 'features', newFeatures)
                  }}
                  onBlur={() => onEditingIdChange(null)}
                  onKeyPress={(e) => e.key === 'Enter' && onEditingIdChange(null)}
                  className="flex-1 p-1 border rounded text-sm"
                  autoFocus
                />
              ) : (
                <span 
                  className="cursor-pointer hover:bg-yellow-100 p-1 rounded"
                  onClick={() => onEditingIdChange(product.id * 1000 + index)}
                >
                  {feature}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Price */}
      {(product.price || true) && (
        <div className="flex justify-between items-center">
          {editingId === product.id * 10000 ? (
            <input
              type="text"
              value={product.price}
              onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'price', e.target.value)}
              onBlur={() => onEditingIdChange(null)}
              onKeyPress={(e) => e.key === 'Enter' && onEditingIdChange(null)}
              className={`text-2xl font-black p-1 border rounded ${
                featuredCategory === "new"
                  ? "text-red-600"
                  : featuredCategory === "battleTested"
                    ? "text-blue-600"
                    : "text-green-600"
              }`}
              placeholder="e.g., $1,299"
              autoFocus
            />
          ) : (
            <span
              className={`text-2xl font-black cursor-pointer hover:bg-yellow-100 p-1 rounded ${
                featuredCategory === "new"
                  ? "text-red-600"
                  : featuredCategory === "battleTested"
                    ? "text-blue-600"
                    : "text-green-600"
              }`}
              onClick={() => onEditingIdChange(product.id * 10000)}
            >
              {product.price}
            </span>
          )}
        </div>
      )}
    </>
  )
}