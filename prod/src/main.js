// Main JavaScript Entry Point - Arolar Website

// Utils
import './utils/utils.js';

// Modules
import './modules/scroll/ultraSmoothScroll.js';
import './modules/animations/animations.js';

// Components
import './components/banners/bannersModule.js';
import './components/reels/reelsModule.js';
import './components/carousel/flightLoader.js';
import './components/carousel/carousel.js';

// Performance monitoring
if (window.PerformanceUtils) {
    console.log('Performance utilities loaded');
}

// Listen for modules loaded events
document.addEventListener('bannersLoaded', (event) => {
    console.log(`Banners module loaded with ${event.detail.count} banners`);
});

document.addEventListener('reelsLoaded', (event) => {
    console.log(`Reels module loaded with ${event.detail.count} reels`);
});

document.addEventListener('flightCardsLoaded', (event) => {
    console.log(`Flight cards loaded with ${event.detail.count} cards`);
});
