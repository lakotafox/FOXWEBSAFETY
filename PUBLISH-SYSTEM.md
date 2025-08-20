# Publishing System Documentation

## Critical: Netlify Build Configuration

**IMPORTANT**: The `netlify.toml` file controls which file changes trigger builds!

```toml
[build]
  ignore = "git diff --quiet $COMMIT_REF $CACHED_COMMIT_REF -- public/content.json public/products.json public/category-visibility.json public/main-products.json"
```

If your editor updates a JSON file that's NOT in this list, Netlify will CANCEL the build. Always ensure new data files are added to this list.

## How Each Editor Publishes

### 1. Main Page Editor (Carrie - `/carrie`)
- **Files Updated**: 
  - `public/main-products.json` - Featured products for main page
  - `public/content.json` - Gallery images and other content
- **Image Handling**: Stores locally during editing, uploads on publish
- **Crop Settings**: Embedded in products as `imageCrop` field

### 2. Products Editor (`/products-editor`)
- **Files Updated**: 
  - `public/products.json` - All product categories and items
- **Image Handling**: Currently uploads immediately (needs update)
- **Crop Settings**: Saved as `productsCrops` in same file

### 3. Visibility Editor (`/products-editor/visibility`)
- **Files Updated**: 
  - `public/category-visibility.json` - Navigation visibility and category names
- **Data Format**: Combined format includes:
  ```json
  {
    "showSearchBar": true,
    "showFoxbot": true,
    "executive-desks": true,
    // ... other categories
    "categoryNames": { /* names data */ },
    "lastUpdated": "timestamp"
  }
  ```

## Image Upload System

### Current Implementation
- Images are stored locally using `LocalImageStore` during editing
- On publish, all pending images are uploaded first
- Then data files are updated
- This prevents multiple commits from canceling builds

### Image Storage
- All images go to: `public/images/`
- Naming convention: `{type}-{id}-{timestamp}.jpg`

## Common Issues & Solutions

### Build Cancellations
**Problem**: Netlify cancels builds
**Causes**:
1. File not in `netlify.toml` ignore list
2. Multiple rapid commits
3. No actual file changes

**Solution**: 
- Add file to netlify.toml
- Use single commit per publish
- Ensure content actually changes

### Visibility Not Working
**Problem**: Toggle visibility but nothing shows
**Cause**: Data format mismatch between editor and reader
**Solution**: `getCategoryVisibility()` function handles both old and new formats

### Crop Settings Not Persisting
**Problem**: Image zoom/position resets
**Solution**: 
- Carrie editor loads from `main-products.json`
- Crops saved as `imageCrop` in each product
- Also saved as `productsCrops` for backup

## GitHub API Usage

All editors use the GitHub Contents API:
```javascript
// Pattern for updating files
const response = await fetch(
  `https://api.github.com/repos/lakotafox/FOXSITE/contents/public/{filename}`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message: 'Commit message',
      content: base64Content,
      sha: currentFileSha,
      branch: 'main'
    })
  }
)
```

## Environment Variables

Required in Netlify:
- `NEXT_PUBLIC_GITHUB_TOKEN` - GitHub personal access token for API calls
- Must have repo write permissions

## Testing Locally

1. Images will show as blob URLs locally
2. Publishing will still work to GitHub
3. Check browser console for API errors
4. Verify JSON files are valid after publish

## Data Flow

1. **Editor** → Makes changes locally
2. **Publish Button** → Uploads images, then data
3. **GitHub** → Receives commits
4. **Netlify** → Detects changes, checks netlify.toml
5. **Build** → If file is in list, builds and deploys
6. **Live Site** → Shows updated content

## Important Notes

- Gallery uses same images for mobile and desktop now
- Search bar and FOXBOT visibility controlled by visibility editor
- All editors save to localStorage for draft changes
- Publishing clears localStorage after success