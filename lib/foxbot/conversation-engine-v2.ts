import { searchProducts, Product } from './product-search'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  products?: Product[]
}

export interface BotResponse {
  text: string
  products?: Product[]
}

// Track conversation context
let conversationContext = {
  lastIntent: '',
  productSearchActive: false,
  askedAboutProducts: false
}

export async function processMessageV2(userMessage: string): Promise<BotResponse> {
  const lowerMessage = userMessage.toLowerCase().trim()
  let products: Product[] = []
  let responseText = ''

  // Simple greeting check
  if (lowerMessage.match(/^(hi|hello|hey|yo|sup|greetings)$/i)) {
    responseText = "Welcome to FoxBuilt! I'm FOXBOT, here to help you find the perfect furniture. What type of furniture are you looking for today?"
    conversationContext.lastIntent = 'greeting'
    return { text: responseText, products: [] }
  }

  // Help request
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    responseText = "I can help you:\n• Find specific furniture (desks, chairs, storage)\n• Show budget-friendly options\n• Provide product information\n• Connect you with our sales team\n• Access our full catalog\n\nJust tell me what you're looking for!"
    conversationContext.lastIntent = 'help'
    return { text: responseText, products: [] }
  }

  // Contact information
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('call') || lowerMessage.includes('email')) {
    responseText = "📞 Call us: (877) 769-3768\n📧 Email: sales@foxbuilt.com\n📍 Visit our showroom\n\nOur team is ready to help with your furniture needs!"
    conversationContext.lastIntent = 'contact'
    return { text: responseText, products: [] }
  }

  // Catalog request
  if (lowerMessage.includes('catalog') || lowerMessage.includes('brochure')) {
    responseText = "View our complete 148-page catalog at /catalog. It features our full range of office furniture. Would you like me to help you find something specific?"
    conversationContext.lastIntent = 'catalog'
    return { text: responseText, products: [] }
  }

  // Warranty info
  if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
    responseText = "Our warranty coverage:\n• New furniture: 5-10 year manufacturer warranty\n• Battle-Tested items: 1-year FoxBuilt warranty\n• 30-day satisfaction guarantee\n\nAll warranties cover defects in materials and workmanship."
    conversationContext.lastIntent = 'warranty'
    return { text: responseText, products: [] }
  }

  // Delivery info
  if (lowerMessage.includes('deliver') || lowerMessage.includes('ship')) {
    responseText = "We offer:\n• Local delivery within 50 miles\n• White glove installation\n• Nationwide freight shipping\n• Warehouse pickup\n\nDelivery times vary by product. Need a quote?"
    conversationContext.lastIntent = 'delivery'
    return { text: responseText, products: [] }
  }

  // Handle nonsense or off-topic
  if (lowerMessage.match(/(sandwich|food|eat|drink|weather|sports|movie|music|game)/i)) {
    const funResponses = [
      "Ha! I'm more of a furniture expert than a food critic! But speaking of comfort, our ergonomic chairs are perfect for lunch breaks. Can I help you find some office furniture?",
      "I wish I could help with that, but I'm all about desks and chairs! Our sales team at (877) 769-3768 might be more helpful with non-furniture questions. What furniture are you looking for?",
      "That's outside my furniture expertise! But I'd love to help you find the perfect desk or chair instead. What's your workspace need?"
    ]
    responseText = funResponses[Math.floor(Math.random() * funResponses.length)]
    conversationContext.lastIntent = 'redirect'
    return { text: responseText, products: [] }
  }

  // Handle name introduction
  if (lowerMessage.match(/my name is|i'm |i am |call me /i)) {
    const nameMatch = lowerMessage.match(/(?:my name is|i'm|i am|call me)\s+([a-z]+)/i)
    const name = nameMatch ? nameMatch[1] : 'there'
    responseText = `Nice to meet you, ${name.charAt(0).toUpperCase() + name.slice(1)}! I'm FOXBOT, here to help you find the perfect furniture for your space. What type of furniture are you looking for today?`
    conversationContext.lastIntent = 'introduction'
    return { text: responseText, products: [] }
  }

  // Handle requests for unusual items (pink furniture, etc.)
  if (lowerMessage.match(/(pink|purple|rainbow|glitter|neon|bright|colorful)/i) && lowerMessage.match(/(furniture|desk|chair)/i)) {
    responseText = "While we don't have those specific colors in our standard catalog, our sales team can often arrange custom fabric options or special orders! They'd love to help at (877) 769-3768. In the meantime, would you like to see our standard furniture options?"
    conversationContext.lastIntent = 'unusual_request'
    return { text: responseText, products: [] }
  }

  // Handle story requests
  if (lowerMessage.includes('story') || lowerMessage.includes('tell me about')) {
    responseText = "Here's a quick story: FoxBuilt has been transforming Utah offices since 1999! We've helped thousands of businesses create productive workspaces. Want to be part of our next success story? Let me show you some furniture options!"
    conversationContext.lastIntent = 'story'
    return { text: responseText, products: [] }
  }

  // Stop showing products
  if (lowerMessage.includes('stop') || lowerMessage.includes('no more') || lowerMessage.includes("don't show")) {
    responseText = "Understood! How else can I help you today? I can provide information about warranties, delivery, or connect you with our sales team."
    conversationContext.lastIntent = 'stop'
    conversationContext.productSearchActive = false
    return { text: responseText, products: [] }
  }

  // Questions without product intent
  if (lowerMessage.startsWith('what') || lowerMessage.startsWith('why') || lowerMessage.startsWith('how')) {
    if (!lowerMessage.match(/(desk|chair|table|furniture|storage|cabinet|seating)/i)) {
      responseText = "I can answer questions about our furniture, pricing, delivery, and services. What would you like to know?"
      conversationContext.lastIntent = 'question'
      return { text: responseText, products: [] }
    }
  }

  // Product searches - be very specific about what triggers product display
  const productKeywords = [
    'desk', 'chair', 'table', 'storage', 'cabinet', 'filing',
    'conference', 'executive', 'ergonomic', 'standing', 'sit stand',
    'reception', 'furniture', 'seating', 'workstation', 'cubicle',
    'panel', 'bench', 'modular', 'lounge', 'sofa', 'office'
  ]

  const hasProductKeyword = productKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  )

  // Check for buying intent
  const buyingIntent = lowerMessage.match(/(looking for|need|want|buy|purchase|show me|find|search)/i)

  // Only search for products if there's clear intent
  if (hasProductKeyword && (buyingIntent || conversationContext.productSearchActive)) {
    products = await searchProducts(userMessage)
    
    if (products.length > 0) {
      // Specific responses based on what they're looking for
      if (lowerMessage.includes('standing') || lowerMessage.includes('sit stand')) {
        responseText = "Here are our height-adjustable standing desk options:"
      } else if (lowerMessage.includes('budget') || lowerMessage.includes('affordable')) {
        responseText = "Great choice! Our Battle-Tested furniture offers excellent value:"
      } else if (lowerMessage.includes('executive')) {
        responseText = "Our executive furniture combines style and functionality:"
      } else if (lowerMessage.includes('chair')) {
        responseText = "Here are our ergonomic seating options:"
      } else if (lowerMessage.includes('storage')) {
        responseText = "These storage solutions will help organize your space:"
      } else {
        responseText = "Based on your search, here are some great options:"
      }
      conversationContext.productSearchActive = true
    } else {
      responseText = "I couldn't find exact matches for that. Could you tell me more about what you're looking for? We have desks, chairs, storage, and conference furniture."
      conversationContext.productSearchActive = false
    }
  } else if (hasProductKeyword) {
    // They mentioned furniture but without clear buying intent
    responseText = `I can help you with ${userMessage}. Are you looking to purchase, or would you like more information?`
    conversationContext.askedAboutProducts = true
    products = []
  } else {
    // Generic response for unclear messages
    responseText = "I'm here to help you find furniture. Could you tell me what type of furniture you need, or ask me a specific question about our products?"
    conversationContext.productSearchActive = false
  }

  conversationContext.lastIntent = hasProductKeyword ? 'product' : 'general'

  return {
    text: responseText,
    products: products.slice(0, 3)
  }
}