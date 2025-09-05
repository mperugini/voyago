// Banners Module - Ultra Smooth Mobile Scroll
class BannersModule {
    constructor() {
        this.bannersData = null;
        this.container = null;
        this.scrollContainer = null;
        this.isInitialized = false;
    }

    async loadBannersData() {
        try {
            const response = await fetch('data/banners.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.bannersData = data.banners;
            return this.bannersData;
        } catch (error) {
            console.error('Error loading banners data:', error);
            // Fallback to default data if JSON fails to load
            this.bannersData = this.getDefaultBanners();
            return this.bannersData;
        }
    }

    getDefaultBanners() {
        return [
            {
                id: 1,
                title: "Mendoza",
                href: "https://www.despegar.com.ar/ofertas-viajes/mendoza?H=MKT_2",
                ariaLabel: "Mendoza",
                imageSrc: "https://media.staticontent.com/media/pictures/8c816274-452d-4297-8bb0-b7a1ac8e197a",
                alt: "Mendoza"
            },
            {
                id: 2,
                title: "Bariloche",
                href: "https://www.despegar.com.ar/ofertas-viajes/bariloche?H=MKT_2",
                ariaLabel: "Bariloche",
                imageSrc: "https://media.staticontent.com/media/pictures/0ebe10b4-d15d-434f-a62f-bcbbdbe2ce82",
                alt: "Bariloche"
            }
        ];
    }

    createBannerHTML(banner) {
        return `
            <div class="banner-item" data-banner-id="${banner.id}">
                <a class="link" href="${banner.href}" aria-label="${banner.ariaLabel}">
                    <div class="multi-banner-wrapper">
                        <img loading="lazy" class="picture" src="${banner.imageSrc}" alt="${banner.alt}" />
                    </div>
                </a>
            </div>
        `;
    }

    renderBanners() {
        if (!this.bannersData) {
            console.error('No banners data available');
            return;
        }

        this.container = document.getElementById('banners_mkt');
        if (!this.container) {
            console.error('Banners container element not found');
            return;
        }

        // Create the module structure
        this.container.innerHTML = `
            <h2>Destinos Destacados</h2>
            <div class="banners-horizontal-scroll" id="bannersScrollContainer">
                <!-- Banners will be loaded here -->
            </div>
        `;

        this.scrollContainer = document.getElementById('bannersScrollContainer');
        if (!this.scrollContainer) {
            console.error('Banners scroll container not found');
            return;
        }

        // Generate banners from JSON data
        this.bannersData.forEach(banner => {
            const bannerHTML = this.createBannerHTML(banner);
            this.scrollContainer.insertAdjacentHTML('beforeend', bannerHTML);
        });

        console.log(`Loaded ${this.bannersData.length} banners`);
    }

    async initialize() {
        if (this.isInitialized) {
            console.log('Banners module already initialized');
            return;
        }

        await this.loadBannersData();
        this.renderBanners();
        
        this.isInitialized = true;
        console.log('Banners module initialized successfully');
        
        // Dispatch custom event to notify that banners are loaded
        const event = new CustomEvent('bannersLoaded', {
            detail: { count: this.bannersData.length }
        });
        document.dispatchEvent(event);
    }

    // Method to add a new banner dynamically
    addBanner(bannerData) {
        if (!this.bannersData) {
            this.bannersData = [];
        }
        
        // Generate new ID
        const newId = Math.max(...this.bannersData.map(b => b.id), 0) + 1;
        bannerData.id = newId;
        
        this.bannersData.push(bannerData);
        
        if (this.scrollContainer) {
            const bannerHTML = this.createBannerHTML(bannerData);
            this.scrollContainer.insertAdjacentHTML('beforeend', bannerHTML);
        }
        
        console.log(`Added new banner: ${bannerData.title}`);
    }

    // Method to get banner by ID
    getBannerById(id) {
        return this.bannersData ? this.bannersData.find(banner => banner.id === id) : null;
    }

    // Method to get all banners
    getAllBanners() {
        return this.bannersData || [];
    }

    // Method to update banner
    updateBanner(id, updatedData) {
        if (!this.bannersData) return false;
        
        const index = this.bannersData.findIndex(banner => banner.id === id);
        if (index !== -1) {
            this.bannersData[index] = { ...this.bannersData[index], ...updatedData };
            
            // Update DOM element
            const bannerElement = this.scrollContainer.querySelector(`[data-banner-id="${id}"]`);
            if (bannerElement) {
                bannerElement.outerHTML = this.createBannerHTML(this.bannersData[index]);
            }
            
            console.log(`Updated banner: ${this.bannersData[index].title}`);
            return true;
        }
        return false;
    }

    // Method to remove banner
    removeBanner(id) {
        if (!this.bannersData) return false;
        
        const index = this.bannersData.findIndex(banner => banner.id === id);
        if (index !== -1) {
            this.bannersData.splice(index, 1);
            
            // Remove DOM element
            const bannerElement = this.scrollContainer.querySelector(`[data-banner-id="${id}"]`);
            if (bannerElement) {
                bannerElement.remove();
            }
            
            console.log(`Removed banner with ID: ${id}`);
            return true;
        }
        return false;
    }
}

// Initialize banners module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const bannersModule = new BannersModule();
    await bannersModule.initialize();
    
    // Make bannersModule globally available for other scripts
    window.bannersModule = bannersModule;
});

// Global functions for easy access
window.addBanner = function(title, href, ariaLabel, imageSrc, alt) {
    if (window.bannersModule) {
        window.bannersModule.addBanner({
            title: title,
            href: href,
            ariaLabel: ariaLabel,
            imageSrc: imageSrc,
            alt: alt
        });
    } else {
        console.error('Banners module not available');
    }
};

window.getBanner = function(id) {
    return window.bannersModule ? window.bannersModule.getBannerById(id) : null;
};

window.getAllBanners = function() {
    return window.bannersModule ? window.bannersModule.getAllBanners() : [];
};

window.updateBanner = function(id, data) {
    return window.bannersModule ? window.bannersModule.updateBanner(id, data) : false;
};

window.removeBanner = function(id) {
    return window.bannersModule ? window.bannersModule.removeBanner(id) : false;
};
