// Carousel functionality with improved smooth scrolling
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
let animationFrame = null;
let isInitialized = false;

function initializeCarousel() {
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
    
    cardsPerView = window.innerWidth <= 768 ? 1 : 3;
    maxIndex = Math.max(0, cards.length - cardsPerView);
    currentIndex = 0;
    
    // Ensure carousel track has proper styles
    carouselTrack.style.transform = 'translateX(0px)';
    carouselTrack.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    console.log(`Carousel initialized with ${cards.length} cards`);
    updateCarousel(false); // Initialize without animation
    setupEventListeners();
    isInitialized = true;
    return true;
}

function updateCarousel(animate = true) {
    if (!carouselTrack || !isInitialized) return;
    
    // Cancel any ongoing animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    const translateX = -currentIndex * cardWidth;
    
    if (animate) {
        carouselTrack.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        // Use requestAnimationFrame for smoother animation
        animationFrame = requestAnimationFrame(() => {
            carouselTrack.style.transform = `translateX(${translateX}px)`;
        });
    } else {
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = `translateX(${translateX}px)`;
    }
}

function moveToIndex(index, animate = true) {
    if (!carouselTrack || !isInitialized) return;
    
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        updateCarousel(animate);
    }
}

function setupEventListeners() {
    if (!carouselTrack || !isInitialized) return;
    
    // Remove existing listeners to avoid duplicates
    carouselTrack.removeEventListener('touchstart', handleTouchStart, { passive: false });
    carouselTrack.removeEventListener('touchmove', handleTouchMove, { passive: false });
    carouselTrack.removeEventListener('touchend', handleTouchEnd, { passive: true });
    carouselTrack.removeEventListener('mousedown', handleMouseDown);
    carouselTrack.removeEventListener('mousemove', handleMouseMove);
    carouselTrack.removeEventListener('mouseup', handleMouseUp);
    carouselTrack.removeEventListener('mouseleave', handleMouseLeave);
    carouselTrack.removeEventListener('selectstart', handleSelectStart);
    
    // Add event listeners with proper options
    carouselTrack.addEventListener('touchstart', handleTouchStart, { passive: false });
    carouselTrack.addEventListener('touchmove', handleTouchMove, { passive: false });
    carouselTrack.addEventListener('touchend', handleTouchEnd, { passive: true });
    carouselTrack.addEventListener('mousedown', handleMouseDown);
    carouselTrack.addEventListener('mousemove', handleMouseMove);
    carouselTrack.addEventListener('mouseup', handleMouseUp);
    carouselTrack.addEventListener('mouseleave', handleMouseLeave);
    carouselTrack.addEventListener('selectstart', handleSelectStart);
}

// Touch events for mobile swipe
function handleTouchStart(e) {
    if (!isInitialized) return;
    
    startX = e.touches[0].clientX;
    startTransform = -currentIndex * cardWidth;
    isDragging = true;
    
    // Cancel any ongoing animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    carouselTrack.style.transition = 'none';
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isDragging || !isInitialized) return;
    
    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    const newTransform = startTransform + diffX;
    
    // Apply resistance at boundaries with smoother curve
    let boundedTransform = newTransform;
    if (newTransform > 0) {
        boundedTransform = newTransform * 0.3;
    } else if (newTransform < -maxIndex * cardWidth) {
        const excess = Math.abs(newTransform + maxIndex * cardWidth);
        boundedTransform = -maxIndex * cardWidth - (excess * 0.3);
    }
    
    carouselTrack.style.transform = `translateX(${boundedTransform}px)`;
    e.preventDefault();
}

function handleTouchEnd() {
    if (!isDragging || !isInitialized) return;
    
    isDragging = false;
    const diffX = currentX - startX;
    const threshold = cardWidth * 0.25; // Reduced threshold for more responsive swiping
    
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

// Mouse events for desktop drag
function handleMouseDown(e) {
    if (!isInitialized) return;
    
    e.preventDefault();
    startX = e.clientX;
    startTransform = -currentIndex * cardWidth;
    isDragging = true;
    
    // Cancel any ongoing animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    carouselTrack.style.transition = 'none';
    carouselTrack.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!isDragging || !isInitialized) return;
    
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
    if (!isDragging || !isInitialized) return;
    
    isDragging = false;
    carouselTrack.style.cursor = 'grab';
    const diffX = currentX - startX;
    const threshold = cardWidth * 0.25;
    
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
    if (isDragging && isInitialized) {
        isDragging = false;
        carouselTrack.style.cursor = 'grab';
        updateCarousel();
    }
}

function handleSelectStart(e) {
    e.preventDefault();
}

// Update carousel on window resize with debouncing
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!isInitialized) return;
        
        const newCardsPerView = window.innerWidth <= 768 ? 1 : 3;
        const newMaxIndex = Math.max(0, (cards ? cards.length : 0) - newCardsPerView);
        
        if (currentIndex > newMaxIndex) {
            currentIndex = newMaxIndex;
        }
        
        maxIndex = newMaxIndex;
        cardsPerView = newCardsPerView;
        updateCarousel(false);
    }, 150);
});

// Listen for flight cards loaded event
document.addEventListener('flightCardsLoaded', () => {
    console.log('Flight cards loaded, reinitializing carousel...');
    isInitialized = false;
    
    // Wait for DOM to be fully updated
    setTimeout(() => {
        const success = initializeCarousel();
        if (!success) {
            // Retry after a longer delay if initialization failed
            setTimeout(() => {
                initializeCarousel();
            }, 300);
        }
    }, 50);
});

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Try to initialize immediately
    setTimeout(() => {
        initializeCarousel();
    }, 100);
});

// Cleanup function
function cleanupCarousel() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    isInitialized = false;
}

// Expose cleanup function globally
window.cleanupCarousel = cleanupCarousel;
