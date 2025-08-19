import { NextRequest, NextResponse } from 'next/server'
import { searchProductsServer } from '@/lib/foxbot/product-search-server'
import { getFoxbotSystemPrompt } from '@/lib/foxbot/foxbuilt-knowledge'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// Get comprehensive system prompt from knowledge base
const SYSTEM_PROMPT = getFoxbotSystemPrompt()

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if Gemini API key is configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Fallback to built-in conversation engine
      const { processMessageV2 } = await import('@/lib/foxbot/conversation-engine-v2')
      const result = await processMessageV2(message)
      return NextResponse.json({ 
        response: result.text,
        products: result.products,
        source: 'built-in'
      })
    }

    // Detect if user is asking about products
    const productKeywords = ['desk', 'chair', 'table', 'storage', 'cabinet', 'furniture', 'office', 'cubicle', 'standing', 'seating']
    const shouldSearchProducts = productKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    ) && !message.toLowerCase().includes('stop')

    // Call Gemini API
    try {
      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nUser: ${message}\nFOXBOT:`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      })

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`)
      }

      const data = await geminiResponse.json()
      console.log('Gemini response:', data) // Debug log
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "I'm having trouble understanding. Could you tell me what type of furniture you're looking for?"

      // Search for products if relevant
      let products = []
      if (shouldSearchProducts) {
        products = await searchProductsServer(message)
        products = products.slice(0, 3)
      }

      return NextResponse.json({ 
        response: responseText,
        products: products,
        source: 'gemini'
      })

    } catch (geminiError: any) {
      console.error('Gemini API error details:', {
        error: geminiError.message,
        url: GEMINI_API_URL,
        hasKey: !!GEMINI_API_KEY
      })
      
      // Fallback to built-in engine
      const { processMessageV2 } = await import('@/lib/foxbot/conversation-engine-v2')
      const result = await processMessageV2(message)
      
      // For server-side product search in fallback
      let products = result.products || []
      if (products.length > 0) {
        products = await searchProductsServer(message)
        products = products.slice(0, 3)
      }
      
      return NextResponse.json({ 
        response: result.text,
        products: products,
        source: 'built-in-fallback'
      })
    }

  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}