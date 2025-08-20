// Netlify Function for FOXBOT
// This replaces the Next.js API route and works with static export

const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Get API key from environment
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    console.log('API Key check:', GEMINI_API_KEY ? `Found (length: ${GEMINI_API_KEY.length})` : 'Missing');
    
    // Check if API key is configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here' || GEMINI_API_KEY.trim() === '') {
      console.error('GEMINI_API_KEY not configured or invalid');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "FOXBOT cannot find API credentials. Please check Netlify environment variables.",
          products: [],
          source: 'offline',
          showOfflineButtons: true
        })
      };
    }

    // Gemini API configuration - using v1beta endpoint with gemini-1.5-flash-latest
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    
    // System prompt for FOXBOT
    const SYSTEM_PROMPT = `You are FOXBOT, the AI assistant for FoxBuilt Office Furniture.

CRITICAL RULES:
- Keep responses to 1-2 sentences MAX
- When users mention ANY furniture type, IMMEDIATELY list available options
- NO follow-up questions unless absolutely necessary
- Be direct and action-oriented

PRODUCT CATEGORIES TO SHOW:
• Chairs/Seating → "We have: Task Chairs, Executive Chairs, Conference Chairs, Drafting Stools, Ergonomic Seating"
• Desks → "Available desks: Executive Desks, Computer Desks, Standing Desks, Modular Benching Systems"
• Tables → "Our tables: Conference Tables, Collaborative Tables, Coffee Tables, Side Tables"
• Storage → "Storage options: Filing Cabinets, Shelving Units, Bookcases, Lockers, Credenzas"
• Cubicles → "Cubicle solutions: Workstations, Panel Systems, Modular Cubicles, Privacy Screens"
• Conference/Meeting → "Meeting furniture: Conference Tables, Meeting Chairs, Collaborative Tables, AV Carts"
• Reception/Lounge → "Reception area: Reception Desks, Sofas, Lounge Chairs, Coffee Tables"

TRIGGER WORDS:
- "show me" / "options" / "what do you have" / "show" / "list" / "browse" → List relevant categories immediately
- Any furniture keyword → Show that category's options IMMEDIATELY
- "furniture" / "office" / "products" → List ALL main categories
- Never ask "what type" - just show what's available

Example responses:
User: "I need a chair" → "We have Task Chairs, Executive Chairs, Conference Chairs, Drafting Stools, and Ergonomic Seating. Which type interests you?"
User: "Show me desks" → "Our desks: Executive Desks, Computer Desks, Standing Desks, and Modular Benching Systems."
User: "What do you have?" → "We offer: Desks, Chairs, Storage, Conference Tables, Cubicles, and Reception furniture."`;

    // Enhanced product detection with ALL categories and subcategories
    const PRODUCT_CATEGORIES = {
      chairs: {
        keywords: [
          'chair', 'chairs', 'seating', 'seat', 'stool', 'ergonomic',
          // Subcategory names
          'task chair', 'task chairs', 'task',
          'executive chair', 'executive chairs', 'executive seating',
          'conference chair', 'conference chairs', 'meeting chair',
          'drafting stool', 'drafting stools', 'drafting',
          'ergonomic seating', 'ergonomic chair'
        ],
        categories: ['task-chairs', 'executive-chairs', 'conference-chairs', 'drafting-stools', 'ergonomic-seating'],
        response: "Task Chairs, Executive Chairs, Conference Chairs, Drafting Stools, Ergonomic Seating"
      },
      desks: {
        keywords: [
          'desk', 'desks', 'workstation', 'workstations', 'benching',
          // Subcategory names
          'executive desk', 'executive desks',
          'computer desk', 'computer desks', 
          'standing desk', 'standing desks', 'sit stand', 'height adjustable',
          'modular benching', 'benching system', 'benching systems'
        ],
        categories: ['executive-desks', 'computer-desks', 'standing-desks', 'modular-benching'],
        response: "Executive Desks, Computer Desks, Standing Desks, Modular Benching Systems"
      },
      storage: {
        keywords: [
          'storage', 'cabinet', 'cabinets', 'shelving', 'shelf',
          // Subcategory names
          'filing cabinet', 'filing cabinets', 'file cabinet', 'file cabinets',
          'shelving unit', 'shelving units', 'shelves',
          'bookcase', 'bookcases', 'book shelf', 'bookshelves',
          'locker', 'lockers', 'personal storage',
          'credenza', 'credenzas', 'sideboard'
        ],
        categories: ['filing-cabinets', 'shelving-units', 'bookcases', 'lockers', 'credenzas'],
        response: "Filing Cabinets, Shelving Units, Bookcases, Lockers, Credenzas"
      },
      tables: {
        keywords: [
          'table', 'tables',
          // Subcategory names
          'conference table', 'conference tables', 'boardroom table', 'meeting table',
          'collaborative table', 'collaborative tables', 'collaboration',
          'coffee table', 'coffee tables', 'accent table',
          'side table', 'side tables', 'end table', 'occasional table'
        ],
        categories: ['conference-tables', 'collaborative-tables', 'coffee-tables', 'side-tables'],
        response: "Conference Tables, Collaborative Tables, Coffee Tables, Side Tables"
      },
      cubicles: {
        keywords: [
          'cubicle', 'cubicles', 'cube', 'cubes', 'partition', 'partitions',
          // Subcategory names
          'cubicle workstation', 'cubicle workstations',
          'panel system', 'panel systems', 'panels',
          'modular cubicle', 'modular cubicles',
          'privacy screen', 'privacy screens', 'divider', 'dividers'
        ],
        categories: ['cubicle-workstations', 'panel-systems', 'modular-cubicles', 'privacy-screens'],
        response: "Cubicle Workstations, Panel Systems, Modular Cubicles, Privacy Screens"
      },
      conference: {
        keywords: [
          'conference', 'meeting', 'boardroom', 'training',
          // Subcategory items
          'conference furniture', 'meeting room', 'meeting furniture',
          'av cart', 'av carts', 'media cart', 'presentation'
        ],
        categories: ['conference-tables', 'meeting-chairs', 'collaborative-tables', 'av-carts'],
        response: "Conference Tables, Meeting Room Chairs, Collaborative Tables, AV Carts"
      },
      reception: {
        keywords: [
          'reception', 'lounge', 'lobby', 'waiting', 'front desk',
          // Subcategory names
          'reception desk', 'reception desks', 'front desk',
          'sofa', 'sofas', 'couch', 'couches', 'loveseat',
          'lounge chair', 'lounge chairs', 'accent chair', 'guest chair',
          'coffee table', 'waiting room', 'lobby furniture'
        ],
        categories: ['reception-desks', 'sofas', 'lounge-chairs', 'coffee-tables', 'side-tables'],
        response: "Reception Desks, Sofas, Lounge Chairs, Coffee Tables, Side Tables"
      }
    };

    // Detect which product category user is asking about
    let detectedCategory = null;
    const lowerMessage = message.toLowerCase();
    
    // Check for "show me" type requests
    const showTriggers = ['show me', 'show', 'options', 'what do you have', 'list', 'browse', 'display', 'view'];
    const isShowRequest = showTriggers.some(trigger => lowerMessage.includes(trigger));
    
    for (const [category, data] of Object.entries(PRODUCT_CATEGORIES)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedCategory = category;
        break;
      }
    }
    
    // If user just asks to see products without specifying, show all categories
    if (isShowRequest && !detectedCategory) {
      detectedCategory = 'all';
    }

    // Try to load and search products
    let products = [];
    try {
      const productsPath = path.join(__dirname, '../../public/products.json');
      const productsData = await fs.readFile(productsPath, 'utf8');
      const allProducts = JSON.parse(productsData);
      
      if (detectedCategory && PRODUCT_CATEGORIES[detectedCategory]) {
        // Filter products by detected category
        const relevantCategories = PRODUCT_CATEGORIES[detectedCategory].categories;
        products = Object.entries(allProducts)
          .filter(([key, product]) => {
            return relevantCategories.some(cat => key.includes(cat) || product.category === cat);
          })
          .slice(0, 5) // Return top 5 products
          .map(([key, product]) => ({
            id: key,
            title: product.title || product.name || key,
            category: product.category,
            description: product.description
          }));
      }
    } catch (error) {
      console.log('Could not load products:', error.message);
      // Products array remains empty if file can't be loaded
    }

    // Call Gemini API
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
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const data = await geminiResponse.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm having trouble understanding. Could you tell me what type of furniture you're looking for?";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: responseText,
        products: products,
        source: 'gemini'
      })
    };

  } catch (error) {
    console.error('Error in FOXBOT function:', error);
    
    // Check for specific error types
    let errorMessage = `FOXBOT error: ${error.message || 'Unknown error occurred'}`;
    
    if (error.message && error.message.includes('429')) {
      errorMessage = "FOXBOT is temporarily unavailable due to high demand. Please try again in a moment.";
    } else if (error.message && error.message.includes('403')) {
      errorMessage = "FOXBOT API key error (403). Check if the API key is valid.";
    } else if (error.message && error.message.includes('401')) {
      errorMessage = "FOXBOT authentication failed (401). Check API key in Netlify.";
    } else if (error.message && error.message.includes('400')) {
      errorMessage = "FOXBOT request error (400). Invalid API request format.";
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: errorMessage,
        products: [],
        source: 'offline',
        showOfflineButtons: true,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};