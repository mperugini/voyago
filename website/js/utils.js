// Utility functions for improved performance
class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static requestAnimationFrame(callback) {
        return window.requestAnimationFrame || 
               window.webkitRequestAnimationFrame || 
               window.mozRequestAnimationFrame || 
               function(callback) {
                   window.setTimeout(callback, 1000 / 60);
               };
    }

    static cancelAnimationFrame(id) {
        return window.cancelAnimationFrame || 
               window.webkitCancelAnimationFrame || 
               window.mozCancelAnimationFrame || 
               clearTimeout(id);
    }
}

// Smooth scroll utility
class SmoothScroll {
    constructor() {
        this.isScrolling = false;
        this.scrollTimeout = null;
    }

    scrollTo(element, target, duration = 300) {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        const start = element.scrollLeft;
        const change = target - start;
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.scrollLeft = start + (change * easeOut);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                this.isScrolling = false;
            }
        };

        requestAnimationFrame(animateScroll);
    }
}

// Touch gesture detection
class TouchGesture {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            threshold: 50,
            ...options
        };
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isGesture = false;
    }

    onSwipeLeft(callback) {
        this.swipeLeftCallback = callback;
        return this;
    }

    onSwipeRight(callback) {
        this.swipeRightCallback = callback;
        return this;
    }

    onSwipeUp(callback) {
        this.swipeUpCallback = callback;
        return this;
    }

    onSwipeDown(callback) {
        this.swipeDownCallback = callback;
        return this;
    }

    start() {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    stop() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
    }

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.isGesture = false;
    }

    handleTouchMove(e) {
        if (!this.isGesture) {
            this.currentX = e.touches[0].clientX;
            this.currentY = e.touches[0].clientY;
            
            const deltaX = Math.abs(this.currentX - this.startX);
            const deltaY = Math.abs(this.currentY - this.startY);
            
            if (deltaX > this.options.threshold || deltaY > this.options.threshold) {
                this.isGesture = true;
            }
        }
    }

    handleTouchEnd() {
        if (!this.isGesture) return;
        
        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > this.options.threshold && this.swipeRightCallback) {
                this.swipeRightCallback();
            } else if (deltaX < -this.options.threshold && this.swipeLeftCallback) {
                this.swipeLeftCallback();
            }
        } else {
            // Vertical swipe
            if (deltaY > this.options.threshold && this.swipeDownCallback) {
                this.swipeDownCallback();
            } else if (deltaY < -this.options.threshold && this.swipeUpCallback) {
                this.swipeUpCallback();
            }
        }
    }
}

// Make utilities globally available
window.PerformanceUtils = PerformanceUtils;
window.SmoothScroll = SmoothScroll;
window.TouchGesture = TouchGesture;
