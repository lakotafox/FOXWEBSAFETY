'use client'

interface Star3DProps {
  filled?: boolean
  size?: number
  className?: string
}

// CSS 3D Star - lightweight and no reconciler issues
export function Star3DCSS({ 
  filled = true, 
  size = 40,
  className = '' 
}: Star3DProps) {
  const color = filled ? '#FFD700' : '#444444'
  
  return (
    <div 
      className={`star-3d ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        position: 'relative',
        transformStyle: 'preserve-3d',
        animation: 'rotateStar 4s linear infinite'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        style={{
          filter: filled ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' : 'none',
          transform: 'translateZ(2px)'
        }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <style jsx>{`
        @keyframes rotateStar {
          from {
            transform: rotateY(0deg) rotateX(15deg);
          }
          to {
            transform: rotateY(360deg) rotateX(15deg);
          }
        }
        .star-3d:hover {
          animation-duration: 1s;
        }
      `}</style>
    </div>
  )
}

export default Star3DCSS