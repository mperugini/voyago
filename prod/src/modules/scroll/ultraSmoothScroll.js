// Ultra Smooth Scroll - Mobile optimized scroll behavior with vertical scroll support
class UltraSmoothScroll {
    constructor() {
        this.scrollContainers = [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Find all scroll containers
        this.scrollContainers = [
            ...document.querySelectorAll('.banners-horizontal-scroll'),
            ...document.querySelectorAll('.reels-scroll'),
            ...document.querySelectorAll('.carousel-track')
        ];

        this.setupScrollOptimizations();
        this.isInitialized = true;
        console.log(`Ultra smooth scroll initialized for ${this.scrollContainers.length} containers`);
    }

    setupScrollOptimizations() {
        this.scrollContainers.forEach(container => {
            this.optimizeContainer(container);
        });
    }

    optimizeContainer(container) {
        // Enhanced wheel scroll with momentum - only prevent if horizontal scroll is needed
        container.addEventListener('wheel', (e) => {
            // Only prevent default if we're actually scrolling horizontally
            const isScrollingHorizontally = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            const isAtBoundary = this.isAtScrollBoundary(container, e.deltaX);
            
            if (isScrollingHorizontally || isAtBoundary) {
                e.preventDefault();
                const scrollAmount = e.deltaY * 0.4;
                container.scrollLeft += scrollAmount;
            }
            // If scrolling vertically, let it pass through
        }, { passive: false });

        // Enhanced touch/swipe with momentum and resistance - smart vertical scroll detection
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let isDragging = false;
        let isHorizontalScroll = false;
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;
        let animationFrame = null;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - container.offsetLeft;
            startY = e.touches[0].pageY - container.offsetTop;
            scrollLeft = container.scrollLeft;
            velocity = 0;
            lastX = e.touches[0].pageX;
            lastTime = Date.now();
            isDragging = false;
            isHorizontalScroll = false;
            
            // Cancel any ongoing animation
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (isDragging === false) {
                // Determine scroll direction on first move
                const deltaX = Math.abs(e.touches[0].pageX - startX);
                const deltaY = Math.abs(e.touches[0].pageY - startY);
                
                // Only start horizontal scrolling if horizontal movement is greater
                if (deltaX > deltaY && deltaX > 10) {
                    isHorizontalScroll = true;
                    isDragging = true;
                } else if (deltaY > deltaX && deltaY > 10) {
                    // Vertical scroll detected, don't interfere
                    return;
                }
            }
            
            if (!isDragging || !isHorizontalScroll) return;
            
            e.preventDefault();
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 0.6;
            
            // Apply resistance at boundaries
            const maxScroll = container.scrollWidth - container.clientWidth;
            let boundedScroll = scrollLeft - walk;
            
            if (boundedScroll < 0) {
                boundedScroll = boundedScroll * 0.3;
            } else if (boundedScroll > maxScroll) {
                const excess = boundedScroll - maxScroll;
                boundedScroll = maxScroll + (excess * 0.3);
            }
            
            container.scrollLeft = boundedScroll;
            
            // Calculate velocity for momentum
            const currentTime = Date.now();
            const timeDiff = currentTime - lastTime;
            if (timeDiff > 0) {
                velocity = (e.touches[0].pageX - lastX) / timeDiff;
                lastX = e.touches[0].pageX;
                lastTime = currentTime;
            }
        }, { passive: false });

        container.addEventListener('touchend', () => {
            if (isDragging && isHorizontalScroll) {
                isDragging = false;
                isHorizontalScroll = false;
                
                // Apply momentum scrolling only if we were actually scrolling horizontally
                if (Math.abs(velocity) > 0.02) {
                    this.applyMomentum(container, velocity, animationFrame);
                }
            }
        }, { passive: true });

        // Enhanced mouse drag support - only when actually dragging horizontally
        let mouseStartX = 0;
        let mouseStartY = 0;
        let mouseScrollLeft = 0;
        let isMouseDragging = false;
        let isMouseHorizontalScroll = false;

        container.addEventListener('mousedown', (e) => {
            mouseStartX = e.pageX - container.offsetLeft;
            mouseStartY = e.pageY - container.offsetTop;
            mouseScrollLeft = container.scrollLeft;
            isMouseDragging = false;
            isMouseHorizontalScroll = false;
            container.style.cursor = 'grab';
            e.preventDefault();
        });

        container.addEventListener('mousemove', (e) => {
            if (isMouseDragging === false) {
                // Determine scroll direction on first move
                const deltaX = Math.abs(e.pageX - mouseStartX);
                const deltaY = Math.abs(e.pageY - mouseStartY);
                
                if (deltaX > deltaY && deltaX > 5) {
                    isMouseHorizontalScroll = true;
                    isMouseDragging = true;
                } else if (deltaY > deltaX && deltaY > 5) {
                    return; // Let vertical scroll pass through
                }
            }
            
            if (!isMouseDragging || !isMouseHorizontalScroll) return;
            
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - mouseStartX) * 0.6;
            
            // Apply resistance at boundaries
            const maxScroll = container.scrollWidth - container.clientWidth;
            let boundedScroll = mouseScrollLeft - walk;
            
            if (boundedScroll < 0) {
                boundedScroll = boundedScroll * 0.3;
            } else if (boundedScroll > maxScroll) {
                const excess = boundedScroll - maxScroll;
                boundedScroll = maxScroll + (excess * 0.3);
            }
            
            container.scrollLeft = boundedScroll;
        });

        container.addEventListener('mouseup', () => {
            isMouseDragging = false;
            isMouseHorizontalScroll = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseleave', () => {
            isMouseDragging = false;
            isMouseHorizontalScroll = false;
            container.style.cursor = 'grab';
        });

        // Set initial cursor
        container.style.cursor = 'grab';
    }

    isAtScrollBoundary(container, deltaX) {
        const isAtStart = container.scrollLeft <= 0 && deltaX < 0;
        const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth) && deltaX > 0;
        return isAtStart || isAtEnd;
    }

    applyMomentum(container, velocity, animationFrame) {
        const friction = 0.95;
        const minVelocity = 0.005;
        
        const animate = () => {
            if (Math.abs(velocity) < minVelocity) {
                return;
            }
            
            container.scrollLeft -= velocity * 30;
            velocity *= friction;
            animationFrame = requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // Method to add new scroll container
    addContainer(container) {
        if (container && !this.scrollContainers.includes(container)) {
            this.scrollContainers.push(container);
            this.optimizeContainer(container);
            console.log('Added new scroll container');
        }
    }

    // Method to remove scroll container
    removeContainer(container) {
        const index = this.scrollContainers.indexOf(container);
        if (index > -1) {
            this.scrollContainers.splice(index, 1);
            console.log('Removed scroll container');
        }
    }
}

// Initialize ultra smooth scroll when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const ultraSmoothScroll = new UltraSmoothScroll();
    
    // Make it globally available
    window.ultraSmoothScroll = ultraSmoothScroll;
    
    // Listen for dynamic content loaded events
    document.addEventListener('bannersLoaded', () => {
        setTimeout(() => {
            const bannersContainer = document.querySelector('.banners-horizontal-scroll');
            if (bannersContainer) {
                ultraSmoothScroll.addContainer(bannersContainer);
            }
        }, 100);
    });
    
    document.addEventListener('reelsLoaded', () => {
        setTimeout(() => {
            const reelsContainer = document.querySelector('.reels-scroll');
            if (reelsContainer) {
                ultraSmoothScroll.addContainer(reelsContainer);
            }
        }, 100);
    });
    
    document.addEventListener('flightCardsLoaded', () => {
        setTimeout(() => {
            const carouselContainer = document.querySelector('.carousel-track');
            if (carouselContainer) {
                ultraSmoothScroll.addContainer(carouselContainer);
            }
        }, 100);
    });
});

// Global function to add scroll container
window.addScrollContainer = function(container) {
    if (window.ultraSmoothScroll) {
        window.ultraSmoothScroll.addContainer(container);
    }
};
