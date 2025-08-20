'use client'

import { useState, useEffect } from 'react'
import { defaultProductsPageItems, getProductsPageItems as getProductsData, saveProductsPageItems as saveProductsData } from '@/lib/products-page-data'

// Helper functions to get/save products page items
async function getProductsPageItems() {
  // First try to fetch from the published products.json file
  try {
    const response = await fetch('/products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        return data.products
      }
    }
  } catch (e) {
    console.log('No published products file, using defaults')
  }
  
  // Use the library function which handles localStorage
  return getProductsData()
}

function saveProductsPageItems(products: any) {
  saveProductsData(products)
}

export function useProductsData(categoryId?: string) {
  const [products, setProducts] = useState<any>({})
  // Convert kebab-case to camelCase for consistency with products.json
  const categoryKey = categoryId ? categoryId.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : 'executiveDesks'
  const [productCategory, setProductCategory] = useState(categoryKey)
  const [pageName, setPageName] = useState('')

  // Load products and page name on mount
  useEffect(() => {
    const loadProducts = async () => {
      if (!categoryId) return
      
      // Try to load category-specific products
      try {
        const response = await fetch(`/products-${categoryId}.json`, { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || {})
          if (data.pageName) {
            setPageName(data.pageName)
          }
          return
        }
      } catch (e) {
        console.log(`No products file for ${categoryId}, creating default`)
      }
      
      // Create default structure for new category - use kebab-case key with real images
      const defaultImages = [
        '/images/showroom-1.jpg',
        '/images/tanconf.jpg',
        '/images/reception tan.jpg',
        '/images/small desk.jpg',
        '/images/showfacinggarage.jpg',
        '/images/Showroomwglassboard.jpg',
        '/images/conference-room.jpg',
        '/images/desk grey L showroom.jpg',
        '/images/reception-area.jpg'
      ]
      
      // Category display names
      const categoryNames: Record<string, string> = {
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
      
      // Generate better default names based on category
      const getDefaultTitle = (category: string, index: number) => {
        const titles: Record<string, string[]> = {
          'executive-desks': [
            'Herman Miller Eames Executive',
            'Steelcase Elective Series',
            'Haworth Masters Collection',
            'Knoll Reff Executive Desk',
            'HON Park Avenue Suite',
            'Teknion Expansion Cityline',
            'Global Princeton Executive',
            'Humanscale Float Executive',
            'West Elm Industrial Executive'
          ],
          'computer-desks': [
            'UPLIFT V2 Standing Desk',
            'Flexispot E7 Pro',
            'Branch Ergonomic Desk',
            'Fully Jarvis Bamboo',
            'IKEA BEKANT Series',
            'Bush Business Studio C',
            'Sauder Harbor View Corner',
            'Walker Edison Modern L-Shaped',
            'Tribesigns Industrial Computer'
          ],
          'standing-desks': [
            'Varidesk ProPlus 36',
            'Vari Electric Standing Desk',
            'ApexDesk Elite Series',
            'iMovR Lander Desk',
            'NewHeights Elegante XT',
            'MultiTable ModTable',
            'Xdesk Terra Standing',
            'GeekDesk Max Frame',
            'Evodesk Gaming Standing'
          ],
          'modular-benching': [
            'Steelcase Migration SE',
            'Herman Miller Layout Studio',
            'Haworth Compose Beam',
            'Knoll Antenna Workspaces',
            'HON Coordinate Benching',
            'Teknion Navigate Bench',
            'Global Bridges II',
            'AIS Matrix Benching',
            'Allsteel Stride Benching'
          ],
          'cubicle-workstations': [
            'Herman Miller Action Office',
            'Steelcase Answer Workstation', 
            'Haworth Compose Cubicle',
            'Knoll Dividends Horizon',
            'HON Abound Workstation',
            'Allsteel Terrace DNA',
            'Teknion District Workstation',
            'Global Evolve Panel System',
            'AIS Divi Modular Cubicle'
          ],
          'panel-systems': [
            'Herman Miller Canvas Office',
            'Steelcase Series 9000',
            'Haworth Unigroup Too',
            'Knoll Reff Profiles',
            'HON Initiate Panel System',
            'Teknion Optos Glass Walls',
            'Global Boulevard Panels',
            'AIS Matrix Panel System',
            'Allsteel Beyond Walls'
          ],
          'modular-cubicles': [
            'Herman Miller Resolve System',
            'Steelcase Montage Workstation',
            'Haworth Zody Cubicle',
            'Knoll AutoStrada',
            'HON Accelerate Modular',
            'Teknion Transit System',
            'Global Evolve Modular',
            'AIS Oxygen Workstation',
            'Allsteel Consensus Cubicle'
          ],
          'privacy-screens': [
            'BuzziScreen Acoustic Divider',
            'Steelcase Flex Screen',
            'UPLIFT Acoustic Screen',
            'Gubi Dedal Screen',
            'Vitra Joyn Privacy',
            'Knoll Rockwell Screen',
            'Herman Miller Pari Screen',
            'Haworth BuzziBlinds',
            'Teknion DNA Screen'
          ],
          'task-chairs': [
            'Herman Miller Aeron',
            'Steelcase Leap V2',
            'Haworth Zody Task',
            'Knoll ReGeneration',
            'HON Ignition 2.0',
            'Humanscale Freedom',
            'Global Obusforme Comfort',
            'Allsteel Acuity Chair',
            'Branch Ergonomic Chair'
          ],
          'executive-chairs': [
            'Herman Miller Embody',
            'Steelcase Gesture Executive',
            'Haworth Fern Executive',
            'Knoll Pollock Executive',
            'HON Validate Executive',
            'Humanscale Niels Diffrient',
            'Global Arturo Executive',
            'La-Z-Boy Delano',
            'Serta Big & Tall Executive'
          ],
          'conference-chairs': [
            'Herman Miller Sayl Meeting',
            'Steelcase Node Chair',
            'Haworth Very Conference',
            'Knoll MultiGeneration',
            'HON Motivate Conference',
            'Humanscale Trea Meeting',
            'Global Sidero Conference',
            'Allsteel Clarity Conference',
            'KI Strive Meeting Chair'
          ],
          'drafting-stools': [
            'Herman Miller Caper Stool',
            'Steelcase Turnstone Buoy',
            'Haworth Zody Drafting',
            'Knoll Toboggan Pull-Up',
            'HON Perch Stool',
            'Humanscale Pony Saddle',
            'Global Duet Drafting',
            'Safco Vue Extended',
            'Boss Office LeatherPlus'
          ],
          'ergonomic-seating': [
            'Herman Miller Cosm',
            'Steelcase Amia Air',
            'Haworth Lively Task',
            'Knoll Newson Task',
            'HON Convergence Ergo',
            'Humanscale World One',
            'BodyBilt Aircelli',
            'Neutral Posture Icon',
            'ErgoChair Pro Plus'
          ],
          'filing-cabinets': [
            'HON Brigade 600 Series',
            'Steelcase Universal File',
            'Global 9300 Series',
            'FireKing Fireproof File',
            'Lorell Commercial Grade',
            'Bush Business 400 Series',
            'Alera Valencia Series',
            'Space Solutions Premium',
            'Realspace PRO Steel'
          ],
          'shelving-units': [
            'Metro Wire Shelving',
            'Tennsco Industrial Steel',
            'Safco Archival Shelving',
            'Alera Wire Shelving',
            'Lorell Industrial Wire',
            'HON Metal Bookcase',
            'Mayline Aberdeen Series',
            'Global Genoa Shelving',
            'Hirsh Industries Space'
          ],
          'bookcases': [
            'Steelcase Currency Bookcase',
            'HON 10700 Series',
            'Bush Business Furniture',
            'Sauder Heritage Hill',
            'Martin Furniture Toulouse',
            'Realspace Magellan Collection',
            'Lorell Essentials Bookcase',
            'Alera Valencia Bookcase',
            'Global Genoa Bookcase'
          ],
          'lockers': [
            'Penco Guardian Lockers',
            'Lyon Workspace Lockers',
            'Hallowell Premium Lockers',
            'Salsbury Industries Metal',
            'Tennsco Steel Lockers',
            'List Industries Lockers',
            'Republic Storage Systems',
            'ASI Storage Solutions',
            'Jorgenson Industrial Lockers'
          ],
          'credenzas': [
            'Herman Miller Thrive Credenza',
            'Steelcase Elective Credenza',
            'Haworth Masters Storage',
            'Knoll Florence Credenza',
            'HON 10500 Series',
            'Global Genoa Credenza',
            'Mayline Medina Credenza',
            'Bush Business Credenza',
            'Sauder Affirm Collection'
          ],
          'conference-tables': [
            'Herman Miller Eames Table',
            'Steelcase Groupwork Tables',
            'Haworth Planes Conference',
            'Knoll Propeller Table',
            'HON Preside Conference',
            'Global Alba Conference',
            'Mayline Transaction Table',
            'OFM Endure Conference',
            'Lorell Chateau Conference'
          ],
          'meeting-chairs': [
            'Herman Miller Keyn Chair',
            'Steelcase Cobi Chair',
            'Haworth Soji Meeting',
            'Knoll Spark Series',
            'HON Flock Meeting',
            'Global Spree Meeting',
            'Humanscale Occasional',
            'KI Grazie Collection',
            'Allsteel Lyric Meeting'
          ],
          'collaborative-tables': [
            'Steelcase Verb Table',
            'Herman Miller Everywhere',
            'Haworth Immerse Table',
            'Knoll Pixel Table',
            'HON Build Tables',
            'Global Swap Table',
            'KI Ruckus Tables',
            'VS America Shift+',
            'Bretford EXPLORE Tables'
          ],
          'av-carts': [
            'Bretford TVC32PAC',
            'Luxor Mobile Cart',
            'Chief PPC2000 Cart',
            'Ergotron Neo-Flex',
            'Peerless SmartMount',
            'Anthro eNook Cart',
            'Oklahoma Sound PRC',
            'Balt Media Cart',
            'Da-Lite Pixmate'
          ],
          'reception-desks': [
            'OFM Marque Reception',
            'Linea Italia Reception',
            'Mayline Aberdeen Reception',
            'Global Zira Reception',
            'HON Arrive Reception',
            'Cherryman Amber Reception',
            'Boss Office Holland',
            'Regency Fusion Reception',
            'NBF Signature Reception'
          ],
          'sofas': [
            'Herman Miller Goetz Sofa',
            'Steelcase Campfire Collection',
            'Haworth Harbor Lounge',
            'Knoll Avio Sofa System',
            'HON Parkwyn Series',
            'Global River Lounge',
            'OFM Morph Sofa',
            'La-Z-Boy Odeon',
            'Allsteel Park Sofa'
          ],
          'lounge-chairs': [
            'Herman Miller Eames Lounge',
            'Steelcase Massaud Lounge',
            'Haworth Harbor Chair',
            'Knoll Womb Chair',
            'HON Vicinity Lounge',
            'Humanscale Summa Lounge',
            'Global Drift Lounge',
            'Allsteel Clarity Lounge',
            'West Elm Slope Lounge'
          ],
          'coffee-tables': [
            'Herman Miller Noguchi Table',
            'Steelcase Enea Tables',
            'Haworth Immerse Coffee',
            'Knoll Saarinen Table',
            'HON Flock Tables',
            'Global Wind Linear',
            'OFM Endure Tables',
            'Mayline Safco Tables',
            'Bush Business Accent'
          ],
          'side-tables': [
            'Herman Miller Turned Table',
            'Steelcase Millwork Side',
            'Haworth Compose Side',
            'Knoll Pilot Table',
            'HON Arrange Tables',
            'Global Sidera Tables',
            'Allsteel Vicinity Tables',
            'OFM Accent Tables',
            'Safco Impromptu Side'
          ]
        }
        
        // Get titles for this category
        const categoryTitles = titles[category] || titles['executive-desks'] // Use executive desks as fallback
        
        return categoryTitles[index] || categoryTitles[0] // Reuse first name if we run out
      }
      
      // Convert kebab-case to camelCase for product key
      const productKey = categoryId.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      
      const defaultProducts = {
        [productKey]: Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          title: getDefaultTitle(categoryId, i),
          image: defaultImages[i] || '/images/showroom-1.jpg',
          description: '',
          features: ['Premium Quality', 'Professional Grade', 'Warranty Included'],
          price: ''
        }))
      }
      
      setProducts(defaultProducts)
      setProductCategory(productKey) // Make sure we're using the camelCase key
      
      // Set default page name based on category ID
      setPageName(categoryNames[categoryId] || 'Products')
    }
    loadProducts()
  }, [categoryId])

  // Get current products based on selected category using kebab-case
  // Ensure products is an object and the category exists
  const currentProducts = (products && products[productCategory]) ? products[productCategory] : []

  // Update a specific product field
  const updateProduct = (productId: number, field: string, value: any) => {
    setProducts(prev => {
      const newProducts = { ...prev }
      const categoryProducts = [...(newProducts[productCategory] || [])]
      const productIndex = categoryProducts.findIndex(p => p.id === productId)
      
      if (productIndex !== -1) {
        categoryProducts[productIndex] = {
          ...categoryProducts[productIndex],
          [field]: value
        }
        newProducts[productCategory] = categoryProducts
      }
      
      saveProductsPageItems(newProducts)
      return newProducts
    })
  }

  return {
    products,
    setProducts,
    productCategory,
    setProductCategory,
    currentProducts,
    updateProduct,
    saveProductsPageItems,
    pageName,
    setPageName
  }
}