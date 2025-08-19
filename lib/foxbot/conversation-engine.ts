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

const conversationPatterns = {
  greeting: /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|yo|sup)$/i,
  help: /(help|what can you do|how does this work|guide|tutorial|assist|support)/i,
  budget: /(budget|affordable|cheap|economical|cost-effective|save money|discount)/i,
  office: /(office|workspace|workplace|corporate|business)/i,
  home: /(home|house|residential|personal|apartment)/i,
  specifications: /(size|dimension|measurement|spec|detail|information about)/i,
  contact: /(contact|call|phone|email|reach|speak to someone|salesperson|sales team)/i,
  catalog: /(catalog|catalogue|brochure|full list|all products|everything you have)/i,
  quantity: /(bulk|multiple|many|several|dozen|hundred)/i,
  delivery: /(deliver|ship|freight|transport|pickup|installation)/i,
  warranty: /(warranty|guarantee|return|refund|exchange)/i,
  showroom: /(showroom|visit|see in person|location|address|where are you)/i,
  nonsense: /(sandwich|food|eat|drink|weather|sports|movie|music|game|random)/i,
  stop: /(stop|enough|no more|don't show|quit|cease)/i,
}

function analyzeIntent(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  for (const [intent, pattern] of Object.entries(conversationPatterns)) {
    if (pattern.test(lowerMessage)) {
      return intent
    }
  }
  
  return 'product_search'
}

function generateResponse(intent: string, query: string, products: Product[]): string {
  switch (intent) {
    case 'greeting':
      return "Welcome to FoxBuilt! I'm FOXBOT, here to help you find the perfect furniture. Are you looking for office furniture, seating, storage solutions, or something specific?"

    case 'help':
      return "I can help you:\n• Find furniture by type (desks, chairs, storage, etc.)\n• Recommend products for your budget\n• Provide product specifications\n• Connect you with our sales team\n• Show you our full catalog\n\nJust tell me what you're looking for!"

    case 'nonsense':
      return "I'm FOXBOT, your furniture assistant. I'm here to help you find office furniture, desks, chairs, and storage solutions. How can I help you with your furniture needs today?"

    case 'stop':
      return "Understood! I'll stop showing products. Is there something else I can help you with? You can ask about our catalog, warranty, delivery options, or contact information."

    case 'budget':
      if (products.length > 0) {
        return `Great news! We have excellent budget-friendly options including refurbished and battle-tested furniture. Here are some affordable choices that don't compromise on quality:`
      }
      return "We offer competitive pricing and have a great selection of refurbished 'Battle-Tested' furniture that can save you 40-60% off retail. What type of furniture are you looking for?"

    case 'office':
      if (products.length > 0) {
        return "Perfect! Here are some excellent office furniture options. We have everything from executive desks to ergonomic seating:"
      }
      return "We specialize in complete office solutions! Are you looking for desks, chairs, conference tables, or a complete office setup?"

    case 'home':
      if (products.length > 0) {
        return "Here are some great options that work well for home offices and residential spaces:"
      }
      return "We have several pieces perfect for home offices! Are you setting up a workspace, or looking for specific furniture?"

    case 'specifications':
      if (products.length > 0) {
        return "Here are products with detailed specifications. Each item shows dimensions, materials, and features:"
      }
      return "I can provide detailed specifications for any product. Which furniture piece would you like to know more about?"

    case 'contact':
      return "You can reach our sales team at:\n📞 Phone: (801) 899-9406\n📧 Email: sales@foxbuilt.com\n📍 Visit our showroom at our location\n\nOur team is available Monday-Friday 8am-6pm and Saturday 10am-4pm."

    case 'catalog':
      return "You can view our complete catalog at /catalog. It features our full range of office furniture, seating, storage solutions, and more with 148 pages of products. Would you like me to help you find something specific?"

    case 'quantity':
      return "Excellent! We offer bulk discounts for large orders. For quantities over 10 items, please contact our sales team for special pricing. What items are you looking to purchase in bulk?"

    case 'delivery':
      return "We offer:\n• Local delivery within 50 miles\n• White glove installation service\n• Freight shipping nationwide\n• Pickup available at our warehouse\n\nDelivery times vary by product and location. Would you like a quote for specific items?"

    case 'warranty':
      return "Our warranty coverage:\n• New furniture: 5-10 year manufacturer warranty\n• Battle-Tested items: 1-year FoxBuilt warranty\n• 30-day satisfaction guarantee on most items\n• Extended warranty options available\n\nAll warranties cover defects in materials and workmanship."

    case 'showroom':
      return "Visit our showroom!\n📍 Our location in Utah\n🕒 Hours:\n• Mon-Fri: 8am-6pm\n• Saturday: 10am-4pm\n• Sunday: Closed\n\nCome see and test our furniture in person. Our design consultants are available to help!"

    case 'product_search':
    default:
      if (products.length > 0) {
        const productTypes = [...new Set(products.map(p => p.category).filter(Boolean))]
        if (productTypes.length > 0) {
          return `I found some great options for you! Here are products that match your search:`
        }
        return "Here are some products that might interest you:"
      }
      return "I'd be happy to help you find the perfect furniture. Could you tell me more about what you're looking for? For example:\n• Type of furniture (desk, chair, storage)\n• New or refurbished\n• Any specific features you need"
  }
}

export async function processMessage(userMessage: string): Promise<BotResponse> {
  const intent = analyzeIntent(userMessage)
  
  let products: Product[] = []
  
  const searchKeywords = [
    'desk', 'chair', 'table', 'storage', 'cabinet', 'conference',
    'executive', 'ergonomic', 'standing', 'reception', 'furniture',
    'seating', 'workstation', 'office', 'lounge', 'filing', 'cubicle',
    'panel', 'bench', 'benching', 'modular', 'sit', 'stand'
  ]
  
  const nonProductIntents = ['greeting', 'help', 'contact', 'catalog', 'delivery', 'warranty', 'showroom', 'nonsense', 'stop']
  
  const shouldSearch = !nonProductIntents.includes(intent) && (
    intent === 'product_search' || 
    searchKeywords.some(keyword => userMessage.toLowerCase().split(' ').some(word => word.includes(keyword))) ||
    ['office', 'home', 'budget', 'specifications', 'quantity'].includes(intent)
  )
  
  if (shouldSearch) {
    products = await searchProducts(userMessage)
  }
  
  const responseText = generateResponse(intent, userMessage, products)
  
  return {
    text: responseText,
    products: shouldSearch ? products.slice(0, 3) : []
  }
}