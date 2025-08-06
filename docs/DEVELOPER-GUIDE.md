# FoxBuilt Website - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Key Components](#key-components)
5. [Editor System](#editor-system)
6. [Image Management](#image-management)
7. [GitHub Integration](#github-integration)
8. [Deployment](#deployment)

## Project Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript
- **Image Storage**: GitHub Repository
- **Deployment**: Netlify
- **Email**: EmailJS

### Key Features
- Content Management System (CMS) for non-technical users
- Real-time image cropping and positioning
- GitHub-based content publishing
- Three product categories with 27 total products
- Interactive games section (Snake, Pong, Galaga)

## Architecture

### Page Structure
```
/ (Main page)
├── /carrie (Main editor - password protected)
├── /products (Products display page)
├── /products-editor (Products editor)
├── /games (Games selection + 3 games)
└── /pages/about-us (Static about page)
```

### Component Architecture
- **Shared components** in `/components/sections/`
- **Editor-specific components** in `/components/carrie/` and `/components/products-editor/`
- **UI primitives** in `/components/ui/` (shadcn/ui)
- **Utility functions** in `/lib/utils/`

## File Structure

```
foxbuilt-websiteFOX/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── carrie/                   # Main editor
│   │   ├── page.tsx              # Password-protected editor
│   │   └── layout.tsx
│   ├── products/                 
│   │   └── page.tsx              # Products display (851 lines)
│   ├── products-editor/
│   │   └── page.tsx              # Products editor (699 lines)
│   └── games/
│       ├── page.tsx              # Game selection (219 lines)
│       ├── snake/SnakeGame.tsx   # Snake game (206 lines)
│       ├── pong/PongGame.tsx     # Pong game (216 lines)
│       └── galaga/GalagaGame.tsx # Galaga game (351 lines)
│
├── components/
│   ├── sections/                 # Shared page sections
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── GallerySection.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ContactSection.tsx
│   │   └── Footer.tsx
│   ├── carrie/                   # Main editor components
│   │   ├── auth/PasswordScreen.tsx
│   │   ├── sections/             # Editor-specific sections
│   │   ├── hooks/useCropControls.ts
│   │   └── services/             # GitHub & image services
│   ├── products-editor/          # Products editor components
│   │   ├── ui/
│   │   │   ├── ProductCard.tsx   # Reusable product card (183 lines)
│   │   │   ├── EditableField.tsx # Reusable edit field
│   │   │   └── CategoryButtons.tsx
│   │   └── constants/default-products.ts
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   └── utils/
│       ├── imageTransform.ts     # Image crop calculations
│       └── categoryColors.ts     # Category color mapping
│
└── public/
    ├── images/                   # Product & gallery images
    ├── icons/                    # UI icons
    └── sounds/                   # Game sound effects
```

## Key Components

### Main Page (`app/page.tsx`)
- **Lines**: 310
- **Sections**: Header, Hero, Gallery, Featured Products, About, Contact
- **Features**: Auto-rotating gallery, EmailJS contact form

### Carrie Editor (`app/carrie/page.tsx`)
- **Lines**: 445
- **Purpose**: Main content editor for Kyle
- **Features**: 
  - Password protection ("foxbuilt@editor99")
  - Gallery image management
  - Featured products editing
  - Live preview
  - GitHub publishing

### Products Editor (`app/products-editor/page.tsx`)
- **Lines**: 699 (reduced from 1,359)
- **Features**:
  - Edit 27 products across 3 categories
  - Image upload with crop controls
  - Uses reusable ProductCard component
  - Auto-save to localStorage

### ProductCard Component (`components/products-editor/ui/ProductCard.tsx`)
- **Lines**: 183
- **Reusable**: Handles all product editing logic
- **Features**: Image upload, crop controls, inline editing

### Games System
- **Selection Screen**: Classic easter egg with "CLICK ME!" button
- **Games**: Snake, Pong, Galaga extracted to separate files
- **Audio**: Windows error sounds, shutdown sounds

## Editor System

### Authentication
- Simple password protection: "foxbuilt@editor99"
- No user accounts or sessions
- Password stored in component state

### Content Storage
1. **Local Storage**: Draft changes saved locally
2. **GitHub**: Published content saved to `public/content.json` and `products.json`
3. **Images**: Uploaded to GitHub `public/images/`

### Image Cropping
- Custom zoom/pan controls using arrow keys and scroll
- Settings saved per image
- Visual lock/unlock indicators

## Image Management

### Upload Flow
1. User selects image → converted to base64
2. Uploaded to GitHub via API
3. Temporary preview shown until deployment
4. Crop settings saved separately

### Limits
- GitHub repo limit: 5GB recommended
- Individual file: 100MB max
- API rate: 5,000 requests/hour
- Netlify bandwidth: 100GB/month (free tier)

## GitHub Integration

### Configuration
```typescript
// components/carrie/constants/editor-constants.ts
export const GITHUB_CONFIG = {
  OWNER: 'lakotafox',
  REPO: 'FOXSITE',
  TOKEN: process.env.NEXT_PUBLIC_GITHUB_TOKEN
}
```

### Publishing Process
1. Content saved to `content.json` or `products.json`
2. Images uploaded to `public/images/`
3. Git commit created via GitHub API
4. Netlify auto-deploys on commit

## Deployment

### Build Command
```bash
npm run build
```

### Environment Variables
```
NEXT_PUBLIC_GITHUB_TOKEN=github_pat_xxx
```

### Netlify Configuration
- Auto-deploy from GitHub main branch
- Build command: `npm run build`
- Publish directory: `out`

## Common Tasks

### Adding a New Product Category
1. Update `defaultProductsPageItems` in constants
2. Add category to `CategoryButtons` component
3. Update color mapping in `categoryColors.ts`

### Modifying Editor Sections
1. Main page sections in `/components/carrie/sections/`
2. Products use `/components/products-editor/ui/ProductCard.tsx`
3. All sections follow similar edit/save pattern

### Debugging Image Issues
1. Check browser console for upload errors
2. Verify GitHub token is valid
3. Check image file size (<2MB recommended)
4. Ensure proper file extension

## Performance Considerations
- Images served from GitHub raw URLs in dev
- Netlify CDN in production
- Lazy loading for gallery images
- Local storage for draft content

## Security Notes
- GitHub token exposed in client (required for direct uploads)
- No user authentication beyond password
- All content publicly accessible
- Editor routes not protected by middleware