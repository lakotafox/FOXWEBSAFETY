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
    
    console.log('API Key check:', GEMINI_API_KEY ? 'Found' : 'Missing');
    
    // Check if API key is configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.error('GEMINI_API_KEY not configured or invalid');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "FOXBOT has gone offline. Please contact our team or return to the website.",
          products: [],
          source: 'offline',
          showOfflineButtons: true
        })
      };
    }

    // Gemini API configuration - using gemini-pro model
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // System prompt for FOXBOT
    const SYSTEM_PROMPT = `You are FOXBOT, the AI assistant for FoxBuilt Office Furniture.
    
Your personality:
- Professional yet friendly
- Knowledgeable about office furniture
- Helpful and solution-oriented
- Concise but informative

About FoxBuilt:
- Premium office furniture supplier
- Located in Utah
- Specializes in desks, chairs, storage, and complete office solutions
- Offers both new and refurbished furniture
- Known for quality and customer service

When answering:
1. Be helpful and specific about furniture recommendations
2. Mention product categories when relevant
3. Keep responses concise (2-3 sentences ideal)
4. Be enthusiastic about helping customers find the right furniture
5. If unsure, suggest contacting the team or visiting the showroom`;

    // Detect if user is asking about products
    const productKeywords = ['desk', 'chair', 'table', 'storage', 'cabinet', 'furniture', 'office', 'cubicle', 'standing', 'seating'];
    const shouldSearchProducts = productKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    ) && !message.toLowerCase().includes('stop');

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

    // For now, return empty products array
    // In production, you'd search your products database here
    const products = [];

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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: "FOXBOT has gone offline. Please contact our team or return to the website.",
        products: [],
        source: 'offline',
        showOfflineButtons: true
      })
    };
  }
};