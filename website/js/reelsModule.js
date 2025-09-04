// Reels Module - Encapsulated and modular
class ReelsModule {
    constructor() {
        this.reelsData = null;
        this.container = null;
        this.scrollContainer = null;
        this.videoObserver = null;
        this.isInitialized = false;
    }

    async loadReelsData() {
        try {
            const response = await fetch('data/reels.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.reelsData = data.reels;
            return this.reelsData;
        } catch (error) {
            console.error('Error loading reels data:', error);
            // Fallback to default data if JSON fails to load
            this.reelsData = this.getDefaultReels();
            return this.reelsData;
        }
    }

    getDefaultReels() {
        return [
            {
                id: "RLAPP_MX_CUN_XS_holbox",
                title: "Conocé Holbox",
                video: "https://media.staticontent.com/media/documents/683b7593-35d7-40e2-a45d-79f8fc4ee572",
                link: "https://www.despegar.com.ar/actividades/ih1/actividades-en-isla+holbox"
            },
            {
                id: "RLAPP_MX_CUN_INSPI_espera",
                title: "Cancún te espera",
                video: "https://media.staticontent.com/media/documents/dfe8b066-8511-4fef-adda-63ad5d3d4f02",
                link: "https://www.despegar.com.ar/lugares-turisticos/cancun"
            }
        ];
    }

    createReelHTML(reel) {
        return `
            <div class="reel-card" data-reel-id="${reel.id}">
                <video 
                    src="${reel.video}"
                    muted
                    loop
                    playsinline
                    preload="metadata"
                >
                </video>
                <div class="reel-info">
                    <h3 class="reel-title">${reel.title}</h3>
                    <a href="${reel.link}" class="reel-cta">Ver más</a>
                </div>
            </div>
        `;
    }

    renderReels() {
        if (!this.reelsData) {
            console.error('No reels data available');
            return;
        }

        this.container = document.getElementById('reels');
        if (!this.container) {
            console.error('Reels container element not found');
            return;
        }

        // Create the module structure
        this.container.innerHTML = `
            <h2>Reels</h2>
            <div class="reels-scroll" id="reelsScrollContainer">
                <!-- Reels will be loaded here -->
            </div>
        `;

        this.scrollContainer = document.getElementById('reelsScrollContainer');
        if (!this.scrollContainer) {
            console.error('Reels scroll container not found');
            return;
        }

        // Generate reels from JSON data
        this.reelsData.forEach(reel => {
            const reelHTML = this.createReelHTML(reel);
            this.scrollContainer.insertAdjacentHTML('beforeend', reelHTML);
        });

        console.log(`Loaded ${this.reelsData.length} reels`);
    }

    setupVideoObserver() {
        // Intersection Observer para los videos
        this.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play();
                } else {
                    entry.target.pause();
                }
            });
        }, { threshold: 0.5 });

        // Observe all video elements
        const videos = this.scrollContainer.querySelectorAll('video');
        videos.forEach(video => {
            this.videoObserver.observe(video);
        });
    }

    setupScrollFunctionality() {
        if (!this.scrollContainer) {
            console.error('Scroll container not found');
            return;
        }

        // Simple and smooth wheel scroll
        this.scrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
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

    async initialize() {
        if (this.isInitialized) {
            console.log('Reels module already initialized');
            return;
        }

        await this.loadReelsData();
        this.renderReels();
        this.setupVideoObserver();
        this.setupScrollFunctionality();
        
        this.isInitialized = true;
        console.log('Reels module initialized successfully');
        
        // Dispatch custom event to notify that reels are loaded
        const event = new CustomEvent('reelsLoaded', {
            detail: { count: this.reelsData.length }
        });
        document.dispatchEvent(event);
    }

    // Method to add a new reel dynamically
    addReel(reelData) {
        if (!this.reelsData) {
            this.reelsData = [];
        }
        
        // Generate new ID if not provided
        if (!reelData.id) {
            reelData.id = `reel_${Date.now()}`;
        }
        
        this.reelsData.push(reelData);
        
        if (this.scrollContainer) {
            const reelHTML = this.createReelHTML(reelData);
            this.scrollContainer.insertAdjacentHTML('beforeend', reelHTML);
            
            // Observe the new video
            const newVideo = this.scrollContainer.querySelector(`[data-reel-id="${reelData.id}"] video`);
            if (newVideo && this.videoObserver) {
                this.videoObserver.observe(newVideo);
            }
        }
        
        console.log(`Added new reel: ${reelData.title}`);
    }

    // Method to get reel by ID
    getReelById(id) {
        return this.reelsData ? this.reelsData.find(reel => reel.id === id) : null;
    }

    // Method to get all reels
    getAllReels() {
        return this.reelsData || [];
    }

    // Method to update reel
    updateReel(id, updatedData) {
        if (!this.reelsData) return false;
        
        const index = this.reelsData.findIndex(reel => reel.id === id);
        if (index !== -1) {
            this.reelsData[index] = { ...this.reelsData[index], ...updatedData };
            
            // Update DOM element
            const reelElement = this.scrollContainer.querySelector(`[data-reel-id="${id}"]`);
            if (reelElement) {
                reelElement.outerHTML = this.createReelHTML(this.reelsData[index]);
                
                // Re-observe the video
                const video = this.scrollContainer.querySelector(`[data-reel-id="${id}"] video`);
                if (video && this.videoObserver) {
                    this.videoObserver.observe(video);
                }
            }
            
            console.log(`Updated reel: ${this.reelsData[index].title}`);
            return true;
        }
        return false;
    }

    // Method to remove reel
    removeReel(id) {
        if (!this.reelsData) return false;
        
        const index = this.reelsData.findIndex(reel => reel.id === id);
        if (index !== -1) {
            this.reelsData.splice(index, 1);
            
            // Remove DOM element
            const reelElement = this.scrollContainer.querySelector(`[data-reel-id="${id}"]`);
            if (reelElement) {
                reelElement.remove();
            }
            
            console.log(`Removed reel with ID: ${id}`);
            return true;
        }
        return false;
    }

    // Method to pause all videos
    pauseAllVideos() {
        const videos = this.scrollContainer.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
        });
    }

    // Method to play all videos
    playAllVideos() {
        const videos = this.scrollContainer.querySelectorAll('video');
        videos.forEach(video => {
            video.play();
        });
    }

    // Cleanup method
    destroy() {
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }
        this.isInitialized = false;
    }
}

// Initialize reels module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const reelsModule = new ReelsModule();
    await reelsModule.initialize();
    
    // Make reelsModule globally available for other scripts
    window.reelsModule = reelsModule;
});

// Global functions for easy access
window.addReel = function(title, video, link, id) {
    if (window.reelsModule) {
        window.reelsModule.addReel({
            id: id || `reel_${Date.now()}`,
            title: title,
            video: video,
            link: link
        });
    } else {
        console.error('Reels module not available');
    }
};

window.getReel = function(id) {
    return window.reelsModule ? window.reelsModule.getReelById(id) : null;
};

window.getAllReels = function() {
    return window.reelsModule ? window.reelsModule.getAllReels() : [];
};

window.updateReel = function(id, data) {
    return window.reelsModule ? window.reelsModule.updateReel(id, data) : false;
};

window.removeReel = function(id) {
    return window.reelsModule ? window.reelsModule.removeReel(id) : false;
};

window.pauseAllReels = function() {
    if (window.reelsModule) {
        window.reelsModule.pauseAllVideos();
    }
};

window.playAllReels = function() {
    if (window.reelsModule) {
        window.reelsModule.playAllVideos();
    }
};
