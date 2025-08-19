# FOXBOT Setup with Google Gemini AI

## Quick Setup (5 minutes)

### 1. Get Your Free Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Add API Key to Your Project

Create a `.env.local` file in your project root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` and add your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_USE_GEMINI=true
```

### 3. Restart Your Development Server

```bash
npm run dev
```

## How It Works

- **Google Gemini Pro** provides intelligent AI responses
- **FREE** for up to 60 requests per minute
- Perfect for sites with <1000 users/month
- Automatic fallback to built-in responses if API fails

## Features

FOXBOT with Gemini can:
- Have natural conversations about furniture
- Understand context and intent
- Provide personalized recommendations
- Answer complex questions
- Remember conversation context

## Deployment to Netlify

1. In Netlify dashboard, go to Site Settings > Environment Variables
2. Add:
   - Key: `GEMINI_API_KEY`
   - Value: Your API key
3. Deploy your site

## Cost

- **Your usage (60 users/month)**: FREE
- **Rate limit**: 60 requests/minute
- **No credit card required**

## Testing FOXBOT

Visit `/foxbot` on your site to test:

1. Try: "Hello"
2. Try: "I need a standing desk"
3. Try: "What's your warranty?"
4. Try: "Tell me about office chairs"

## Troubleshooting

If FOXBOT isn't using Gemini:
1. Check `.env.local` has the correct API key
2. Verify API key works at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Check browser console for errors
4. FOXBOT will automatically fall back to built-in responses if Gemini fails

## Monitor Usage

Check your usage at: https://makersuite.google.com/app/apikey

You're using less than 1% of the free tier!