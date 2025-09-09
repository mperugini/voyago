# Reels Component

## Description
Horizontal scrollable video reels component with autoplay and ultra smooth scroll.

## Files
- `reels.css` - Component styles
- `reelsModule.js` - Component logic and video management

## Features
- Ultra smooth horizontal scroll
- Video autoplay with Intersection Observer
- Mobile-optimized touch gestures
- Dynamic content loading from JSON
- Vertical scroll support
- Performance optimized

## Usage
```javascript
// Add new reel
addReel(title, video, link, id);

// Get reel by ID
getReel(id);

// Update reel
updateReel(id, data);

// Remove reel
removeReel(id);

// Control video playback
pauseAllReels();
playAllReels();
```

## Dependencies
- `ultraSmoothScroll.js` - For scroll functionality
- `reels.json` - Data source
