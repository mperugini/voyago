// Simple and ultra smooth horizontal scroll for banners
class BannersScroll {
    constructor() {
        this.scrollContainer = null;
        this.bannerItems = null;
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
        // Simple and smooth wheel scroll
        this.scrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Smooth wheel scrolling
            const scrollAmount = e.deltaY * 0.6; // Reduced for ultra smooth feel
            this.scrollContainer.scrollLeft += scrollAmount;
        });

        // Simple touch/swipe support
        let startX = 0;
        let scrollLeft = 0;
        let isDragging = false;

        this.scrollContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            scrollLeft = this.scrollContainer.scrollLeft;
        });

        this.scrollContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const x = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            const walk = (x - startX) * 0.8; // Reduced for smoother feel
            this.scrollContainer.scrollLeft = scrollLeft - walk;
        });

        this.scrollContainer.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Simple mouse drag support
        let mouseStartX = 0;
        let mouseScrollLeft = 0;
        let isMouseDragging = false;

        this.scrollContainer.addEventListener('mousedown', (e) => {
            isMouseDragging = true;
            mouseStartX = e.pageX - this.scrollContainer.offsetLeft;
            mouseScrollLeft = this.scrollContainer.scrollLeft;
            this.scrollContainer.style.cursor = 'grabbing';
            e.preventDefault();
        });

        this.scrollContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDragging) return;
            
            e.preventDefault();
            const x = e.pageX - this.scrollContainer.offsetLeft;
            const walk = (x - mouseStartX) * 0.8; // Reduced for smoother feel
            this.scrollContainer.scrollLeft = mouseScrollLeft - walk;
        });

        this.scrollContainer.addEventListener('mouseup', () => {
            isMouseDragging = false;
            this.scrollContainer.style.cursor = 'grab';
        });

        this.scrollContainer.addEventListener('mouseleave', () => {
            isMouseDragging = false;
            this.scrollContainer.style.cursor = 'grab';
        });

        // Set initial cursor
        this.scrollContainer.style.cursor = 'grab';
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
