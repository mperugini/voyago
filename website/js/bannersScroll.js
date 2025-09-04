// Clean horizontal scroll functionality for banners
class BannersScroll {
    constructor() {
        this.scrollContainer = null;
        this.bannerItems = null;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.init();
    }

    init() {
        this.scrollContainer = document.querySelector('.banners-horizontal-scroll');
        if (!this.scrollContainer) {
            console.log('Banners scroll container not found');
            return;
        }

        this.bannerItems = this.scrollContainer.querySelectorAll('.banner-item');
        this.setupEventListeners();
        
        console.log(`Banners scroll initialized with ${this.bannerItems.length} banners`);
    }

    setupEventListeners() {
        // Enhanced wheel scroll with momentum
        this.scrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Add momentum to wheel scrolling
            const scrollAmount = e.deltaY * 1.5;
            this.scrollContainer.scrollLeft += scrollAmount;
        });

        // Enhanced touch/swipe support with momentum
        let startX = 0;
        let scrollLeft = 0;
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;

        this.scrollContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            scrollLeft = this.scrollContainer.scrollLeft;
            velocity = 0;
            lastX = e.touches[0].pageX;
            lastTime = Date.now();
        });

        this.scrollContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const x = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            const walk = (x - startX) * 1.2; // Slightly faster scroll
            this.scrollContainer.scrollLeft = scrollLeft - walk;
            
            // Calculate velocity for momentum
            const currentTime = Date.now();
            const timeDiff = currentTime - lastTime;
            if (timeDiff > 0) {
                velocity = (e.touches[0].pageX - lastX) / timeDiff;
                lastX = e.touches[0].pageX;
                lastTime = currentTime;
            }
        });

        this.scrollContainer.addEventListener('touchend', () => {
            // Apply momentum scrolling
            if (Math.abs(velocity) > 0.1) {
                const momentum = velocity * 200; // Adjust momentum strength
                this.scrollContainer.scrollBy({
                    left: -momentum,
                    behavior: 'smooth'
                });
            }
        });

        // Keyboard navigation (optional, can be removed if not needed)
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.banners-horizontal-scroll')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.scrollToPrevious();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.scrollToNext();
                }
            }
        });

        // Add subtle scroll indicators (optional)
        this.addScrollIndicators();
    }

    addScrollIndicators() {
        // Create subtle scroll indicators that appear on hover
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'scroll-indicators-subtle';
        indicatorsContainer.innerHTML = `
            <div class="scroll-fade-left"></div>
            <div class="scroll-fade-right"></div>
        `;

        // Insert indicators
        this.scrollContainer.parentNode.insertBefore(indicatorsContainer, this.scrollContainer.nextSibling);

        // Add CSS for subtle indicators
        this.addSubtleIndicatorsCSS();
        
        // Update indicators on scroll
        this.scrollContainer.addEventListener('scroll', () => {
            this.updateSubtleIndicators();
        });
    }

    addSubtleIndicatorsCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .scroll-indicators-subtle {
                position: relative;
                height: 0;
                pointer-events: none;
            }

            .scroll-fade-left,
            .scroll-fade-right {
                position: absolute;
                top: -16px;
                width: 40px;
                height: 245px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
            }

            .scroll-fade-left {
                left: 0;
                background: linear-gradient(to right, rgba(255,255,255,0.9), transparent);
            }

            .scroll-fade-right {
                right: 0;
                background: linear-gradient(to left, rgba(255,255,255,0.9), transparent);
            }

            .banners-horizontal-scroll:hover + .scroll-indicators-subtle .scroll-fade-left,
            .banners-horizontal-scroll:hover + .scroll-indicators-subtle .scroll-fade-right {
                opacity: 1;
            }

            @media (max-width: 768px) {
                .scroll-fade-left,
                .scroll-fade-right {
                    height: 210px;
                }
            }

            @media (max-width: 480px) {
                .scroll-fade-left,
                .scroll-fade-right {
                    height: 175px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    updateSubtleIndicators() {
        const fadeLeft = document.querySelector('.scroll-fade-left');
        const fadeRight = document.querySelector('.scroll-fade-right');
        
        if (!fadeLeft || !fadeRight) return;

        const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;
        
        // Show/hide fade indicators based on scroll position
        fadeLeft.style.opacity = scrollLeft > 10 ? '1' : '0';
        fadeRight.style.opacity = scrollLeft < scrollWidth - clientWidth - 10 ? '1' : '0';
    }

    scrollToPrevious() {
        const scrollAmount = 280 + 16; // Banner width + gap
        this.scrollContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }

    scrollToNext() {
        const scrollAmount = 280 + 16; // Banner width + gap
        this.scrollContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    // Method to add new banner dynamically
    addBanner(bannerData) {
        const bannerItem = document.createElement('div');
        bannerItem.className = 'banner-item';
        bannerItem.innerHTML = `
            <a class="link" href="${bannerData.href}" aria-label="${bannerData.ariaLabel}">
                <div class="multi-banner-wrapper">
                    <img loading="lazy" class="picture" src="${bannerData.imageSrc}" alt="${bannerData.alt}" />
                </div>
            </a>
        `;
        
        this.scrollContainer.appendChild(bannerItem);
        this.bannerItems = this.scrollContainer.querySelectorAll('.banner-item');
        
        console.log(`Added new banner: ${bannerData.ariaLabel}`);
    }
}

// Initialize banners scroll when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const bannersScroll = new BannersScroll();
    
    // Make it globally available
    window.bannersScroll = bannersScroll;
});

// Global function to add banners dynamically
window.addBanner = function(href, ariaLabel, imageSrc, alt) {
    if (window.bannersScroll) {
        window.bannersScroll.addBanner({
            href: href,
            ariaLabel: ariaLabel,
            imageSrc: imageSrc,
            alt: alt
        });
    } else {
        console.error('Banners scroll not initialized');
    }
};
