// Carousel functionality with improved smooth scrolling and navigation
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
let isAnimating = false;

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
    
    // Calculate cards per view based on screen size
    cardsPerView = window.innerWidth <= 768 ? 1 : 3;
    
    // Fix: Allow scrolling to show all cards, not just up to maxIndex
    // maxIndex should be the last position where we can show cardsPerView cards
    maxIndex = Math.max(0, cards.length - cardsPerView);
    
    // Reset to first position
    currentIndex = 0;
    
    // Ensure carousel track has proper styles
    carouselTrack.style.transform = 'translateX(0px)';
    carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    console.log(`Carousel initialized with ${cards.length} cards, maxIndex: ${maxIndex}`);
    updateCarousel(false); // Initialize without animation
    setupEventListeners();
    isInitialized = true;
    return true;
}

function updateCarousel(animate = true) {
    if (!carouselTrack || !isInitialized) return;
    
    // Prevent multiple animations
    if (isAnimating && animate) return;
    
    // Cancel any ongoing animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    const translateX = -currentIndex * cardWidth;
    
    if (animate) {
        isAnimating = true;
        carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Use requestAnimationFrame for smoother animation
        animationFrame = requestAnimationFrame(() => {
            carouselTrack.style.transform = `translateX(${translateX}px)`;
            
            // Reset animation flag after transition completes
            setTimeout(() => {
                isAnimating = false;
            }, 400);
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
        console.log(`Moved to index ${currentIndex} of ${maxIndex}`);
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
    if (!isInitialized || isAnimating) return;
    
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
        // Swiping right at the beginning
        boundedTransform = newTransform * 0.4;
    } else if (newTransform < -maxIndex * cardWidth) {
        // Swiping left at the end
        const excess = Math.abs(newTransform + maxIndex * cardWidth);
        boundedTransform = -maxIndex * cardWidth - (excess * 0.4);
    }
    
    carouselTrack.style.transform = `translateX(${boundedTransform}px)`;
    e.preventDefault();
}

function handleTouchEnd() {
    if (!isDragging || !isInitialized) return;
    
    isDragging = false;
    const diffX = currentX - startX;
    const threshold = cardWidth * 0.2; // Reduced threshold for more responsive swiping
    
    if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
            // Swipe right - go to previous
            if (currentIndex > 0) {
                moveToIndex(currentIndex - 1);
            } else {
                // At the beginning, snap back
                updateCarousel();
            }
        } else {
            // Swipe left - go to next
            if (currentIndex < maxIndex) {
                moveToIndex(currentIndex + 1);
            } else {
                // At the end, snap back
                updateCarousel();
            }
        }
    } else {
        // Not enough swipe - snap back
        updateCarousel();
    }
}

// Mouse events for desktop drag
function handleMouseDown(e) {
    if (!isInitialized || isAnimating) return;
    
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
        boundedTransform = newTransform * 0.4;
    } else if (newTransform < -maxIndex * cardWidth) {
        const excess = Math.abs(newTransform + maxIndex * cardWidth);
        boundedTransform = -maxIndex * cardWidth - (excess * 0.4);
    }
    
    carouselTrack.style.transform = `translateX(${boundedTransform}px)`;
}

function handleMouseUp() {
    if (!isDragging || !isInitialized) return;
    
    isDragging = false;
    carouselTrack.style.cursor = 'grab';
    const diffX = currentX - startX;
    const threshold = cardWidth * 0.2;
    
    if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
            // Drag right - go to previous
            if (currentIndex > 0) {
                moveToIndex(currentIndex - 1);
            } else {
                updateCarousel();
            }
        } else {
            // Drag left - go to next
            if (currentIndex < maxIndex) {
                moveToIndex(currentIndex + 1);
            } else {
                updateCarousel();
            }
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
        console.log(`Resized: cardsPerView=${cardsPerView}, maxIndex=${maxIndex}, currentIndex=${currentIndex}`);
    }, 150);
});

// Listen for flight cards loaded event
document.addEventListener('flightCardsLoaded', () => {
    console.log('Flight cards loaded, reinitializing carousel...');
    isInitialized = false;
    isAnimating = false;
    
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
    isAnimating = false;
}

// Expose functions globally for debugging
window.carouselDebug = {
    getCurrentIndex: () => currentIndex,
    getMaxIndex: () => maxIndex,
    getCardsPerView: () => cardsPerView,
    moveToIndex: moveToIndex,
    getCardsCount: () => cards ? cards.length : 0
};

// Expose cleanup function globally
window.cleanupCarousel = cleanupCarousel;
