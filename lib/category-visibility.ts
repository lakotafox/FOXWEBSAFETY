// Helper functions for category visibility

export async function getCategoryVisibility() {
  try {
    // Try to fetch from published file
    const response = await fetch('/category-visibility.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      
      // Handle new format that includes categoryNames
      if (data.categoryNames) {
        // Extract just the visibility settings
        const { categoryNames, lastUpdated, ...visibilitySettings } = data
        return visibilitySettings
      }
      
      // Old format - return as is
      return data
    }
  } catch (e) {
    console.log('No visibility settings found, using defaults')
  }
  
  // Default: all categories visible
  return {
    'executive-desks': true,
    'computer-desks': true,
    'standing-desks': true,
    'modular-benching': true,
    'cubicle-workstations': true,
    'panel-systems': true,
    'modular-cubicles': true,
    'privacy-screens': true,
    'task-chairs': true,
    'executive-chairs': true,
    'conference-chairs': true,
    'drafting-stools': true,
    'ergonomic-seating': true,
    'filing-cabinets': true,
    'shelving-units': true,
    'bookcases': true,
    'lockers': true,
    'credenzas': true,
    'conference-tables': true,
    'meeting-chairs': true,
    'collaborative-tables': true,
    'av-carts': true,
    'reception-desks': true,
    'sofas': true,
    'lounge-chairs': true,
    'coffee-tables': true,
    'side-tables': true
  }
}

export function filterCategoriesByVisibility(categories: any[], visibility: any) {
  return categories.filter(cat => visibility[cat.id] !== false)
}