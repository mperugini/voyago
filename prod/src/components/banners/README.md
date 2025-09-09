# Banners Component

## Description
Horizontal scrollable banners component with ultra smooth mobile scroll.

## Files
- `banners.css` - Component styles
- `bannersModule.js` - Component logic and data management

## Features
- Ultra smooth horizontal scroll
- Mobile-optimized touch gestures
- Dynamic content loading from JSON
- Vertical scroll support
- Performance optimized

## Usage
```javascript
// Add new banner
addBanner(title, href, ariaLabel, imageSrc, alt);

// Get banner by ID
getBanner(id);

// Update banner
updateBanner(id, data);

// Remove banner
removeBanner(id);
```

## Dependencies
- `ultraSmoothScroll.js` - For scroll functionality
- `banners.json` - Data source
