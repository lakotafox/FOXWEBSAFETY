# FoxBuilt Office Furniture Website.

## About the Company
FoxBuilt is an American office furniture company established in 1999 in Pleasant Grove, Utah. For over 25 years, we've been providing quality workspace solutions built tough, built right, and built to last.

## Website Overview
This is the official FoxBuilt website featuring:
- **Product Catalog**: Browse our new, pre-owned, and seating collections
- **Company Information**: Learn about our American-made craftsmanship
- **Contact & Showroom**: Visit us or get in touch for quotes

## Key Features
- 📱 Mobile-responsive design
- 🛒 Three product categories: New, Pre-Owned (Battle Tested), and Seating
- 🏢 Showroom location and contact information
- 📧 Quote request system
- 🖼️ Auto-rotating gallery showcasing our work

## Admin Access
The website includes a content management system for updating products and images:
- **Main Site Editor**: Access at `/carrie` (password protected)
- **Products Page Editor**: Separate editor for the full products catalog

## Technology
Built with modern web technologies:
- Next.js 15 (React framework)
- TypeScript for type safety
- Tailwind CSS for styling
- Hosted on Netlify with automatic deployments

## Contact Information
**Address**: 420 W Industrial Dr Building LL, Pleasant Grove, UT 84062  
**Phone**: (801) 899-9406  
**Hours**: Monday-Friday 10:00am-5:00pm, Weekends by appointment

## Support
For website issues or updates, contact the development team. The admin panel includes built-in help documentation accessible via the question mark icon.

## Credits
**Loading Music**: "Mind Yourself" by Brotheration Records (2016)

## Project File Structure (After Refactoring)

```
foxbuilt-websiteFOX/
├── app/                              # Next.js App Router
│   ├── page.tsx                      (110 lines)  # Homepage (refactored)
│   ├── layout.tsx                    (33 lines)   # Root layout
│   ├── globals.css                   (90 lines)   # Global styles
│   ├── carrie/
│   │   └── page.tsx                  (626 lines)  # Admin editor (refactored)
│   ├── products/
│   │   └── page.tsx                  (179 lines)  # Products catalog (refactored)
│   ├── products-editor/
│   │   └── page.tsx                  (931 lines)  # Products editor (refactored)
│   └── games/
│       └── page.tsx                  (165 lines)  # Games selector (refactored)
├── components/
│   ├── sections/                     # Extracted page sections
│   │   ├── Header.tsx                (77 lines)
│   │   ├── HeroSection.tsx           (35 lines)
│   │   ├── GallerySection.tsx        (65 lines)
│   │   ├── FeaturedProducts.tsx      (113 lines)
│   │   ├── AboutSection.tsx          (51 lines)
│   │   ├── ContactSection.tsx        (152 lines)
│   │   ├── Footer.tsx                (41 lines)
│   │   └── FloatingActionButtons.tsx (44 lines)
│   ├── carrie-editor/               # Carrie editor components
│   │   ├── ui/                      # UI components
│   │   ├── sections/                # Page sections
│   │   └── constants/               # Default data
│   ├── products-editor/             # Products editor components
│   │   ├── ui/                      # UI components (ProductCard, etc.)
│   │   └── constants/               # Default products data
│   ├── products/                    # Products page components
│   │   └── ui/                      # Product display components
│   ├── games/                       # Individual game components
│   │   ├── Snake.tsx                (249 lines)
│   │   ├── Pong.tsx                 (157 lines)
│   │   └── Galaga.tsx               (347 lines)
│   └── ui/                          # Shared UI components
├── lib/
│   ├── utils/                       # Utility functions
│   │   ├── imageTransform.ts        (11 lines)
│   │   └── categoryColors.ts        (16 lines)
│   ├── products-data.ts             (109 lines)
│   └── utils.ts                     (6 lines)
├── public/
│   ├── icons/                       # Icon assets
│   ├── images/                      # Product & gallery images
│   ├── sounds/                      # Audio files
│   ├── content.json                 # Main site content
│   ├── products.json                # Products catalog content
│   └── FoxBuilt-Overview.pdf        # Company overview
├── admin/                           # Legacy admin (to be removed)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── netlify.toml

Total lines after refactoring: ~3,500 lines (49% reduction)
```

## Key Improvements from Refactoring

1. **Component Extraction**: Separated large page files into reusable components
2. **Code Reuse**: ProductCard, EditableField, and other shared components
3. **Better Organization**: Feature-based folder structure
4. **Reduced Duplication**: Utility functions for common operations
5. **Maintainability**: Smaller, focused files that are easier to update

---

*Built with American pride 🇺🇸*