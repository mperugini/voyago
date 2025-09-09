// Simplified Carousel - Simple horizontal scroll like banners
let carouselTrack = null;
let cards = null;
let isInitialized = false;

function initializeCarousel() {
    if (isInitialized) {
        console.log('Carousel already initialized');
        return true;
    }
    
    carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) {
        console.error('Carousel track not found');
        return false;
    }
    
    cards = document.querySelectorAll('.flight-card');
    if (cards.length === 0) {
        console.log('No flight cards found, waiting for cards to load...');
        return false;
    }
    
    // Remove loading message if it exists
    const loadingMessage = carouselTrack.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
    
    // Add the carousel track to the ultra smooth scroll system
    if (window.ultraSmoothScroll) {
        window.ultraSmoothScroll.addContainer(carouselTrack);
    }
    
    isInitialized = true;
    console.log(`Carousel initialized with ${cards.length} cards using simple horizontal scroll`);
    return true;
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!initializeCarousel()) {
        document.addEventListener('flightCardsLoaded', () => {
            setTimeout(() => {
                initializeCarousel();
            }, 100);
        });
    }
});

document.addEventListener('flightCardsLoaded', () => {
    setTimeout(() => {
        if (!isInitialized) {
            initializeCarousel();
        }
    }, 100);
});

// Debug API
window.carouselDebug = {
    isInitialized: () => isInitialized,
    getCardsCount: () => cards ? cards.length : 0,
    getTrack: () => carouselTrack
};
