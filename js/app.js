// Main Application Logic
class App {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAnimations();
    }
    
    setupEventListeners() {
        // Vuelos button
        const vuelosBtn = document.querySelector('.btn-vuelos');
        if (vuelosBtn) {
            vuelosBtn.addEventListener('click', () => this.handleVuelosClick());
        }
        
        // Hoteles button
        const hotelesBtn = document.querySelector('.btn-hoteles');
        if (hotelesBtn) {
            hotelesBtn.addEventListener('click', () => this.handleHotelesClick());
        }
        
        // More button (already handled by onclick in HTML)
        
        // Setup mobile navbar events
        this.setupMobileNavbar();
    }
    
    setupMobileNavbar() {
        // Product container clicks (excluding the "more" button)
        const productContainers = document.querySelectorAll('.product-container[data-product]:not([data-product="more"])');
        productContainers.forEach(container => {
            container.addEventListener('click', (e) => {
                const product = container.dataset.product;
                this.handleProductClick(product);
            });
        });
        
        // Search box click
        const searchBox = document.querySelector('#shifu-searchbox');
        if (searchBox) {
            searchBox.addEventListener('click', () => this.handleSearchBoxClick());
        }
    }
    
    setupAnimations() {
        // Add entrance animations to buttons
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.6s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
        
        // Add entrance animation to hero
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.style.opacity = '0';
            hero.style.transform = 'translateY(-30px)';
            
            setTimeout(() => {
                hero.style.transition = 'all 0.8s ease';
                hero.style.opacity = '1';
                hero.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    handleVuelosClick() {
        console.log('Vuelos clicked');
      //  this.showNotification('✈️ Redirigiendo a búsqueda de vuelos...', 'info');
        
        // Simulate navigation delay
        setTimeout(() => {
      //      this.showNotification('🚀 Funcionalidad de vuelos en desarrollo', 'success');
        }, 1500);
    }
    
    handleHotelesClick() {
        console.log('Hoteles clicked');
     //   this.showNotification('🏨 Redirigiendo a búsqueda de hoteles...', 'info');
        
        // Simulate navigation delay
        setTimeout(() => {
    //        this.showNotification('🌟 Funcionalidad de hoteles en desarrollo', 'success');
        }, 1500);
    }
    
    handleProductClick(product) {
        console.log(`Product clicked: ${product}`);
        
        const productNames = {
            hotels: 'Alojamientos',
            flights: 'Vuelos',
            packages: 'Paquetes',
            rentals: 'Rentas',
            tickets: 'Actividades',
            cars: 'Autos',
            disney: 'Disney',
            universal: 'Universal',
            assistances: 'Asistencias',
            traslate: 'Traslados'
        };
        
        const productName = productNames[product] || product;
     //   this.showNotification(`🚀 Redirigiendo a ${productName}...`, 'info');
        
        // Simulate navigation delay
        setTimeout(() => {
    //        this.showNotification(`✨ Funcionalidad de ${productName} en desarrollo`, 'success');
        }, 1500);
    }
    
    handleSearchBoxClick() {
        console.log('Search box clicked');
   //     this.showNotification('🔍 Abriendo búsqueda de vuelos...', 'info');
        
        // Simulate search box opening
        setTimeout(() => {
     //       this.showNotification('✈️ Funcionalidad de búsqueda en desarrollo', 'success');
        }, 1500);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }
    
    getNotificationColor(type) {
        const colors = {
            info: 'linear-gradient(135deg, #667eea, #764ba2)',
            success: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
            warning: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            error: 'linear-gradient(135deg, #ff4757, #c44569)'
        };
        return colors[type] || colors.info;
    }
}

// Navigation function for menu items
function navigateTo(section) {
    console.log(`🚀 Navegando a: ${section}`);
    
    // Show notification
    if (window.app) {
    //    window.app.showNotification(`🚀 Redirigiendo a ${section}...`, 'info');
    }
    
    // Close bottomsheet
    if (window.bottomSheet) {
        window.bottomSheet.close();
    }
    
    // Navigate to searchbox.html with product parameter
    setTimeout(() => {
        let url;
        let productParam;
        
        switch(section) {
            case 'vuelos':
                productParam = 'flights';
                url = 'searchbox.html?productSelected=flights';
                break;
            case 'hoteles':
                productParam = 'hotels';
                url = 'searchbox.html?productSelected=hotels';
                break;
            case 'paquetes':
                productParam = 'packages';
                url = 'searchbox.html?productSelected=packages';
                break;
            case 'autos':
                productParam = 'cars';
                url = 'searchbox.html?productSelected=cars';
                break;
            case 'actividades':
                productParam = 'activities';
                url = 'searchbox.html?productSelected=activities';
                break;
            case 'eventos':
                productParam = 'events';
                url = 'searchbox.html?productSelected=events';
                break;
            case 'tours':
                productParam = 'tours';
                url = 'searchbox.html?productSelected=tours';
                break;
            case 'perfil':
                productParam = 'profile';
                url = 'searchbox.html?productSelected=profile';
                break;
            case 'reservas':
                productParam = 'bookings';
                url = 'searchbox.html?productSelected=bookings';
                break;
            case 'ayuda':
                productParam = 'help';
                url = 'searchbox.html?productSelected=help';
                break;
            default:
                productParam = 'general';
                url = 'searchbox.html?productSelected=general';
        }
        
        console.log(`🎯 Navegando a: ${url}`);
        console.log(`📱 Producto seleccionado: ${productParam}`);
        
        // Navigate to the URL
        window.location.href = url;
    }, 1000);
}



// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 