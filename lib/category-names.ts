// Helper functions for category names

export async function getCategoryNames() {
  try {
    // Try to fetch from published file
    const response = await fetch('/category-names.json', { cache: 'no-store' })
    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    console.log('No custom category names found, using defaults')
  }
  
  // Default category names
  return {
    groups: {
      'desks-workstations': 'Desks & Workstations',
      'cubicles': 'Cubicles',
      'seating': 'Seating',
      'storage': 'Storage',
      'conference-meeting': 'Conference & Meeting',
      'reception-lounge': 'Reception & Lounge'
    },
    subcategories: {
      'executive-desks': 'Executive Desks',
      'computer-desks': 'Computer Desks',
      'standing-desks': 'Standing Desks',
      'modular-benching': 'Modular Benching Systems',
      'cubicle-workstations': 'Cubicle Workstations',
      'panel-systems': 'Panel Systems',
      'modular-cubicles': 'Modular Cubicles',
      'privacy-screens': 'Privacy Screens',
      'task-chairs': 'Task Chairs',
      'executive-chairs': 'Executive Chairs',
      'conference-chairs': 'Conference Chairs',
      'drafting-stools': 'Drafting Stools',
      'ergonomic-seating': 'Ergonomic Seating',
      'filing-cabinets': 'Filing Cabinets',
      'shelving-units': 'Shelving Units',
      'bookcases': 'Bookcases',
      'lockers': 'Lockers',
      'credenzas': 'Credenzas',
      'conference-tables': 'Conference Tables',
      'meeting-chairs': 'Meeting Room Chairs',
      'collaborative-tables': 'Collaborative Tables',
      'av-carts': 'AV Carts',
      'reception-desks': 'Reception Desks',
      'sofas': 'Sofas',
      'lounge-chairs': 'Lounge Chairs',
      'coffee-tables': 'Coffee Tables',
      'side-tables': 'Side Tables'
    }
  }
}