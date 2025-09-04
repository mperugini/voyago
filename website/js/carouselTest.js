// Carousel testing and debugging utilities
document.addEventListener('DOMContentLoaded', () => {
    // Wait for carousel to be initialized
    setTimeout(() => {
        if (window.carouselDebug) {
            console.log('Carousel Debug Tools Available:');
            console.log('- carouselDebug.getCurrentIndex() - Get current position');
            console.log('- carouselDebug.getMaxIndex() - Get maximum position');
            console.log('- carouselDebug.getCardsPerView() - Get cards per view');
            console.log('- carouselDebug.moveToIndex(n) - Move to specific position');
            console.log('- carouselDebug.getCardsCount() - Get total cards count');
            
            // Test navigation
            console.log('Current carousel state:', {
                currentIndex: window.carouselDebug.getCurrentIndex(),
                maxIndex: window.carouselDebug.getMaxIndex(),
                cardsPerView: window.carouselDebug.getCardsPerView(),
                totalCards: window.carouselDebug.getCardsCount()
            });
        }
    }, 2000);
});

// Global test functions
window.testCarouselNavigation = function() {
    if (!window.carouselDebug) {
        console.error('Carousel debug not available');
        return;
    }
    
    console.log('Testing carousel navigation...');
    
    // Test moving to each position
    const maxIndex = window.carouselDebug.getMaxIndex();
    
    for (let i = 0; i <= maxIndex; i++) {
        setTimeout(() => {
            console.log(`Moving to position ${i}`);
            window.carouselDebug.moveToIndex(i);
        }, i * 1000);
    }
    
    // Return to start after testing
    setTimeout(() => {
        console.log('Returning to start position');
        window.carouselDebug.moveToIndex(0);
    }, (maxIndex + 1) * 1000);
};

window.testCarouselSmoothness = function() {
    if (!window.carouselDebug) {
        console.error('Carousel debug not available');
        return;
    }
    
    console.log('Testing carousel smoothness...');
    
    // Rapid navigation test
    const positions = [0, 1, 2, 1, 0];
    positions.forEach((pos, index) => {
        setTimeout(() => {
            console.log(`Smooth test - position ${pos}`);
            window.carouselDebug.moveToIndex(pos);
        }, index * 500);
    });
};

// Auto-test on load (uncomment to enable)
// setTimeout(() => {
//     if (window.carouselDebug && window.carouselDebug.getCardsCount() > 0) {
//         console.log('Auto-testing carousel...');
//         testCarouselNavigation();
//     }
// }, 3000);
