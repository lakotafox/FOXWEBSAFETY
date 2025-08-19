import { Product } from './product-search'

export interface GeminiResponse {
  response: string
  products?: Product[]
  source: 'gemini' | 'built-in' | 'built-in-fallback'
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
    
    // Fallback to built-in engine
    const { processMessageV2 } = await import('./conversation-engine-v2')
    const result = await processMessageV2(message)
    
    console.log('Using fallback engine')
    return {
      response: result.text,
      products: result.products,
      source: 'built-in-fallback'
    }
  }
}