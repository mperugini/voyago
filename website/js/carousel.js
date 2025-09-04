// Carousel functionality with swipe support - Updated for dynamic cards
let carouselTrack = null;
let cards = null;
let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;
let startTransform = 0;
let cardsPerView = 3;
let maxIndex = 0;
let cardWidth = 280 + 24; // 280px card width + 24px gap (1.5rem = 24px)

function initializeCarousel() {
    carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) {
        console.error('Carousel track not found');
        return;
    }
    
    cards = document.querySelectorAll('.flight-card');
    if (cards.length === 0) {
        console.log('No flight cards found, waiting for cards to load...');
        return;
    }
    
    cardsPerView = window.innerWidth <= 768 ? 1 : 3;
    maxIndex = Math.max(0, cards.length - cardsPerView);
    currentIndex = 0;
    
    console.log(`Carousel initialized with ${cards.length} cards`);
    updateCarousel();
    setupEventListeners();
}

function updateCarousel(animate = true) {
    if (!carouselTrack) return;
    
    const translateX = -currentIndex * cardWidth;
    carouselTrack.style.transition = animate ? 'transform 0.3s ease' : 'none';
    carouselTrack.style.transform = `translateX(${translateX}px)`;
}

function moveToIndex(index, animate = true) {
    if (!carouselTrack) return;
    
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    updateCarousel(animate);
}

function setupEventListeners() {
    if (!carouselTrack) return;
    
    // Remove existing listeners to avoid duplicates
    carouselTrack.removeEventListener('touchstart', handleTouchStart);
    carouselTrack.removeEventListener('touchmove', handleTouchMove);
    carouselTrack.removeEventListener('touchend', handleTouchEnd);
    carouselTrack.removeEventListener('mousedown', handleMouseDown);
    carouselTrack.removeEventListener('mousemove', handleMouseMove);
    carouselTrack.removeEventListener('mouseup', handleMouseUp);
    carouselTrack.removeEventListener('mouseleave', handleMouseLeave);
    carouselTrack.removeEventListener('selectstart', handleSelectStart);
    
    // Add event listeners
    carouselTrack.addEventListener('touchstart', handleTouchStart);
    carouselTrack.addEventListener('touchmove', handleTouchMove);
    carouselTrack.addEventListener('touchend', handleTouchEnd);
    carouselTrack.addEventListener('mousedown', handleMouseDown);
    carouselTrack.addEventListener('mousemove', handleMouseMove);
    carouselTrack.addEventListener('mouseup', handleMouseUp);
    carouselTrack.addEventListener('mouseleave', handleMouseLeave);
    carouselTrack.addEventListener('selectstart', handleSelectStart);
}

// Touch events for mobile swipe
function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    startTransform = -currentIndex * cardWidth;
    isDragging = true;
    carouselTrack.style.transition = 'none';
}

function handleTouchMove(e) {
    if (!isDragging) return;
    
    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    const newTransform = startTransform + diffX;
    
    // Apply resistance at boundaries
    let boundedTransform = newTransform;
    if (newTransform > 0) {
        boundedTransform = newTransform * 0.3; // Resistance when swiping right at start
    } else if (newTransform < -maxIndex * cardWidth) {
        const excess = Math.abs(newTransform + maxIndex * cardWidth);
        boundedTransform = -maxIndex * cardWidth - (excess * 0.3); // Resistance when swiping left at end
    }
    
    carouselTrack.style.transform = `translateX(${boundedTransform}px)`;
}

function handleTouchEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    const diffX = currentX - startX;
    const threshold = cardWidth * 0.3; // 30% of card width to trigger slide
    
    if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && currentIndex > 0) {
            // Swipe right - go to previous
            moveToIndex(currentIndex - 1);
        } else if (diffX < 0 && currentIndex < maxIndex) {
            // Swipe left - go to next
            moveToIndex(currentIndex + 1);
        } else {
            // Not enough swipe or at boundary - snap back
            updateCarousel();
        }
    } else {
        // Not enough swipe - snap back
        updateCarousel();
    }
}

// Mouse events for desktop drag
function handleMouseDown(e) {
    e.preventDefault();
    startX = e.clientX;
    startTransform = -currentIndex * cardWidth;
    isDragging = true;
    carouselTrack.style.transition = 'none';
    carouselTrack.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    currentX = e.clientX;
    const diffX = currentX - startX;
    const newTransform = startTransform + diffX;
    
    // Apply resistance at boundaries
    let boundedTransform = newTransform;
    if (newTransform > 0) {
        boundedTransform = newTransform * 0.3;
    } else if (newTransform < -maxIndex * cardWidth) {
        const excess = Math.abs(newTransform + maxIndex * cardWidth);
        boundedTransform = -maxIndex * cardWidth - (excess * 0.3);
    }
    
    carouselTrack.style.transform = `translateX(${boundedTransform}px)`;
}

function handleMouseUp() {
    if (!isDragging) return;
    
    isDragging = false;
    carouselTrack.style.cursor = 'grab';
    const diffX = currentX - startX;
    const threshold = cardWidth * 0.3;
    
    if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && currentIndex > 0) {
            moveToIndex(currentIndex - 1);
        } else if (diffX < 0 && currentIndex < maxIndex) {
            moveToIndex(currentIndex + 1);
        } else {
            updateCarousel();
        }
    } else {
        updateCarousel();
    }
}

function handleMouseLeave() {
    if (isDragging) {
        isDragging = false;
        carouselTrack.style.cursor = 'grab';
        updateCarousel();
    }
}

function handleSelectStart(e) {
    e.preventDefault();
}

// Update carousel on window resize
window.addEventListener('resize', () => {
    const newCardsPerView = window.innerWidth <= 768 ? 1 : 3;
    const newMaxIndex = Math.max(0, (cards ? cards.length : 0) - newCardsPerView);
    if (currentIndex > newMaxIndex) {
        currentIndex = newMaxIndex;
    }
    maxIndex = newMaxIndex;
    cardsPerView = newCardsPerView;
    updateCarousel();
});

// Listen for flight cards loaded event
document.addEventListener('flightCardsLoaded', () => {
    console.log('Flight cards loaded, reinitializing carousel...');
    // Small delay to ensure DOM is updated
    setTimeout(() => {
        initializeCarousel();
    }, 100);
});

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Try to initialize immediately
    initializeCarousel();
    
    // Also try after a short delay in case cards are still loading
    setTimeout(() => {
        if (!cards || cards.length === 0) {
            initializeCarousel();
        }
    }, 500);
});
