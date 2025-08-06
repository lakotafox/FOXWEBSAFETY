// Get color classes based on product category
export function getCategoryColor(category: string, type: 'ring' | 'bg' | 'text' = 'text'): string {
  const colorMap = {
    new: { ring: 'ring-red-500', bg: 'bg-red-600', text: 'text-red-600' },
    battleTested: { ring: 'ring-blue-500', bg: 'bg-blue-600', text: 'text-blue-600' },
    seating: { ring: 'ring-green-500', bg: 'bg-green-600', text: 'text-green-600' }
  }
  
  const colors = colorMap[category as keyof typeof colorMap] || colorMap.new
  return colors[type]
}