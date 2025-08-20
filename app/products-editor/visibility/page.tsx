'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Save, ArrowLeft, Edit2 } from 'lucide-react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { waitForClearWindow } from '@/lib/github-utils'

interface CategoryVisibility {
  [key: string]: boolean
}

interface CategoryNames {
  groups: { [key: string]: string }
  subcategories: { [key: string]: string }
}

// Default category structure - names will be updated from actual data
const defaultCategories = [
  { id: 'executive-desks', name: 'Executive Desks', group: 'Desks & Workstations' },
  { id: 'computer-desks', name: 'Computer Desks', group: 'Desks & Workstations' },
  { id: 'standing-desks', name: 'Standing Desks', group: 'Desks & Workstations' },
  { id: 'modular-benching', name: 'Modular Benching Systems', group: 'Desks & Workstations' },
  { id: 'cubicle-workstations', name: 'Cubicle Workstations', group: 'Cubicles' },
  { id: 'panel-systems', name: 'Panel Systems', group: 'Cubicles' },
  { id: 'modular-cubicles', name: 'Modular Cubicles', group: 'Cubicles' },
  { id: 'privacy-screens', name: 'Privacy Screens', group: 'Cubicles' },
  { id: 'task-chairs', name: 'Task Chairs', group: 'Seating' },
  { id: 'executive-chairs', name: 'Executive Chairs', group: 'Seating' },
  { id: 'conference-chairs', name: 'Conference Chairs', group: 'Seating' },
  { id: 'drafting-stools', name: 'Drafting Stools', group: 'Seating' },
  { id: 'ergonomic-seating', name: 'Ergonomic Seating', group: 'Seating' },
  { id: 'filing-cabinets', name: 'Filing Cabinets', group: 'Storage' },
  { id: 'shelving-units', name: 'Shelving Units', group: 'Storage' },
  { id: 'bookcases', name: 'Bookcases', group: 'Storage' },
  { id: 'lockers', name: 'Lockers', group: 'Storage' },
  { id: 'credenzas', name: 'Credenzas', group: 'Storage' },
  { id: 'conference-tables', name: 'Conference Tables', group: 'Conference & Meeting' },
  { id: 'meeting-chairs', name: 'Meeting Room Chairs', group: 'Conference & Meeting' },
  { id: 'collaborative-tables', name: 'Collaborative Tables', group: 'Conference & Meeting' },
  { id: 'av-carts', name: 'AV Carts', group: 'Conference & Meeting' },
  { id: 'reception-desks', name: 'Reception Desks', group: 'Reception & Lounge' },
  { id: 'sofas', name: 'Sofas', group: 'Reception & Lounge' },
  { id: 'lounge-chairs', name: 'Lounge Chairs', group: 'Reception & Lounge' },
  { id: 'coffee-tables', name: 'Coffee Tables', group: 'Reception & Lounge' },
  { id: 'side-tables', name: 'Side Tables', group: 'Reception & Lounge' }
]

const groupIdMap: { [key: string]: string } = {
  'Desks & Workstations': 'desks-workstations',
  'Cubicles': 'cubicles', 
  'Seating': 'seating',
  'Storage': 'storage',
  'Conference & Meeting': 'conference-meeting',
  'Reception & Lounge': 'reception-lounge'
}

export default function CategoryVisibilityEditor() {
  const router = useRouter()
  const [visibility, setVisibility] = useState<CategoryVisibility>({})
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showPublishLoadingOverlay, setShowPublishLoadingOverlay] = useState(false)
  const [publishMessage, setPublishMessage] = useState('')
  const [allCategories, setAllCategories] = useState(defaultCategories)
  const [showSearchBar, setShowSearchBar] = useState(true)
  const [showFoxbot, setShowFoxbot] = useState(true)
  const [categoryNames, setCategoryNames] = useState<CategoryNames>({
    groups: {
      'desks-workstations': 'Desks & Workstations',
      'cubicles': 'Cubicles',
      'seating': 'Seating',
      'storage': 'Storage',
      'conference-meeting': 'Conference & Meeting',
      'reception-lounge': 'Reception & Lounge'
    },
    subcategories: {}
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')

  useEffect(() => {
    // Load visibility settings
    const loadSettings = async () => {
      try {
        // Try to load from published file first
        const response = await fetch('/category-visibility.json', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          
          // Handle both old and new format
          if (data.categoryNames) {
            // New combined format
            setCategoryNames(data.categoryNames)
            // Remove categoryNames from visibility data
            const { categoryNames, lastUpdated, ...visibilityData } = data
            setVisibility(visibilityData)
            if (data.showSearchBar !== undefined) {
              setShowSearchBar(data.showSearchBar)
            }
            if (data.showFoxbot !== undefined) {
              setShowFoxbot(data.showFoxbot)
            }
          } else {
            // Old format - just visibility
            setVisibility(data)
            if (data.showSearchBar !== undefined) {
              setShowSearchBar(data.showSearchBar)
            }
            if (data.showFoxbot !== undefined) {
              setShowFoxbot(data.showFoxbot)
            }
          }
        } else {
          // Fallback to localStorage
          const savedVisibility = localStorage.getItem('foxbuilt-category-visibility')
          if (savedVisibility) {
            const parsed = JSON.parse(savedVisibility)
            setVisibility(parsed)
            if (parsed.showSearchBar !== undefined) {
              setShowSearchBar(parsed.showSearchBar)
            }
            if (parsed.showFoxbot !== undefined) {
              setShowFoxbot(parsed.showFoxbot)
            }
          } else {
            // Default all categories to visible
            const defaultVisibility: CategoryVisibility = {}
            defaultCategories.forEach(cat => {
              defaultVisibility[cat.id] = true
            })
            setVisibility(defaultVisibility)
          }
        }
      } catch (e) {
        // Default all categories to visible
        const defaultVisibility: CategoryVisibility = {}
        defaultCategories.forEach(cat => {
          defaultVisibility[cat.id] = true
        })
        setVisibility(defaultVisibility)
      }
    }
    loadSettings()
    
    // Load category names
    const loadCategoryNames = async () => {
      try {
        // First check localStorage for draft changes
        const savedNames = localStorage.getItem('foxbuilt-category-names')
        if (savedNames) {
          const names = JSON.parse(savedNames)
          setCategoryNames(names)
          
          // Update allCategories with custom names
          setAllCategories(prev => prev.map(cat => ({
            ...cat,
            name: names.subcategories?.[cat.id] || cat.name,
            group: Object.values(names.groups).find((_, index) => 
              Object.keys(names.groups)[index] === groupIdMap[cat.group]
            ) || cat.group
          })))
        } else {
          // Fallback to fetch from published file
          const response = await fetch('/category-names.json', { cache: 'no-store' })
          if (response.ok) {
            const names = await response.json()
            setCategoryNames(names)
            
            // Update allCategories with custom names
            setAllCategories(prev => prev.map(cat => ({
              ...cat,
              name: names.subcategories?.[cat.id] || cat.name,
              group: Object.values(names.groups).find((_, index) => 
                Object.keys(names.groups)[index] === groupIdMap[cat.group]
              ) || cat.group
            })))
          }
        }
        
        // Also check for executive-desks custom name from products.json
        const productsResponse = await fetch('/products.json', { cache: 'no-store' })
        if (productsResponse.ok) {
          const data = await productsResponse.json()
          if (data.pageName) {
            setCategoryNames(prev => ({
              ...prev,
              subcategories: {
                ...prev.subcategories,
                'executive-desks': data.pageName
              }
            }))
            setAllCategories(prev => prev.map(cat => 
              cat.id === 'executive-desks' ? { ...cat, name: data.pageName } : cat
            ))
          }
        }
      } catch (e) {
        console.log('Using default category names')
      }
    }
    loadCategoryNames()
  }, [])

  const toggleCategory = (categoryId: string) => {
    const newVisibility = {
      ...visibility,
      [categoryId]: !visibility[categoryId]
    }
    setVisibility(newVisibility)
    // Save to localStorage immediately for local persistence
    localStorage.setItem('foxbuilt-category-visibility', JSON.stringify({
      ...newVisibility,
      showSearchBar,
      showFoxbot
    }))
  }

  const toggleGroup = (groupName: string) => {
    const groupCategories = allCategories.filter(cat => cat.group === groupName)
    const allVisible = groupCategories.every(cat => visibility[cat.id])
    
    const newVisibility = { ...visibility }
    groupCategories.forEach(cat => {
      newVisibility[cat.id] = !allVisible
    })
    setVisibility(newVisibility)
    // Save to localStorage immediately for local persistence
    localStorage.setItem('foxbuilt-category-visibility', JSON.stringify({
      ...newVisibility,
      showSearchBar,
      showFoxbot
    }))
  }


  const startEditing = (id: string, currentValue: string) => {
    setEditingId(id)
    setTempValue(currentValue)
  }

  const saveEdit = (id: string, type: 'group' | 'subcategory') => {
    let newCategoryNames = categoryNames
    
    if (type === 'group') {
      newCategoryNames = {
        ...categoryNames,
        groups: {
          ...categoryNames.groups,
          [id]: tempValue
        }
      }
      setCategoryNames(newCategoryNames)
      // Update allCategories to reflect the new group name
      const groupId = id
      setAllCategories(prev => prev.map(cat => {
        if (groupIdMap[cat.group] === groupId) {
          return { ...cat, group: tempValue }
        }
        return cat
      }))
    } else {
      newCategoryNames = {
        ...categoryNames,
        subcategories: {
          ...categoryNames.subcategories,
          [id]: tempValue
        }
      }
      setCategoryNames(newCategoryNames)
      // Update allCategories to reflect the new subcategory name
      setAllCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, name: tempValue } : cat
      ))
    }
    
    // Save category names to localStorage
    localStorage.setItem('foxbuilt-category-names', JSON.stringify(newCategoryNames))
    
    setEditingId(null)
    setTempValue('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTempValue('')
  }

  const publishToGitHub = async () => {
    setShowPublishLoadingOverlay(true)
    setPublishMessage('Checking for recent commits...')
    
    // Include search bar and FOXBOT settings with category visibility
    const visibilitySettingsToPublish = {
      ...visibility,
      showSearchBar: showSearchBar,
      showFoxbot: showFoxbot
    }
    
    try {
      // Use the same GitHub API approach as products editor
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      
      // Check for recent commits and wait if needed
      await waitForClearWindow(GITHUB_TOKEN, setPublishMessage)
      setPublishMessage('Publishing settings to GitHub...')
      
      // Only update category-visibility.json (single file, single commit)
      // Store names in the same file to avoid multiple commits
      const allSettings = {
        ...visibilitySettingsToPublish,
        categoryNames: categoryNames,
        lastUpdated: new Date().toISOString()
      }
      
      // Get current file SHA
      let sha = ''
      try {
        const currentResponse = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/public/category-visibility.json`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )
        
        if (currentResponse.ok) {
          const currentFile = await currentResponse.json()
          sha = currentFile.sha
        }
      } catch (e) {
        console.log('Visibility file does not exist yet')
      }
      
      // Encode content to base64
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(allSettings, null, 2))))
      
      // Update file on GitHub (single commit)
      const updateResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/public/category-visibility.json`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update category visibility and names - ${new Date().toLocaleString()}`,
            content: contentBase64,
            sha: sha || undefined,
            branch: 'main'
          })
        }
      )
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        console.error('GitHub API Error:', errorData)
        throw new Error(errorData.message || 'Failed to publish')
      }

      // Success
      // Clear localStorage after successful publish
      localStorage.removeItem('foxbuilt-category-visibility')
      localStorage.removeItem('foxbuilt-category-names')
      
      setPublishMessage('✅ Settings published successfully!')
      setSaveMessage('✅ Published to live site!')
      
      // Wait to ensure GitHub processes the commit
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setTimeout(() => {
        setShowPublishLoadingOverlay(false)
        setPublishMessage('')
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      setPublishMessage('Failed to publish. Please try again.')
      setTimeout(() => {
        setShowPublishLoadingOverlay(false)
        setPublishMessage('')
      }, 3000)
    }
  }

  // Group categories by their group
  const groupedCategories = allCategories.reduce((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = []
    acc[cat.group].push(cat)
    return acc
  }, {} as Record<string, typeof allCategories>)

  return (
    <div className="min-h-screen bg-slate-800">
      <LoadingOverlay 
        show={showPublishLoadingOverlay} 
        type="publish" 
        publishMessage={publishMessage}
      />

      {/* Header */}
      <div className="bg-yellow-500 py-4 px-4 fixed top-0 left-0 right-0 z-40 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/products-editor/select')}
            className="flex items-center gap-2 text-black hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black">BACK</span>
          </button>
          
          <h1 className="text-2xl font-black text-black">MANAGE CATEGORIES</h1>
          
          <button
            onClick={publishToGitHub}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-black hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            PUBLISH TO LIVE SITE
          </button>
        </div>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-bold">
          {saveMessage}
        </div>
      )}

      {/* Main content */}
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <p className="text-yellow-500 mb-8 text-center font-bold">
            Manage category visibility and edit names. Click the edit icon to rename categories.
          </p>

          {/* Search Bar Toggle */}
          <div className="mb-8 bg-slate-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">SEARCH BAR</h2>
                <p className="text-yellow-500 text-sm mt-1 font-bold">Show or hide the search bar in the navigation header</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !showSearchBar
                  setShowSearchBar(newValue)
                  // Save to localStorage immediately
                  localStorage.setItem('foxbuilt-category-visibility', JSON.stringify({
                    ...visibility,
                    showSearchBar: newValue,
                    showFoxbot
                  }))
                }}
                className={`p-3 rounded-lg transition-all ${
                  showSearchBar
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                aria-label={showSearchBar ? 'Hide search bar' : 'Show search bar'}
              >
                {showSearchBar ? (
                  <Eye className="w-6 h-6" />
                ) : (
                  <EyeOff className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* FOXBOT AI Toggle */}
          <div className="mb-8 bg-slate-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">FOXBOT AI ASSISTANT</h2>
                <p className="text-yellow-500 text-sm mt-1 font-bold">Show or hide the FOXBOT AI chat assistant in navigation</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !showFoxbot
                  setShowFoxbot(newValue)
                  // Save to localStorage immediately
                  localStorage.setItem('foxbuilt-category-visibility', JSON.stringify({
                    ...visibility,
                    showSearchBar,
                    showFoxbot: newValue
                  }))
                }}
                className={`p-3 rounded-lg transition-all ${
                  showFoxbot
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                aria-label={showFoxbot ? 'Hide FOXBOT' : 'Show FOXBOT'}
              >
                {showFoxbot ? (
                  <Eye className="w-6 h-6" />
                ) : (
                  <EyeOff className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Category groups */}
          {Object.entries(groupedCategories).map(([groupName, categories]) => (
            <div key={groupName} className="mb-8 bg-slate-900 rounded-lg p-6">
              {/* Group header with editable name */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2 flex-1">
                  {editingId === groupIdMap[groupName] ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="bg-slate-800 text-white px-3 py-2 rounded-lg flex-1 font-black text-xl"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(groupIdMap[groupName], 'group')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-black text-white">{groupName}</h2>
                      <button
                        onClick={() => startEditing(groupIdMap[groupName], groupName)}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                        aria-label="Edit group name"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-colors ml-2"
                >
                  Toggle All
                </button>
              </div>

              {/* Categories in group */}
              <div className="space-y-3">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      visibility[category.id] 
                        ? 'bg-slate-800 border-2 border-green-500' 
                        : 'bg-slate-800 border-2 border-red-600 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {editingId === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="bg-slate-700 text-white px-3 py-2 rounded-lg flex-1 font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(category.id, 'subcategory')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`font-bold ${visibility[category.id] ? 'text-white' : 'text-gray-400'}`}>
                            {category.name}
                          </span>
                          <button
                            onClick={() => startEditing(category.id, category.name)}
                            className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                            aria-label="Edit category name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`p-2 rounded-lg transition-all ${
                        visibility[category.id]
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                      aria-label={visibility[category.id] ? 'Hide category' : 'Show category'}
                    >
                      {visibility[category.id] ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}