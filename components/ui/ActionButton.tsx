'use client'

import { Phone, MapPin, Mail } from 'lucide-react'

interface ActionButtonProps {
  icon: 'phone' | 'map' | 'mail'
  size?: 'sm' | 'md' | 'lg'
  onClick: () => void
  className?: string
  ariaLabel?: string
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14', 
  lg: 'w-16 h-16'
}

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

const colorClasses = {
  phone: 'bg-red-600 hover:bg-red-700',
  map: 'bg-blue-600 hover:bg-blue-700',
  mail: 'bg-green-600 hover:bg-green-700'
}

const defaultLabels = {
  phone: 'Call us',
  map: 'View on map',
  mail: 'Send email'
}

export default function ActionButton({ 
  icon, 
  size = 'lg', 
  onClick, 
  className = '',
  ariaLabel
}: ActionButtonProps) {
  const Icon = icon === 'phone' ? Phone : icon === 'map' ? MapPin : Mail
  
  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} ${colorClasses[icon]} text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg ${className}`}
      aria-label={ariaLabel || defaultLabels[icon]}
    >
      <Icon className={iconSizes[size]} />
    </button>
  )
}