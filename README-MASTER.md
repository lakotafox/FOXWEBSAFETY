# FoxBuilt Website - Master Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Analysis](#architecture-analysis)
3. [File Structure Breakdown](#file-structure-breakdown)
4. [Major Components Deep Dive](#major-components-deep-dive)
5. [Data Flow and State Management](#data-flow-and-state-management)
6. [Authentication & Security](#authentication--security)
7. [Image Management System](#image-management-system)
8. [GitHub Integration](#github-integration)
9. [Build & Deployment](#build--deployment)
10. [Known Issues & Technical Debt](#known-issues--technical-debt)
11. [Refactoring Plan](#refactoring-plan)
12. [File/Folder Structure Recommendations](#filefolder-structure-recommendations)

## Project Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17 + Radix UI components
- **State Management**: React hooks (useState, useEffect, useRef)
- **Deployment**: Netlify (static export)
- **Version Control**: GitHub (lakotafox/FOXSITE)
- **Content Storage**: GitHub as CMS via API

### Key Statistics
- **Total Lines of Code**: ~8,000+ (main components)
- **Primary Files**: 
  - `/app/page.tsx` (747 lines) - Main homepage
  - `/app/carrie/page.tsx` (1,873 lines) - Admin editor
  - `/app/products-editor/page.tsx` (1,406 lines) - Products editor
  - `/app/products/page.tsx` (864 lines) - Products display
- **Component Library**: 50+ shadcn/ui components imported but only ~10 used

## Architecture Analysis

### Current Architecture Issues
1. **Monolithic Components**: Most pages are single massive files (500-1,800+ lines)
2. **Duplicate Code**: Similar functionality repeated across editors
3. **Mixed Concerns**: Business logic, UI, and data fetching in same components
4. **No Component Reuse**: Common patterns copy-pasted instead of abstracted
5. **Inconsistent State Management**: Mix of localStorage, sessionStorage, and GitHub

### Data Flow
```
User → Next.js Pages → React Components → GitHub API / localStorage
                                      ↓
                              public/content.json
                                      ↓
                              Netlify Build → Live Site
```

## File Structure Breakdown

### `/app` Directory (Next.js App Router)
- **page.tsx** (747 lines) - Homepage with hero, gallery, featured products, about, contact
- **layout.tsx** - Root layout with Geist fonts
- **globals.css** - Tailwind imports
- **/carrie/**
  - **page.tsx** (1,873 lines) - Main admin editor with authentication
- **/products/**
  - **page.tsx** (864 lines) - Products catalog page
- **/products-editor/**
  - **page.tsx** (1,406 lines) - Products page editor
- **/games/**
  - **page.tsx** - Hidden games page (Snake, Pong, Galaga)
- **/collections/all/** - Unused page
- **/pages/about-us/** - Unused page

### `/components` Directory
- **ui/** - 50+ shadcn components (most unused)
- Only actively used: Button, Card, Badge, Input, Textarea

### `/lib` Directory
- **products-data.ts** - Default product data and localStorage helpers
- **utils.ts** - Tailwind merge utility

### `/public` Directory
- **content.json** - Published site content
- **draft.json** - Draft content (unused in current implementation)
- **images/** - Product and gallery images
- **catolog no page one.pdf** - Product catalog PDF

### `/admin` Directory
- Legacy HTML/JS admin interface (appears unused)

## Major Components Deep Dive

### 1. Main Homepage (`/app/page.tsx`)
**Responsibilities**:
- Hero section with company branding
- Auto-sliding image gallery
- Featured products display (3 categories)
- About section with founder story
- Contact form with EmailJS integration
- Floating action buttons (desktop)
- Responsive header

**Key Features**:
- Dynamic header sizing on scroll
- Image crop/zoom controls
- Category-based product filtering
- Address reveal interaction

**State Management**:
```typescript
- isScrolled: boolean
- currentSlide: number (gallery)
- featuredCategory: string
- featuredProducts: object
- formData: object
- cropSettings: object
- galleryCrops: object
```

### 2. Admin Editor (`/app/carrie/page.tsx`)
**Complexity**: 1,873 lines - NEEDS MAJOR REFACTORING

**Features**:
- Password authentication ("foxbuilt2025")
- Page selection (main vs products editor)
- Live preview of main site
- Image upload to GitHub
- Crop/zoom controls for images
- Gallery management
- Product editing (inline)
- Publishing system

**Major Functions**:
- `handleImageUpload()` - Queues images for GitHub upload
- `processProductImageUpload()` - Uploads to GitHub API
- `saveAllChanges()` - Publishes to content.json
- `updateProduct()` - Modifies product data

**State Explosion**: 30+ useState hooks including:
- Authentication states
- Upload queues and progress
- Temporary image previews
- Crop settings
- Edit modes
- Loading overlays

### 3. Products Page (`/app/products/page.tsx`)
**Features**:
- Static header (no dynamic sizing)
- Category filtering
- Floating category buttons
- 9-product grid (3x3)
- Responsive design
- Contact form

### 4. Products Editor (`/app/products-editor/page.tsx`)
**Features**:
- Manages full product catalog (27 items)
- Similar editing capabilities to main editor
- Separate publish system for products-page.json

## Data Flow and State Management

### Content Storage Strategy
1. **localStorage**: Used for drafts and temporary data
2. **sessionStorage**: Authentication state between pages
3. **GitHub API**: Permanent storage via content.json
4. **Blob URLs**: Temporary image previews during editing

### Publishing Flow
```
1. User edits in admin → localStorage (temp)
2. User uploads image → GitHub API → /public/images/
3. User clicks publish → content.json updated on GitHub
4. Netlify detects change → Rebuilds site (netlify.toml)
5. New content live in ~60 seconds
```

## Authentication & Security

### Current Implementation
- Password: "foxbuilt2025" (hardcoded)
- Session management via sessionStorage
- No server-side validation
- GitHub token in environment variable

### Security Concerns
1. Client-side only authentication
2. Token exposed in client bundle
3. No user management
4. No audit trail

## Image Management System

### Upload Process
1. User selects image → FileReader creates data URL
2. Queued for upload with generated filename
3. Base64 encoded and sent to GitHub API
4. Temporary preview shown via blob URL
5. After publish, served from `/public/images/`

### Crop System
- Custom implementation using CSS transforms
- Stored as `{scale, x, y}` coordinates
- Keyboard controls (arrow keys) in edit mode
- Mouse wheel for zoom

### Performance Issues
- No image optimization
- Large images served as-is
- No lazy loading (except Next.js Image component)
- Temporary previews kept in memory

## GitHub Integration

### API Usage
- Repository: lakotafox/FOXSITE
- Auth: Personal access token
- Files updated:
  - `/public/content.json` - Main content
  - `/public/images/*` - Uploaded images
  - `/public/products-page.json` - Products catalog

### Rate Limiting Considerations
- Each publish creates a commit
- Image uploads are individual API calls
- No batching implemented

## Build & Deployment

### Netlify Configuration
```toml
[build]
  ignore = "git diff --quiet $COMMIT_REF $CACHED_COMMIT_REF -- public/content.json"
```
- Only rebuilds when content.json changes
- Ignores image-only updates
- ~1 minute build time

### Next.js Configuration
- Static export mode (`output: 'export'`)
- TypeScript errors ignored
- ESLint errors ignored  
- Images unoptimized

## Known Issues & Technical Debt

### Critical Issues
1. **File Size**: Components exceed 1,800 lines
2. **Performance**: No code splitting, huge bundles
3. **Memory Leaks**: Blob URLs not always cleaned up
4. **Error Handling**: Minimal error boundaries
5. **Mobile Support**: Editor explicitly blocks mobile

### Code Smells
1. Massive prop drilling
2. Repeated code patterns
3. Mixed formatting (tabs/spaces)
4. Commented out code blocks
5. Console.logs in production
6. No TypeScript strict mode

### UX Issues
1. 60-second publish wait
2. No progress indicators for uploads
3. Confusing navigation between editors
4. No undo/redo functionality

## Refactoring Plan

### Phase 1: Component Extraction (Priority: HIGH)
Break down monolithic components into logical pieces:

```
/components/
  /admin/
    - AuthenticationForm.tsx
    - ImageUploader.tsx
    - ImageCropEditor.tsx
    - ProductEditor.tsx
    - PublishButton.tsx
    - LoadingOverlay.tsx
  /gallery/
    - ImageGallery.tsx
    - GalleryControls.tsx
  /products/
    - ProductCard.tsx
    - ProductGrid.tsx
    - CategoryFilter.tsx
  /layout/
    - Header.tsx
    - FloatingButtons.tsx
    - Footer.tsx
  /forms/
    - ContactForm.tsx
    - QuoteForm.tsx
```

### Phase 2: State Management (Priority: HIGH)
Implement proper state management:

```typescript
// Context API or Zustand
/contexts/
  - AuthContext.tsx
  - ProductsContext.tsx
  - EditorContext.tsx
  
/hooks/
  - useAuth.ts
  - useProducts.ts
  - useImageUpload.ts
  - useGitHub.ts
```

### Phase 3: Data Layer (Priority: MEDIUM)
Separate data logic:

```typescript
/services/
  - github.service.ts
  - storage.service.ts
  - email.service.ts
  
/api/
  - products.api.ts
  - content.api.ts
```

### Phase 4: Type Safety (Priority: MEDIUM)
Add proper TypeScript types:

```typescript
/types/
  - product.types.ts
  - editor.types.ts
  - api.types.ts
```

## File/Folder Structure Recommendations

### Proposed Structure
```
/app/
  /(public)/
    /page.tsx (homepage - 200 lines max)
    /products/page.tsx
    /layout.tsx
  /(admin)/
    /editor/
      /page.tsx
      /layout.tsx
    /products-editor/
      /page.tsx
  /(auth)/
    /login/page.tsx
    
/components/
  /common/
  /admin/
  /products/
  /gallery/
  
/lib/
  /hooks/
  /utils/
  /constants/
  
/services/
  /api/
  /storage/
  
/types/
  
/public/
  /images/
  /data/
```

### Migration Strategy
1. Create new component files
2. Extract logic piece by piece
3. Add tests for critical paths
4. Update imports
5. Remove old code

### Estimated Timeline
- Phase 1: 2-3 weeks
- Phase 2: 1-2 weeks  
- Phase 3: 1 week
- Phase 4: 1 week

Total: 5-7 weeks for complete refactor

## Performance Optimizations

### Quick Wins
1. Implement React.memo for product cards
2. Add loading="lazy" to images
3. Use dynamic imports for editors
4. Debounce search/filter operations

### Long-term
1. Implement virtual scrolling for products
2. Add service worker for offline support
3. Use React Query for data fetching
4. Implement proper image optimization pipeline

## Security Recommendations

### Immediate
1. Move authentication to server-side (API routes)
2. Implement proper session management
3. Add rate limiting to API calls
4. Validate all user inputs

### Future
1. Add user roles and permissions
2. Implement audit logging
3. Add 2FA for admin access
4. Regular security audits

## Testing Strategy

### Current State
- No tests exist

### Recommended Approach
1. Unit tests for utilities
2. Integration tests for API calls
3. E2E tests for critical paths
4. Visual regression tests

### Tools
- Jest + React Testing Library
- Playwright for E2E
- MSW for API mocking

## Monitoring & Analytics

### Implement
1. Error tracking (Sentry)
2. Performance monitoring
3. User analytics
4. Uptime monitoring

## Conclusion

The FoxBuilt website is functional but requires significant refactoring to be maintainable. The primary issues are:
1. Massive component files
2. No code organization
3. Poor state management
4. Security concerns

Following this refactoring plan would transform it into a professional, maintainable codebase while preserving all current functionality.

## Complete File Tree with Line Counts

```
foxbuilt-websiteFOX/
├── app/                                    # Next.js 15 App Router
│   ├── page.tsx                            (746 lines)   # Main homepage - NEEDS REFACTORING
│   ├── layout.tsx                          (33 lines)    # Root layout with Geist fonts
│   ├── globals.css                         (90 lines)    # Tailwind imports & custom CSS
│   ├── carrie/
│   │   └── page.tsx                        (1,872 lines) # Admin editor - MASSIVE FILE
│   ├── products/
│   │   └── page.tsx                        (863 lines)   # Products display page
│   ├── products-editor/
│   │   └── page.tsx                        (1,106 lines) # Products editor - NEEDS SPLITTING
│   ├── games/
│   │   └── page.tsx                        (1,007 lines) # Easter egg games (Snake, Pong, Galaga)
│   ├── collections/all/
│   │   └── page.tsx                        (92 lines)    # UNUSED - legacy page
│   └── pages/about-us/
│       └── page.tsx                        (92 lines)    # UNUSED - legacy page
├── components/
│   ├── theme-provider.tsx                  (11 lines)    # Next-themes provider wrapper
│   └── ui/                                 (4,988 lines total)
│       ├── accordion.tsx                   (56 lines)
│       ├── alert-dialog.tsx                (142 lines)
│       ├── alert.tsx                       (58 lines)
│       ├── aspect-ratio.tsx                (7 lines)
│       ├── avatar.tsx                      (48 lines)
│       ├── badge.tsx                       (36 lines)
│       ├── breadcrumb.tsx                  (113 lines)
│       ├── button.tsx                      (56 lines)    # ACTIVELY USED
│       ├── calendar.tsx                    (60 lines)
│       ├── card.tsx                        (79 lines)    # ACTIVELY USED
│       ├── carousel.tsx                    (254 lines)
│       ├── chart.tsx                       (362 lines)
│       ├── checkbox.tsx                    (28 lines)
│       ├── collapsible.tsx                 (9 lines)
│       ├── command.tsx                     (151 lines)
│       ├── context-menu.tsx                (198 lines)
│       ├── dialog.tsx                      (117 lines)
│       ├── drawer.tsx                      (112 lines)
│       ├── dropdown-menu.tsx               (198 lines)
│       ├── form.tsx                        (176 lines)
│       ├── hover-card.tsx                  (27 lines)
│       ├── input-otp.tsx                   (69 lines)
│       ├── input.tsx                       (24 lines)    # ACTIVELY USED
│       ├── label.tsx                       (24 lines)
│       ├── menubar.tsx                     (247 lines)
│       ├── navigation-menu.tsx             (126 lines)
│       ├── pagination.tsx                  (117 lines)
│       ├── popover.tsx                     (29 lines)
│       ├── progress.tsx                    (26 lines)
│       ├── radio-group.tsx                 (42 lines)
│       ├── resizable.tsx                   (40 lines)
│       ├── scroll-area.tsx                 (46 lines)
│       ├── select.tsx                      (158 lines)
│       ├── separator.tsx                   (29 lines)
│       ├── sheet.tsx                       (138 lines)
│       ├── sidebar.tsx                     (734 lines)
│       ├── skeleton.tsx                    (15 lines)
│       ├── slider.tsx                      (26 lines)
│       ├── sonner.tsx                      (29 lines)
│       ├── switch.tsx                      (27 lines)
│       ├── table.tsx                       (115 lines)
│       ├── tabs.tsx                        (53 lines)
│       ├── textarea.tsx                    (22 lines)    # ACTIVELY USED
│       ├── toast.tsx                       (127 lines)
│       ├── toaster.tsx                     (33 lines)
│       ├── toggle-group.tsx                (61 lines)
│       ├── toggle.tsx                      (45 lines)
│       ├── tooltip.tsx                     (30 lines)
│       └── use-mobile.tsx                  (19 lines)
├── hooks/
│   ├── use-mobile.tsx                      (19 lines)    # DUPLICATE of components/ui/use-mobile.tsx
│   └── use-toast.ts                        (191 lines)   # Toast notification system
├── lib/
│   ├── products-data.ts                    (109 lines)   # Default products & localStorage helpers
│   └── utils.ts                            (6 lines)     # cn() utility for Tailwind merge
├── public/
│   ├── content.json                        (~300 lines)  # Published site content
│   ├── draft.json                          # Draft content (currently unused)
│   ├── products-page.json                  # Products page content (when exists)
│   ├── catolog no page one.pdf             # Product catalog PDF
│   ├── images/                             # Product & gallery images
│   │   ├── *.jpg                           # ~50+ product images
│   │   └── foxbuilt-logo.png               # Company logo
│   ├── errorpic.png                        # Error state image
│   ├── foxloading.webm                     # Loading animation video
│   ├── locked.jpeg                         # Crop lock icon
│   ├── unlocked.jpeg                       # Crop unlock icon
│   ├── questionmark.png                    # Help button icon
│   └── *.mp3                               # Sound effects
├── admin/                                  # Legacy HTML admin (unused)
│   ├── index.html                          (308 lines)
│   └── admin.js                            (279 lines)
├── styles/
│   └── globals.css                         # Legacy styles folder
├── out/                                    # Next.js static export
│   └── _next/                              # Built assets
├── package.json                            (71 lines)
├── pnpm-lock.yaml                          (large)       # Package lock file
├── tsconfig.json                           # TypeScript config
├── tailwind.config.ts                      # Tailwind configuration
├── postcss.config.mjs                      # PostCSS config
├── next.config.mjs                         (16 lines)    # Next.js config
├── netlify.toml                            (10 lines)    # Netlify build config
├── components.json                         # shadcn/ui config
├── README-EDITOR-FIX.md                    (117 lines)   # Editor documentation
├── README.md                               (78 lines)    # User documentation
└── README-MASTER.md                        (THIS FILE)   # Developer documentation

STATISTICS:
- Total TypeScript/TSX files: ~11,900 lines
- Largest file: app/carrie/page.tsx (1,872 lines)
- Most complex directory: components/ui/ (4,988 lines across 50+ files)
- Actively used UI components: ~5 out of 50+
- Technical debt files: ~5,000 lines of unused components
```

### File Size Analysis
- **Critical files over 1,000 lines**: 3 files (carrie, products-editor, games)
- **Files between 500-1,000 lines**: 2 files (page.tsx, products/page.tsx)
- **Unused code**: ~60% of components/ui/
- **Total project size**: ~12,000 lines of code

---

*Documentation created by comprehensive code analysis - December 2024*