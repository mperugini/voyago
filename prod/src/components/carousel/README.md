# Carousel Component

## Description
Flight cards carousel component with ultra smooth horizontal scroll.

## Files
- `carousel.js` - Carousel logic and initialization
- `flightLoader.js` - Dynamic flight data loading

## Features
- Ultra smooth horizontal scroll
- Dynamic content loading from JSON
- Mobile-optimized touch gestures
- Vertical scroll support
- Performance optimized
- Responsive design

## Usage
```javascript
// Debug API
carouselDebug.getCurrentIndex();
carouselDebug.getMaxIndex();
carouselDebug.moveToIndex(index);
carouselDebug.next();
carouselDebug.previous();
```

## Dependencies
- `ultraSmoothScroll.js` - For scroll functionality
- `flights.json` - Data source
