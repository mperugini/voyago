// Reels Module - WebView optimized for iOS and Android
class ReelsModule {
    constructor() {
        this.reelsData = null;
        this.container = null;
        this.scrollContainer = null;
        this.isInitialized = false;
    }

    async loadReelsData() {
        try {
            const response = await fetch('src/data/reels.json');
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
                <div class="reel-video-container">
                    <video 
                        src="${reel.video}"
                        muted
                        loop
                        playsinline
                        preload="none"
                        controls="false"
                        webkit-playsinline="true"
                        x-webkit-airplay="deny"
                        disablepictureinpicture
                        style="pointer-events: none;"
                    >
                    </video>
                    <div class="reel-play-button">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.6)"/>
                            <path d="M25 20L25 40L40 30L25 20Z" fill="white"/>
                        </svg>
                    </div>
                </div>
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

    setupVideoControls() {
        // Manual video controls for WebView (iOS and Android)
        const reelCards = this.scrollContainer.querySelectorAll('.reel-card');
        
        reelCards.forEach(card => {
            const video = card.querySelector('video');
            const playButton = card.querySelector('.reel-play-button');
            
            if (video && playButton) {
                // Prevent default video behavior
                video.addEventListener('loadstart', () => {
                    video.pause();
                });
                
                video.addEventListener('loadedmetadata', () => {
                    video.pause();
                });
                
                // Click to play/pause
                playButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (video.paused) {
                        video.play().catch(err => {
                            console.log('Video play failed:', err);
                        });
                        playButton.style.display = 'none';
                    } else {
                        video.pause();
                        playButton.style.display = 'block';
                    }
                });
                
                // Video events
                video.addEventListener('play', () => {
                    playButton.style.display = 'none';
                });
                
                video.addEventListener('pause', () => {
                    playButton.style.display = 'block';
                });
                
                video.addEventListener('ended', () => {
                    playButton.style.display = 'block';
                });
                
                // Prevent fullscreen on both platforms
                video.addEventListener('webkitbeginfullscreen', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                video.addEventListener('webkitendfullscreen', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                video.addEventListener('fullscreenchange', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                // Prevent context menu and text selection
                video.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });
                
                video.addEventListener('selectstart', (e) => {
                    e.preventDefault();
                });
                
                // Prevent double tap zoom
                video.addEventListener('dblclick', (e) => {
                    e.preventDefault();
                });
            }
        });
    }

    async initialize() {
        if (this.isInitialized) {
            console.log('Reels module already initialized');
            return;
        }

        await this.loadReelsData();
        this.renderReels();
        this.setupVideoControls();
        
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
            
            // Setup controls for new reel
            this.setupVideoControls();
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
            video.play().catch(err => {
                console.log('Video play failed:', err);
            });
        });
    }

    // Cleanup method
    destroy() {
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
