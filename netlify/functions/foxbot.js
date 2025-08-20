// Netlify Function for FOXBOT
// This replaces the Next.js API route and works with static export

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
- Keep responses to 1 sentence MAX
- NEVER make up contact info, phone numbers, or email addresses
- NEVER say "555" phone numbers or fake emails
- For contact requests say: "Use the contact buttons below to reach our team."

SPECIFIC RESPONSES (USE EXACTLY):
• "show"/"show me" → "Here's what we have."
• "chair"/"chairs" → "Here are our chairs."
• "desk"/"desks" → "Here are our desks."
• "catalog"/"catalogue" → "The catalog book is on the homepage."
• "contact"/"human"/"help"/"call" → "Use the contact buttons below to reach our team."
• "price"/"cost"/"cheap" → "Items start around $50. Catalog book items are 60% off list."

NEVER:
- List category names (Desks, Chairs, Storage, etc.)
- Make up phone numbers or emails
- Give long explanations
- Ask follow-up questions

Example responses:
User: "show me" → "Here's what we have."
User: "contact humans" → "Use the contact buttons below to reach our team."
User: "show me the catalog" → "The catalog book is on the homepage."`;

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
    
    // Check for price/budget inquiries
    const priceKeywords = ['price', 'prices', 'cost', 'cheap', 'cheapest', 'expensive', 'budget', 'affordable', 'dollar', '$', 'lowest', 'how much'];
    const isPriceInquiry = priceKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check for contact requests
    const contactKeywords = ['contact', 'call', 'phone', 'email', 'human', 'help', 'reach', 'talk', 'speak'];
    const isContactRequest = contactKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check for catalog requests
    const catalogKeywords = ['catalog', 'catalogue', 'booklet', 'brochure', 'pdf'];
    const isCatalogRequest = catalogKeywords.some(keyword => lowerMessage.includes(keyword));
    
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

    // Load real products from products.json structure
    let products = [];
    
    // Sample real products from your actual products.json
    const allProducts = {
      "chairs": [
        { id: 2, title: "Ergonomic Task Chair", image: "/images/product-2-1754595166035.jpg", description: "", features: ["Lumbar support", "Adjustable arms", "Breathable mesh"], category: "chairs" },
        { id: 11, title: "Mesh Back Task Chair", image: "/images/mesh backed confy chair.jpg", description: "", features: ["Ergonomic design", "Adjustable height", "360° swivel"], category: "chairs" },
        { id: 12, title: "Executive Leather Chair", image: "/images/DSCN1126 (1).jpg", description: "Premium leather executive seating", features: ["Premium leather", "High back design", "Padded armrests"], category: "chairs" }
      ],
      "desks": [
        { id: 1, title: "Executive Desk Series", image: "/images/desk grey L showroom.jpg", description: "", features: ["Solid wood construction", "Cable management", "5-year warranty"], category: "desks" },
        { id: 4, title: "Premium Desk Collection", image: "/images/light grey and walnut desks2.jpg", description: "", features: ["Modern design", "Spacious surface", "Built-in storage"], category: "desks" },
        { id: 9, title: "L-Shaped Executive Desk", image: "/images/u shaped dark cherry.jpg", description: "", features: ["U-shaped design", "Dark cherry finish", "Executive style"], category: "desks" }
      ],
      "storage": [
        { id: 5, title: "File Cabinet", image: "/images/greystorage.jpg", description: "", features: ["Lockable drawers", "Heavy duty", "Letter/Legal size"], category: "storage" },
        { id: 6, title: "Storage Cabinet", image: "/images/grey storage corner thingy.jpg", description: "", features: ["Corner design", "Multiple shelves", "Grey finish"], category: "storage" },
        { id: 7, title: "Mobile Pedestal", image: "/images/mobile pedestal grey.jpg", description: "", features: ["Mobile design", "3 drawers", "Lock included"], category: "storage" }
      ],
      "tables": [
        { id: 3, title: "Conference Table", image: "/images/tanconf.jpg", description: "", features: ["Seats 8-12", "Power integration", "Premium finishes"], category: "tables" },
        { id: 13, title: "Meeting Table", image: "/images/oval confernec tabel.jpg", description: "", features: ["Oval design", "Seats 6-8", "Cable management"], category: "tables" }
      ]
    };
    
    if (detectedCategory === 'chairs') {
      products = allProducts.chairs.slice(0, 3);
    } else if (detectedCategory === 'desks') {
      products = allProducts.desks.slice(0, 3);
    } else if (detectedCategory === 'storage') {
      products = allProducts.storage.slice(0, 3);
    } else if (detectedCategory === 'tables' || detectedCategory === 'conference') {
      products = allProducts.tables.slice(0, 2);
    } else if (detectedCategory === 'all' || isShowRequest) {
      // Show mix of products
      products = [
        allProducts.chairs[0],
        allProducts.desks[0],
        allProducts.storage[0],
        allProducts.tables[0]
      ].filter(p => p);
    }
    
    // Ensure products is always an array
    products = products || [];

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
        source: 'gemini',
        showCatalogButton: isPriceInquiry || isCatalogRequest,  // Shows "View Catalog Book" button
        showContactButtons: isPriceInquiry || isContactRequest  // Shows contact buttons
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