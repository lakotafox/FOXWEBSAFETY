import { Product } from './product-search'

export interface GeminiResponse {
  response: string
  products?: Product[]
  source: 'gemini' | 'offline'
  showOfflineButtons?: boolean
}

export async function sendMessageToGemini(message: string): Promise<GeminiResponse> {
  try {
    console.log('Sending message to Gemini:', message)
    
    const response = await fetch('/api/foxbot/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      console.error('API response not OK:', response.status)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received from API:', data.source, data.response?.substring(0, 100))
    return data
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    
    // Return offline message
    console.log('FOXBOT is offline')
    return {
      response: "FOXBOT has gone offline. Please contact our team or return to the website.",
      products: [],
      source: 'offline',
      showOfflineButtons: true
    }
  }
}