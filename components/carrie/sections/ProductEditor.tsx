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
      {/* Title - use card__title class like main page */}
      <h2 className="card__title">
        {editingId === product.id ? (
          <input
            type="text"
            value={product.title}
            onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'title', e.target.value)}
            className="w-full bg-transparent border-b border-white"
            onBlur={() => onEditingIdChange(null)}
            autoFocus
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-yellow-400"
            onClick={() => onEditingIdChange(product.id)}
          >
            {product.title}
          </span>
        )}
      </h2>

      {/* Description - use card__description class like main page */}
      {product.description && (
        <p className="card__description">
          {editingId === -product.id ? (
            <textarea
              value={product.description}
              onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'description', e.target.value)}
              className="w-full bg-transparent border rounded resize-none text-sm"
              rows={2}
              onBlur={() => onEditingIdChange(null)}
              autoFocus
            />
          ) : (
            <span 
              className="cursor-pointer hover:text-yellow-400"
              onClick={() => onEditingIdChange(-product.id)}
            >
              {product.description}
            </span>
          )}
        </p>
      )}

      {/* Features - use card__features class like main page */}
      {product.features && (
        <ul className="card__features">
          {product.features.map((feature, index) => (
            <li key={index}>
              <span style={{
                backgroundColor: featuredCategory === "new"
                  ? "rgb(220, 38, 38)"
                  : featuredCategory === "battleTested"
                    ? "rgb(37, 99, 235)"
                    : "rgb(34, 197, 94)"
              }}></span>
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
                  className="flex-1 bg-transparent border-b border-gray-400 text-sm"
                  autoFocus
                />
              ) : (
                <div 
                  className="cursor-pointer hover:text-yellow-400 flex-1"
                  onClick={() => onEditingIdChange(product.id * 1000 + index)}
                >
                  {feature}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Price - use card__price class and style like main page */}
      {product.price && (
        <div className="card__price" style={{
          color: featuredCategory === "new"
            ? "rgb(220, 38, 38)"
            : featuredCategory === "battleTested"
              ? "rgb(37, 99, 235)"
              : "rgb(34, 197, 94)"
        }}>
          {editingId === product.id * 10000 ? (
            <input
              type="text"
              value={product.price}
              onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'price', e.target.value)}
              onBlur={() => onEditingIdChange(null)}
              onKeyPress={(e) => e.key === 'Enter' && onEditingIdChange(null)}
              className="w-full bg-transparent border-b"
              style={{
                color: featuredCategory === "new"
                  ? "rgb(220, 38, 38)"
                  : featuredCategory === "battleTested"
                    ? "rgb(37, 99, 235)"
                    : "rgb(34, 197, 94)"
              }}
              placeholder="e.g., $1,299"
              autoFocus
            />
          ) : (
            <span
              className="cursor-pointer hover:opacity-70"
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