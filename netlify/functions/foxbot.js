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

    // Get site URL for loading JSON files
    const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'https://foxbuilt.netlify.app';
    
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

    // Try to load custom category names from the site
    let customCategoryNames = null;
    try {
      const namesResponse = await fetch(`${SITE_URL}/category-names.json`);
      if (namesResponse.ok) {
        customCategoryNames = await namesResponse.json();
        console.log('Loaded custom category names');
      }
    } catch (e) {
      console.log('No custom category names found, using defaults');
    }
    
    // Comprehensive fallback keywords for each subcategory
    const FALLBACK_KEYWORDS = {
      // Desks & Workstations
      'executive-desks': ['executive', 'manager', 'exec', 'private', 'luxury', 'office', 'corporate', 'high-end', 'deluxe', 'professional', 'leadership', 'premium', 'work', 'authority', 'leadership desk', 'director', 'manager station', 'business', 'professional desk', 'formal', 'elite', 'office setup', 'admin', 'chief', 'decision-maker', 'manager area'],
      'computer-desks': ['computer', 'workstation', 'pc', 'laptop', 'tech', 'home office', 'office desk', 'IT', 'setup', 'coding', 'programming', 'study', 'typing', 'home workstation', 'desk station', 'computing', 'desk setup', 'developer', 'computer setup', 'digital', 'office tech', 'keyboard', 'monitor area', 'work setup', 'coder'],
      'standing-desks': ['standing', 'sit-stand', 'adjustable', 'height adjustable', 'ergonomic', 'electric', 'manual', 'tall', 'flexible', 'healthy posture', 'office wellness', 'convertible', 'adjustable height', 'health', 'posture', 'motion', 'active', 'flexible desk', 'wellness', 'movement', 'sit stand', 'active workstation', 'adjustable setup', 'dynamic', 'vertical desk'],
      'modular-benching': ['benching', 'modular', 'team', 'collaborative', 'open office', 'pod', 'shared desk', 'flexible layout', 'reconfigurable', 'group workspace', 'cluster', 'workstation cluster', 'multi-person', 'team station', 'group setup', 'configurable', 'cluster desk', 'pod setup', 'collaborative desk', 'open layout', 'flexible seating', 'team workspace', 'project desk', 'shared space', 'office pod'],
      
      // Cubicles
      'cubicle-workstations': ['cubicle', 'cube', 'workstation', 'pod', 'office pod', 'modular', 'partitioned', 'employee space', 'individual workspace', 'open office pod', 'compact workstation', 'small office', 'desk pod', 'workstation module', 'personal space', 'office setup', 'separated desk', 'compact area', 'isolated workspace', 'work pod', 'station', 'office cubicle', 'individual station', 'pod cluster', 'employee station'],
      'panel-systems': ['panel', 'partition', 'divider', 'wall', 'modular panel', 'acoustic panel', 'privacy panel', 'office partition', 'cubicle wall', 'separator', 'room divider', 'sound panel', 'workstation divider', 'office section', 'workspace divider', 'modular wall', 'office barrier', 'partition system', 'space divider', 'work area divider', 'privacy', 'panel setup', 'office split', 'cubicle section', 'divider system'],
      'modular-cubicles': ['modular', 'flexible', 'cube', 'configurable', 'reconfigurable', 'adjustable', 'office pod', 'workstation module', 'cluster', 'office cluster', 'team station', 'collaborative pod', 'adaptive', 'flexible workstation', 'cluster setup', 'workspace pod', 'cubicle cluster', 'pod system', 'reconfig desk', 'multi-desk setup', 'office modules', 'team pod', 'cluster desk', 'flexible area', 'modular team', 'adaptable pod'],
      'privacy-screens': ['privacy', 'screen', 'partition', 'divider', 'shield', 'office screen', 'desk screen', 'room divider', 'panel', 'workstation shield', 'cubicle privacy', 'acoustic screen', 'personal space', 'visual barrier', 'privacy wall', 'individual partition', 'workspace screen', 'cubicle shield', 'private area', 'office partition', 'workstation divider', 'screen panel', 'visual divider', 'private pod', 'work shield'],
      
      // Seating
      'task-chairs': ['task', 'office', 'operator', 'swivel', 'adjustable', 'ergonomic', 'rolling', 'mesh', 'work chair', 'desk chair', 'standard', 'mid-back', 'flexible', 'movable', 'rotatable', 'office seating', 'chair station', 'work seating', 'sit', 'user chair', 'daily chair', 'professional chair', 'task seating', 'swivel seat', 'adjustable station', 'workstation chair', 'operator seat'],
      'executive-chairs': ['executive', 'manager', 'leather', 'high-back', 'premium', 'luxury', 'comfort', 'swivel', 'ergonomic', 'posture', 'leadership', 'deluxe', 'formal', 'director', 'office leader', 'office seat', 'high-end chair', 'professional chair', 'authority chair', 'swivel executive', 'leadership seat', 'managerial', 'deluxe seating', 'business chair', 'executive station', 'office leadership', 'office desk seat'],
      'conference-chairs': ['conference', 'meeting', 'boardroom', 'guest', 'swivel', 'stacking', 'armchair', 'seating', 'professional', 'ergonomic', 'visitor', 'team', 'group', 'collaboration', 'meeting space', 'office gathering', 'teamwork chair', 'assembly', 'session', 'workshop', 'collaboration seating', 'conference room', 'board', 'conference desk seat', 'meeting arrangement', 'group seat'],
      'drafting-stools': ['drafting', 'stool', 'tall', 'adjustable', 'drafting chair', 'swivel', 'counter', 'high', 'ergonomic', 'sit-stand', 'laboratory', 'workbench', 'elevated', 'design', 'drawing', 'drafting seat', 'project', 'studio', 'workstation stool', 'design chair', 'drafting station', 'drawing stool', 'tall seating', 'high desk seat', 'elevated chair'],
      'ergonomic-seating': ['ergonomic', 'comfort', 'posture', 'support', 'adjustable', 'mesh', 'office chair', 'lumbar support', 'healthy', 'professional', 'wellness', 'desk chair', 'correct posture', 'supportive', 'spine support', 'user-friendly', 'flexible seating', 'office wellness', 'desk support', 'ergonomic desk', 'seating support', 'posture aid', 'work seating', 'office comfort', 'wellness chair', 'healthy sitting'],
      
      // Storage
      'filing-cabinets': ['filing', 'file', 'drawer', 'vertical', 'lateral', 'office storage', 'secure', 'lockable', 'document', 'cabinet', 'organization', 'archive', 'paperwork', 'record', 'file station', 'workspace storage', 'document storage', 'office files', 'filing setup', 'document organizer', 'cabinet drawers', 'office organization', 'files', 'storage drawers', 'document management', 'archive station'],
      'shelving-units': ['shelf', 'shelving', 'rack', 'storage', 'modular', 'adjustable', 'open', 'unit', 'display', 'organizational', 'multi-tier', 'office shelves', 'storage rack', 'shelf system', 'stackable', 'workspace organizer', 'shelf setup', 'storage setup', 'shelving system', 'open shelves', 'office unit', 'display rack', 'multi-shelf', 'storage organization', 'rack setup'],
      'bookcases': ['bookcase', 'bookshelf', 'library', 'wall shelf', 'storage', 'display', 'modular', 'freestanding', 'open', 'organizer', 'media', 'reading', 'office library', 'book storage', 'shelf unit', 'literature', 'collection', 'reference', 'archive', 'library organizer', 'display shelves', 'bookshelf setup', 'personal library', 'shelving unit', 'reading station'],
      'lockers': ['locker', 'storage', 'personal', 'secure', 'compartment', 'employee', 'cubby', 'office', 'gym', 'individual', 'organized', 'personal space', 'belongings', 'cubicle locker', 'private storage', 'work locker', 'assigned space', 'secured', 'compartmental', 'office locker', 'user storage', 'private locker', 'workspace locker', 'storage unit', 'assigned locker'],
      'credenzas': ['credenza', 'sideboard', 'cabinet', 'storage', 'low-profile', 'modular', 'buffet', 'drawer', 'console', 'organizational', 'office unit', 'filing', 'storage station', 'office side', 'workspace storage', 'side cabinet', 'office credenza', 'console unit', 'cabinet setup', 'storage organizer', 'low cabinet', 'desk side storage', 'multi-drawer', 'organizational unit', 'side station'],
      
      // Conference & Meeting
      'conference-tables': ['conference', 'boardroom', 'meeting', 'large', 'collaborative', 'professional', 'executive', 'teamwork', 'modular', 'rectangular', 'round', 'team', 'session', 'gathering', 'group', 'project table', 'office meeting', 'roundtable', 'workspace table', 'collaboration table', 'team station', 'desk cluster', 'discussion table', 'conference setup', 'assembly', 'collaboration'],
      'meeting-chairs': ['meeting', 'guest', 'visitor', 'armchair', 'office', 'conference', 'stacking', 'seating', 'ergonomic', 'swivel', 'boardroom', 'professional', 'session', 'gathering', 'team seating', 'collaboration chair', 'office gathering', 'group seating', 'conference room', 'visitor chair', 'office assembly', 'teamwork chair', 'project chair', 'conference arrangement', 'board meeting'],
      'collaborative-tables': ['collaborative', 'team', 'group', 'modular', 'meeting', 'shared', 'work', 'project', 'rectangular', 'round', 'flexible', 'open office', 'teamwork', 'cluster', 'co-working', 'office collaboration', 'joint table', 'shared workspace', 'session', 'workshop', 'task table', 'joint desk', 'project desk', 'team desk', 'cluster table', 'group workspace'],
      'av-carts': ['av', 'media', 'rolling', 'presentation', 'tech', 'audio visual', 'projector', 'equipment', 'cart', 'mobile', 'multimedia', 'stand', 'display', 'presentation equipment', 'tech station', 'projector setup', 'mobile AV', 'media setup', 'audio station', 'visual equipment', 'presentation station', 'AV setup', 'display cart', 'media stand', 'AV station', 'mobile tech'],
      
      // Reception & Lounge
      'reception-desks': ['reception', 'front desk', 'lobby', 'welcome', 'check-in', 'office', 'greeting', 'counter', 'modular', 'professional', 'concierge', 'service', 'entrance', 'reception area', 'welcome station', 'office reception', 'lobby area', 'desk station', 'greeting area', 'front', 'service counter', 'visitor desk', 'entrance desk', 'reception station', 'lobby counter', 'check-in station'],
      'sofas': ['sofa', 'couch', 'sectional', 'lounge', 'seating', 'modular', 'corner', 'loveseat', 'comfortable', 'sitting', 'lounge area', 'reception seating', 'relaxation', 'lounge station', 'group seating', 'office lounge', 'waiting area', 'casual seating', 'guest seating', 'lounge space', 'sofa station', 'seating area', 'comfort', 'lounge setup', 'reception area', 'sitting space'],
      'lounge-chairs': ['lounge', 'armchair', 'club chair', 'seating', 'modern', 'office', 'reception', 'comfortable', 'swivel', 'guest', 'visitor', 'casual', 'sitting', 'lobby', 'relaxation', 'lounge area', 'personal chair', 'office lounge', 'reception seating', 'arm', 'chair station', 'solo seating', 'lounge setup', 'guest seat', 'visitor chair', 'lounge space'],
      'coffee-tables': ['coffee', 'center', 'table', 'lounge', 'side', 'accent', 'modular', 'reception', 'casual', 'low', 'centerpiece', 'lounge table', 'table station', 'meeting table', 'sitting area', 'group table', 'collaborative', 'casual setup', 'lounge centerpiece', 'office lounge', 'central table', 'casual table', 'seating table', 'group setup', 'coffee area', 'center station'],
      'side-tables': ['side', 'end', 'accent', 'table', 'lounge', 'reception', 'small', 'modular', 'corner', 'display', 'occasional', 'auxiliary', 'companion', 'desk side', 'lounge setup', 'group', 'personal', 'workspace', 'adjunct', 'accessory table', 'table station', 'support', 'nearby', 'utility', 'small surface', 'secondary', 'auxiliary table']
    };
    
    // Build dynamic keywords based on actual category names PLUS fallbacks
    const buildKeywordsFromNames = (categoryIds, customNames) => {
      const keywords = [];
      
      // Add custom subcategory names as keywords
      if (customNames && customNames.subcategories) {
        categoryIds.forEach(id => {
          if (customNames.subcategories[id]) {
            const customName = customNames.subcategories[id].toLowerCase();
            keywords.push(customName);
            // Also add individual words from the custom name
            customName.split(' ').forEach(word => {
              if (word.length > 2 && !keywords.includes(word)) {
                keywords.push(word);
              }
            });
          }
        });
      }
      
      // Add fallback keywords for each category
      categoryIds.forEach(id => {
        if (FALLBACK_KEYWORDS[id]) {
          FALLBACK_KEYWORDS[id].forEach(keyword => {
            if (!keywords.includes(keyword.toLowerCase())) {
              keywords.push(keyword.toLowerCase());
            }
          });
        }
      });
      
      return keywords;
    };
    
    // Enhanced product detection with ALL categories and subcategories
    const chairCategories = ['task-chairs', 'executive-chairs', 'conference-chairs', 'drafting-stools', 'ergonomic-seating'];
    const deskCategories = ['executive-desks', 'computer-desks', 'standing-desks', 'modular-benching'];
    
    const PRODUCT_CATEGORIES = {
      chairs: {
        keywords: buildKeywordsFromNames(chairCategories, customCategoryNames),
        categories: chairCategories,
        response: customCategoryNames?.subcategories ? 
          chairCategories.map(id => customCategoryNames.subcategories[id] || id).join(', ') :
          "Task Chairs, Executive Chairs, Conference Chairs, Drafting Stools, Ergonomic Seating"
      },
      desks: {
        keywords: buildKeywordsFromNames(deskCategories, customCategoryNames),
        categories: deskCategories,
        response: customCategoryNames?.subcategories ?
          deskCategories.map(id => customCategoryNames.subcategories[id] || id).join(', ') :
          "Executive Desks, Computer Desks, Standing Desks, Modular Benching Systems"
      },
      storage: {
        keywords: buildKeywordsFromNames(
          ['filing-cabinets', 'shelving-units', 'bookcases', 'lockers', 'credenzas'],
          customCategoryNames
        ),
        categories: ['filing-cabinets', 'shelving-units', 'bookcases', 'lockers', 'credenzas'],
        response: customCategoryNames?.subcategories ?
          ['filing-cabinets', 'shelving-units', 'bookcases', 'lockers', 'credenzas'].map(id => customCategoryNames.subcategories[id] || id).join(', ') :
          "Filing Cabinets, Shelving Units, Bookcases, Lockers, Credenzas"
      },
      tables: {
        keywords: buildKeywordsFromNames(
          ['conference-tables', 'collaborative-tables', 'coffee-tables', 'side-tables'],
          customCategoryNames
        ),
        categories: ['conference-tables', 'collaborative-tables', 'coffee-tables', 'side-tables'],
        response: customCategoryNames?.subcategories ?
          ['conference-tables', 'collaborative-tables', 'coffee-tables', 'side-tables'].map(id => customCategoryNames.subcategories[id] || id).join(', ') :
          "Conference Tables, Collaborative Tables, Coffee Tables, Side Tables"
      },
      cubicles: {
        keywords: buildKeywordsFromNames(
          ['cubicle-workstations', 'panel-systems', 'modular-cubicles', 'privacy-screens'],
          customCategoryNames
        ),
        categories: ['cubicle-workstations', 'panel-systems', 'modular-cubicles', 'privacy-screens'],
        response: customCategoryNames?.subcategories ?
          ['cubicle-workstations', 'panel-systems', 'modular-cubicles', 'privacy-screens'].map(id => customCategoryNames.subcategories[id] || id).join(', ') :
          "Cubicle Workstations, Panel Systems, Modular Cubicles, Privacy Screens"
      },
      conference: {
        keywords: buildKeywordsFromNames(
          ['conference-tables', 'meeting-chairs', 'collaborative-tables', 'av-carts'],
          customCategoryNames
        ),
        categories: ['conference-tables', 'meeting-chairs', 'collaborative-tables', 'av-carts'],
        response: customCategoryNames?.subcategories ?
          ['conference-tables', 'meeting-chairs', 'collaborative-tables', 'av-carts'].map(id => customCategoryNames.subcategories[id] || id).join(', ') :
          "Conference Tables, Meeting Room Chairs, Collaborative Tables, AV Carts"
      },
      reception: {
        keywords: buildKeywordsFromNames(
          ['reception-desks', 'sofas', 'lounge-chairs', 'coffee-tables', 'side-tables'],
          customCategoryNames
        ),
        categories: ['reception-desks', 'sofas', 'lounge-chairs', 'coffee-tables', 'side-tables'],
        response: customCategoryNames?.subcategories ?
          ['reception-desks', 'sofas', 'lounge-chairs', 'coffee-tables', 'side-tables'].map(id => customCategoryNames.subcategories[id] || id).join(', ') :
          "Reception Desks, Sofas, Lounge Chairs, Coffee Tables, Side Tables"
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
    
    // Check for SERVICES (moving, selling, space planning)
    const movingKeywords = ['move furniture', 'moving help', 'office move', 'relocation services', 'shift office', 'move desks', 'move chairs', 'move equipment', 'office relocation', 'rearrange furniture', 'relocate furniture', 'move workstations', 'move cubicles', 'office setup change', 'desk move', 'chair move', 'reconfigure layout', 'move conference tables', 'move storage units', 'move lounge furniture', 'furniture relocation'];
    const isMovingRequest = movingKeywords.some(keyword => lowerMessage.includes(keyword));
    
    const sellingKeywords = ['sell furniture', 'buy used furniture', 'trade furniture', 'resale office furniture', 'office furniture for sale', 'dispose furniture', 'sell desks', 'sell chairs', 'sell cubicles', 'sell storage units', 'sell conference tables', 'sell lounge furniture', 'sell office setup', 'furniture buyback', 'office liquidation', 'surplus furniture', 'used office furniture', 'recycle office furniture', 'sell AV carts', 'sell task chairs'];
    const isSellingRequest = sellingKeywords.some(keyword => lowerMessage.includes(keyword));
    
    const spacePlanningKeywords = ['office design', 'space planning', 'interior layout', 'workspace planning', 'office layout help', 'floor plan setup', 'office redesign', 'office reconfiguration', 'space optimization', 'desk layout planning', 'cubicle layout design', 'collaborative space planning', 'conference room design', 'lounge layout', 'reception layout planning', 'office workflow design', 'open office planning', 'furniture layout assistance', 'office interior consulting', 'workplace design services'];
    const isSpacePlanningRequest = spacePlanningKeywords.some(keyword => lowerMessage.includes(keyword));
    
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

    // Load real products from published JSON files
    let products = [];
    let allProducts = {};
    
    try {
      // Try to load from multiple sources
      const productSources = [
        `${SITE_URL}/products.json`,
        `${SITE_URL}/main-products.json`,
        `${SITE_URL}/content.json`
      ];
      
      let loadedProducts = {};
      
      // Try each source
      for (const source of productSources) {
        try {
          const response = await fetch(source);
          if (response.ok) {
            const data = await response.json();
            if (data.products) {
              // Merge products from this source
              Object.keys(data.products).forEach(category => {
                if (!loadedProducts[category]) {
                  loadedProducts[category] = [];
                }
                if (Array.isArray(data.products[category])) {
                  loadedProducts[category].push(...data.products[category]);
                }
              });
            }
          }
        } catch (e) {
          console.log(`Could not load from ${source}:`, e.message);
        }
      }
      
      // Process loaded products into categories
      allProducts = {
        chairs: [],
        desks: [],
        storage: [],
        tables: [],
        cubicles: [],
        reception: []
      };
      
      // Map various category names to our standard categories
      // This mapping handles all the categories from the products editor
      const categoryMappings = {
        // Main page categories
        'new': 'mixed',
        'battleTested': 'mixed',
        'seating': 'chairs',
        
        // Desks & Workstations
        'executiveDesks': 'desks',
        'executive-desks': 'desks',
        'computer-desks': 'desks',
        'standing-desks': 'desks',
        'modular-benching': 'desks',
        'modularBenching': 'desks',
        
        // Cubicles
        'cubicle-workstations': 'cubicles',
        'panel-systems': 'cubicles',
        'modular-cubicles': 'cubicles',
        'privacy-screens': 'cubicles',
        
        // Seating
        'task-chairs': 'chairs',
        'executive-chairs': 'chairs',
        'conference-chairs': 'chairs',
        'drafting-stools': 'chairs',
        'ergonomic-seating': 'chairs',
        
        // Storage
        'filing-cabinets': 'storage',
        'shelving-units': 'storage',
        'bookcases': 'storage',
        'lockers': 'storage',
        'credenzas': 'storage',
        
        // Conference & Meeting
        'conference-tables': 'tables',
        'meeting-chairs': 'chairs',
        'collaborative-tables': 'tables',
        'av-carts': 'tables',
        
        // Reception & Lounge
        'reception-desks': 'reception',
        'sofas': 'reception',
        'lounge-chairs': 'reception',
        'coffee-tables': 'reception',
        'side-tables': 'reception'
      };
      
      Object.keys(loadedProducts).forEach(category => {
        const mappedCategory = categoryMappings[category] || category;
        
        loadedProducts[category].forEach(product => {
          // Try to determine category from product title or features
          let targetCategory = mappedCategory;
          
          if (targetCategory === 'mixed') {
            const title = (product.title || '').toLowerCase();
            const features = (product.features || []).join(' ').toLowerCase();
            const combined = title + ' ' + features;
            
            if (combined.includes('chair') || combined.includes('seating')) {
              targetCategory = 'chairs';
            } else if (combined.includes('desk') || combined.includes('workstation')) {
              targetCategory = 'desks';
            } else if (combined.includes('storage') || combined.includes('cabinet') || combined.includes('filing')) {
              targetCategory = 'storage';
            } else if (combined.includes('table') || combined.includes('conference')) {
              targetCategory = 'tables';
            } else {
              targetCategory = 'desks'; // Default fallback
            }
          }
          
          if (allProducts[targetCategory]) {
            allProducts[targetCategory].push({
              ...product,
              category: targetCategory
            });
          }
        });
      });
      
      // Remove duplicates based on title
      Object.keys(allProducts).forEach(category => {
        const seen = new Set();
        allProducts[category] = allProducts[category].filter(product => {
          const key = product.title;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
      
      console.log('Loaded products:', Object.keys(allProducts).map(cat => `${cat}: ${allProducts[cat].length}`).join(', '));
      
    } catch (error) {
      console.error('Error loading products from JSON:', error);
      // Fallback to some default products if loading fails
      allProducts = {
        chairs: [
          { id: 1, title: "Executive Chair", image: "/images/showroom-1.jpg", description: "", features: ["Ergonomic design", "Premium quality", "5-year warranty"], category: "chairs" }
        ],
        desks: [
          { id: 2, title: "Executive Desk", image: "/images/desk grey L showroom.jpg", description: "", features: ["Solid construction", "Cable management", "Modern design"], category: "desks" }
        ],
        storage: [
          { id: 3, title: "Storage Cabinet", image: "/images/showroom-2.jpg", description: "", features: ["Locking drawers", "Durable design", "Multiple sizes"], category: "storage" }
        ],
        tables: [
          { id: 4, title: "Conference Table", image: "/images/tanconf.jpg", description: "", features: ["Seats 8-12", "Premium finish", "Power integration"], category: "tables" }
        ],
        cubicles: [
          { id: 5, title: "Modular Cubicle", image: "/images/showroom-1.jpg", description: "", features: ["Flexible configuration", "Privacy panels", "Cable management"], category: "cubicles" }
        ],
        reception: [
          { id: 6, title: "Reception Desk", image: "/images/reception tan.jpg", description: "", features: ["ADA compliant", "Storage included", "Professional design"], category: "reception" }
        ]
      };
    }
    
    if (detectedCategory === 'chairs') {
      products = allProducts.chairs.slice(0, 3);
    } else if (detectedCategory === 'desks') {
      products = allProducts.desks.slice(0, 3);
    } else if (detectedCategory === 'storage') {
      products = allProducts.storage.slice(0, 3);
    } else if (detectedCategory === 'tables' || detectedCategory === 'conference') {
      products = allProducts.tables.slice(0, 3);
    } else if (detectedCategory === 'cubicles') {
      products = allProducts.cubicles.slice(0, 3);
    } else if (detectedCategory === 'reception') {
      products = allProducts.reception.slice(0, 3);
    } else if (detectedCategory === 'all' || isShowRequest) {
      // Show mix of products from all categories
      products = [
        allProducts.chairs[0],
        allProducts.desks[0],
        allProducts.storage[0],
        allProducts.tables[0],
        allProducts.cubicles[0],
        allProducts.reception[0]
      ].filter(p => p);
    }
    
    // Ensure products is always an array
    products = products || [];
    
    // Handle SERVICE requests with specific responses
    let serviceResponse = null;
    
    if (isMovingRequest) {
      serviceResponse = "We offer professional furniture moving and relocation services. Our team can help with office moves, reconfiguration, and setup. Contact us at (877) 769-3768 for a quote.";
      products = []; // Don't show products for service requests
    } else if (isSellingRequest) {
      serviceResponse = "We buy and sell quality used office furniture! We offer furniture buyback, liquidation services, and have a large selection of pre-owned items. Call (877) 769-3768 to discuss options.";
      products = []; // Don't show products for service requests
    } else if (isSpacePlanningRequest) {
      serviceResponse = "Our space planning experts can help design your perfect office layout. We offer professional consultation for workspace optimization and furniture arrangement. Contact us at (877) 769-3768 to schedule.";
      products = []; // Don't show products for service requests
    }
    
    // If we have a service response, use it directly without calling Gemini
    if (serviceResponse) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: serviceResponse,
          products: products,
          source: 'foxbot'
        })
      };
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