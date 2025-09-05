// Ultra Smooth Scroll - Mobile optimized scroll behavior
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
        // Enhanced wheel scroll with momentum
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Smooth wheel scrolling with momentum
            const scrollAmount = e.deltaY * 0.4; // Reduced for ultra smooth feel
            container.scrollLeft += scrollAmount;
        }, { passive: false });

        // Enhanced touch/swipe with momentum and resistance
        let startX = 0;
        let scrollLeft = 0;
        let isDragging = false;
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;
        let animationFrame = null;

        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            velocity = 0;
            lastX = e.touches[0].pageX;
            lastTime = Date.now();
            
            // Cancel any ongoing animation
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 0.6; // Reduced for smoother feel
            
            // Apply resistance at boundaries
            const maxScroll = container.scrollWidth - container.clientWidth;
            let boundedScroll = scrollLeft - walk;
            
            if (boundedScroll < 0) {
                boundedScroll = boundedScroll * 0.3; // Resistance at start
            } else if (boundedScroll > maxScroll) {
                const excess = boundedScroll - maxScroll;
                boundedScroll = maxScroll + (excess * 0.3); // Resistance at end
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
            if (!isDragging) return;
            
            isDragging = false;
            
            // Apply momentum scrolling
            if (Math.abs(velocity) > 0.02) {
                this.applyMomentum(container, velocity, animationFrame);
            }
        }, { passive: true });

        // Enhanced mouse drag support
        let mouseStartX = 0;
        let mouseScrollLeft = 0;
        let isMouseDragging = false;

        container.addEventListener('mousedown', (e) => {
            isMouseDragging = true;
            mouseStartX = e.pageX - container.offsetLeft;
            mouseScrollLeft = container.scrollLeft;
            container.style.cursor = 'grabbing';
            e.preventDefault();
        });

        container.addEventListener('mousemove', (e) => {
            if (!isMouseDragging) return;
            
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - mouseStartX) * 0.6; // Reduced for smoother feel
            
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
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseleave', () => {
            isMouseDragging = false;
            container.style.cursor = 'grab';
        });

        // Set initial cursor
        container.style.cursor = 'grab';
    }

    applyMomentum(container, velocity, animationFrame) {
        const friction = 0.95; // Friction coefficient
        const minVelocity = 0.005; // Minimum velocity to continue scrolling
        
        const animate = () => {
            if (Math.abs(velocity) < minVelocity) {
                return; // Stop animation
            }
            
            // Apply velocity to scroll
            container.scrollLeft -= velocity * 30; // Adjust multiplier for feel
            
            // Apply friction
            velocity *= friction;
            
            // Continue animation
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
