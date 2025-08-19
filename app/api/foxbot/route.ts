import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, useOllama = false } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // If Ollama is requested, try to use it
    if (useOllama) {
      try {
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama2',
            prompt: `You are FOXBOT, a helpful furniture sales assistant for FoxBuilt. FoxBuilt specializes in office furniture including desks, chairs, storage, conference tables, and more. They offer both new and refurbished "battle-tested" furniture. Be helpful, friendly, and knowledgeable about furniture.

User: ${message}
FOXBOT:`,
            stream: false,
            temperature: 0.7,
            max_tokens: 500
          }),
        })

        if (ollamaResponse.ok) {
          const data = await ollamaResponse.json()
          return NextResponse.json({ 
            response: data.response,
            source: 'ollama'
          })
        }
      } catch (error) {
        console.log('Ollama not available, falling back to built-in logic')
      }
    }

    // Fallback to built-in conversation engine
    const { processMessage } = await import('@/lib/foxbot/conversation-engine')
    const result = await processMessage(message)

    return NextResponse.json({ 
      response: result.text,
      products: result.products,
      source: 'built-in'
    })

  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}