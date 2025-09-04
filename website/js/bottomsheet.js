// BottomSheet Component with Native Drag Support
class BottomSheet {
    constructor() {
        this.isDragging = false;
        this.startY = 0;
        this.startTranslateY = 0;
        this.currentTranslateY = 0;
        this.prevTranslateY = 0;
        this.animationID = 0;
        
        this.bottomsheet = document.getElementById('bottomsheet');
        this.overlay = document.getElementById('bottomsheetOverlay');
        this.progressBar = document.getElementById('bottomsheetProgress');
        
        this.init();
    }
    
    init() {
        if (!this.bottomsheet || !this.overlay) {
            console.error('BottomSheet elements not found');
            return;
        }
        
        // Touch events for mobile
        this.bottomsheet.addEventListener('touchstart', this.touchStart.bind(this), { passive: false });
        this.bottomsheet.addEventListener('touchmove', this.touchMove.bind(this), { passive: false });
        this.bottomsheet.addEventListener('touchend', this.touchEnd.bind(this), { passive: false });
        
        // Mouse events for desktop
        this.bottomsheet.addEventListener('mousedown', this.mouseDown.bind(this));
        document.addEventListener('mousemove', this.mouseMove.bind(this));
        document.addEventListener('mouseup', this.mouseUp.bind(this));
        
        // Prevent text selection during drag
        this.bottomsheet.addEventListener('selectstart', (e) => e.preventDefault());
        
        // Prevent default touch behavior on content
        const content = this.bottomsheet.querySelector('.bottomsheet-content');
        if (content) {
            content.addEventListener('touchstart', (e) => {
                // Allow scroll on content area
                e.stopPropagation();
            }, { passive: true });
        }
        
        // Close on overlay click
        this.overlay.addEventListener('click', this.close.bind(this));
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    open() {
        // Reset position first
        this.currentTranslateY = 0;
        this.prevTranslateY = 0;
        
        // Reset any previous transforms
        this.bottomsheet.style.removeProperty('transform');
        
        // Add classes first
        this.bottomsheet.classList.add('active');
        this.overlay.classList.add('active');
        
        // Add animation classes
        this.bottomsheet.classList.add('slide-up');
        this.overlay.classList.add('fade-in');
        
        // Reset progress bar
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        console.log('Closing bottomsheet...');
        
        if (!this.bottomsheet || !this.overlay) {
            console.error('Bottomsheet or overlay not found');
            return;
        }
        
        // Remove animation classes first
        this.bottomsheet.classList.remove('slide-up', 'dragging');
        this.overlay.classList.remove('fade-in');
        
        // Add closing animation
        this.bottomsheet.style.setProperty('transform', 'translateY(100%)', 'important');
        
        // Wait for animation to complete, then remove active classes
        setTimeout(() => {
            this.bottomsheet.classList.remove('active');
            this.overlay.classList.remove('active');
            
            // Reset transform
            this.bottomsheet.style.removeProperty('transform');
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Reset progress bar
            if (this.progressBar) {
                this.progressBar.style.width = '0%';
            }
            
            // Reset drag state
            this.isDragging = false;
            this.currentTranslateY = 0;
            this.prevTranslateY = 0;
            
            console.log('Bottomsheet closed successfully');
        }, 300); // Match the CSS transition duration
    }
    
    // Touch Events for Mobile
    touchStart(e) {
        // Only allow drag from header area
        const header = e.target.closest('.bottomsheet-header');
        if (!header) return;
        
        this.isDragging = true;
        this.startY = e.touches[0].clientY;
        this.startTranslateY = this.currentTranslateY;
        
        this.bottomsheet.classList.add('dragging');
        this.cancelAnimation();
    }
    
    touchMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault(); // Prevent default touch behavior
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - this.startY;
        this.currentTranslateY = this.startTranslateY + diff;
        
        // Limit upward movement
        if (this.currentTranslateY < 0) {
            this.currentTranslateY = 0;
        }
        
        this.setTransform(this.currentTranslateY);
        this.updateProgressBar();
    }
    
    touchEnd() {
        if (!this.isDragging) return;
        
        console.log('Touch end - currentTranslateY:', this.currentTranslateY);
        this.isDragging = false;
        
        this.bottomsheet.classList.remove('dragging');
        
        // Check if dragged down enough to close
        if (this.currentTranslateY > 150) {
            console.log('Closing by drag - distance:', this.currentTranslateY);
            this.close();
        } else {
            console.log('Snapping back - distance:', this.currentTranslateY);
            this.snapToOpen();
        }
    }
    
    // Mouse Events for Desktop
    mouseDown(e) {
        // Only allow drag from header area
        const header = e.target.closest('.bottomsheet-header');
        if (!header) return;
        
        this.isDragging = true;
        this.startY = e.clientY;
        this.startTranslateY = this.currentTranslateY;
        
        this.bottomsheet.classList.add('dragging');
        this.cancelAnimation();
    }
    
    mouseMove(e) {
        if (!this.isDragging) return;
        
        const currentY = e.clientY;
        const diff = currentY - this.startY;
        this.currentTranslateY = this.startTranslateY + diff;
        
        // Limit upward movement
        if (this.currentTranslateY < 0) {
            this.currentTranslateY = 0;
        }
        
        this.setTransform(this.currentTranslateY);
        this.updateProgressBar();
    }
    
    mouseUp() {
        if (!this.isDragging) return;
        
        console.log('Mouse up - currentTranslateY:', this.currentTranslateY);
        this.isDragging = false;
        
        this.bottomsheet.classList.remove('dragging');
        
        // Check if dragged down enough to close
        if (this.currentTranslateY > 150) {
            console.log('Closing by drag - distance:', this.currentTranslateY);
            this.close();
        } else {
            console.log('Snapping back - distance:', this.currentTranslateY);
            this.snapToOpen();
        }
    }
    
    // Helper Functions
    setTransform(y) {
        if (this.bottomsheet) {
            this.bottomsheet.style.setProperty('transform', `translateY(${y}px)`, 'important');
        }
    }
    
    snapToOpen() {
        this.bottomsheet.classList.add('dragging');
        
        const startY = this.currentTranslateY;
        const endY = 0;
        const duration = 300;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.currentTranslateY = startY + (endY - startY) * easeProgress;
            this.setTransform(this.currentTranslateY);
            
            if (progress < 1) {
                this.animationID = requestAnimationFrame(animate);
            } else {
                this.bottomsheet.classList.remove('dragging');
                this.currentTranslateY = 0;
                this.prevTranslateY = 0;
                
                // Remove transform to allow CSS animations
                this.bottomsheet.style.removeProperty('transform');
            }
        };
        
        this.animationID = requestAnimationFrame(animate);
    }
    
    cancelAnimation() {
        if (this.animationID) {
            cancelAnimationFrame(this.animationID);
            this.animationID = 0;
        }
    }
    
    updateProgressBar() {
        if (!this.progressBar) return;
        
        // Calculate progress based on drag distance
        const maxDrag = 150; // Distance needed to close
        const progress = Math.min(Math.max(this.currentTranslateY / maxDrag, 0), 1);
        
        // Update progress bar width
        this.progressBar.style.width = `${progress * 100}%`;
        
        // Change color based on progress
        if (progress > 0.8) {
            this.progressBar.style.background = 'rgba(255, 255, 255, 0.9)';
        } else if (progress > 0.5) {
            this.progressBar.style.background = 'rgba(255, 255, 255, 0.7)';
        } else {
            this.progressBar.style.background = 'rgba(255, 255, 255, 0.4)';
        }
    }
}

// Global functions for HTML onclick
function openBottomSheet() {
    if (window.bottomSheet) {
        window.bottomSheet.open();
    }
}

function closeBottomSheet() {
    if (window.bottomSheet) {
        window.bottomSheet.close();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bottomSheet = new BottomSheet();
}); 