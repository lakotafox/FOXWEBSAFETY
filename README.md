# FoxBuilt Office Furniture Website

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

## Project File Structure

```
foxbuilt-websiteFOX/
├── app/                              # Next.js App Router
│   ├── page.tsx                      (746 lines)  # Homepage
│   ├── layout.tsx                    (33 lines)   # Root layout
│   ├── globals.css                   (90 lines)   # Global styles
│   ├── carrie/
│   │   └── page.tsx                  (1,872 lines) # Admin editor
│   ├── products/
│   │   └── page.tsx                  (863 lines)  # Products catalog
│   ├── products-editor/
│   │   └── page.tsx                  (1,106 lines) # Products editor
│   └── games/
│       └── page.tsx                  (1,007 lines) # Hidden games
├── components/
│   ├── theme-provider.tsx            (11 lines)
│   └── ui/                           (4,988 lines total) # 50+ components
├── lib/
│   ├── products-data.ts              (109 lines)  # Product defaults
│   └── utils.ts                      (6 lines)    # Utilities
├── public/
│   ├── content.json                  # Published content
│   ├── images/                       # Product images
│   └── catolog no page one.pdf       # Product catalog
├── admin/                            # Legacy admin
│   ├── index.html                    (308 lines)
│   └── admin.js                      (279 lines)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── netlify.toml

Total main source files: ~6,900 lines
```

---

*Built with American pride 🇺🇸*