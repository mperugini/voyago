// Flight Loader - Simple flight cards with horizontal scroll
class FlightLoader {
    constructor() {
        this.flightsData = null;
        this.isInitialized = false;
    }

    async loadFlightsData() {
        try {
            const response = await fetch('src/data/flights.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.flightsData = data.flights;
            return this.flightsData;
        } catch (error) {
            console.error('Error loading flights data:', error);
            // Fallback to default data if JSON fails to load
            this.flightsData = this.getDefaultFlights();
            return this.flightsData;
        }
    }

    getDefaultFlights() {
        return [
            {
                id: 1,
                category: "Vuelos",
                title: "Vuelos para Orlando",
                origin: "Saliendo de Sao Paulo",
                airline: "Por Latam",
                badge: "Ida y vuelta",
                originalPrice: "S 1.708.000",
                currentPrice: "1.605.000",
                image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
            },
            {
                id: 2,
                category: "Vuelos",
                title: "Vuelos para Miami",
                origin: "Saliendo de Buenos Aires",
                airline: "Por American Airlines",
                badge: "Ida y vuelta",
                originalPrice: "S 2.100.000",
                currentPrice: "1.950.000",
                image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
            },
            {
                id: 3,
                category: "Vuelos",
                title: "Vuelos para Madrid",
                origin: "Saliendo de Buenos Aires",
                airline: "Por Iberia",
                badge: "Ida y vuelta",
                originalPrice: "S 2.500.000",
                currentPrice: "2.200.000",
                image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
            },
            {
                id: 4,
                category: "Vuelos",
                title: "Vuelos para París",
                origin: "Saliendo de Buenos Aires",
                airline: "Por Air France",
                badge: "Ida y vuelta",
                originalPrice: "S 2.800.000",
                currentPrice: "2.500.000",
                image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
            }
        ];
    }

    createFlightCardHTML(flight) {
        return `
            <div class="flight-card" data-flight-id="${flight.id}">
                <div class="flight-image" style="background-image: url('${flight.image}')">
                    <!-- Image background set via CSS -->
                </div>
                <div class="flight-content">
                    <div class="flight-header">
                        <div class="flight-category">${flight.category}</div>
                        <div class="flight-title">${flight.title}</div>
                        <div class="flight-origin">${flight.origin}</div>
                        <div class="flight-airline">${flight.airline}</div>
                    </div>
                    <div class="flight-badge">
                        <span class="badge">${flight.badge}</span>
                    </div>
                </div>
                <div class="flight-footer">
                    <div class="price-section">
                        <div class="price-label">Precio final</div>
                        <div class="price-original">${flight.originalPrice}</div>
                        <div class="price-current">
                            <span class="currency">$</span>
                            <span class="amount">${flight.currentPrice}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadFlightCards() {
        if (!this.flightsData) {
            await this.loadFlightsData();
        }

        const carouselTrack = document.getElementById('carouselTrack');
        if (!carouselTrack) {
            console.error('Carousel track not found');
            return;
        }

        // Remove loading message if it exists
        const loadingMessage = carouselTrack.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        // Generate flight cards from JSON data
        this.flightsData.forEach(flight => {
            const flightCardHTML = this.createFlightCardHTML(flight);
            carouselTrack.insertAdjacentHTML('beforeend', flightCardHTML);
        });

        console.log(`Loaded ${this.flightsData.length} flight cards`);
        
        // Dispatch custom event to notify that flight cards are loaded
        const event = new CustomEvent('flightCardsLoaded', {
            detail: { count: this.flightsData.length }
        });
        document.dispatchEvent(event);
    }

    async initialize() {
        if (this.isInitialized) {
            console.log('Flight loader already initialized');
            return;
        }

        await this.loadFlightCards();
        this.isInitialized = true;
        console.log('Flight loader initialized successfully');
    }

    // Method to add a new flight dynamically
    addFlight(flightData) {
        if (!this.flightsData) {
            this.flightsData = [];
        }
        
        // Generate new ID if not provided
        if (!flightData.id) {
            flightData.id = Math.max(...this.flightsData.map(f => f.id), 0) + 1;
        }
        
        this.flightsData.push(flightData);
        
        const carouselTrack = document.getElementById('carouselTrack');
        if (carouselTrack) {
            const flightCardHTML = this.createFlightCardHTML(flightData);
            carouselTrack.insertAdjacentHTML('beforeend', flightCardHTML);
        }
        
        console.log(`Added new flight: ${flightData.title}`);
    }

    // Method to get flight by ID
    getFlightById(id) {
        return this.flightsData ? this.flightsData.find(flight => flight.id === id) : null;
    }

    // Method to get all flights
    getAllFlights() {
        return this.flightsData || [];
    }

    // Method to filter flights by airline
    filterFlightsByAirline(airline) {
        return this.flightsData ? this.flightsData.filter(flight => 
            flight.airline.toLowerCase().includes(airline.toLowerCase())
        ) : [];
    }
}

// Initialize flight loader when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const flightLoader = new FlightLoader();
    await flightLoader.initialize();
    
    // Make flightLoader globally available for other scripts
    window.flightLoader = flightLoader;
});

// Global functions for easy access
window.addNewFlight = function(category, title, origin, airline, badge, originalPrice, currentPrice, image) {
    if (window.flightLoader) {
        window.flightLoader.addFlight({
            category: category,
            title: title,
            origin: origin,
            airline: airline,
            badge: badge,
            originalPrice: originalPrice,
            currentPrice: currentPrice,
            image: image
        });
    } else {
        console.error('Flight loader not available');
    }
};

window.getFlight = function(id) {
    return window.flightLoader ? window.flightLoader.getFlightById(id) : null;
};

window.getAllFlights = function() {
    return window.flightLoader ? window.flightLoader.getAllFlights() : [];
};

window.filterFlightsByAirline = function(airline) {
    return window.flightLoader ? window.flightLoader.filterFlightsByAirline(airline) : [];
};
