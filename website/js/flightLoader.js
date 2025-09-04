// Flight cards dynamic loader
class FlightLoader {
    constructor() {
        this.flightsData = null;
        this.carouselTrack = null;
    }

    async loadFlights() {
        try {
            const response = await fetch('data/flights.json');
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
                title: "Vuelos para Madrid",
                origin: "Saliendo de Buenos Aires",
                airline: "Por Iberia",
                badge: "Ida y vuelta",
                originalPrice: "$ 1.020.000",
                currentPrice: "850.000",
                image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
            },
            {
                id: 2,
                category: "Vuelos",
                title: "Vuelos para Barcelona",
                origin: "Saliendo de Córdoba",
                airline: "Por Air Europa",
                badge: "Ida y vuelta",
                originalPrice: "$ 900.000",
                currentPrice: "720.000",
                image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
            }
        ];
    }

    createFlightCard(flight) {
        return `
            <div class="flight-card" data-flight-id="${flight.id}">
                <div class="flight-image" style="background-image: url('${flight.image}')"></div>
                <div class="flight-content">
                    <div class="flight-info">
                        <div class="flight-category">${flight.category}</div>
                        <div class="flight-title">${flight.title}</div>
                        <div class="flight-origin">${flight.origin}</div>
                        <div class="flight-airline">${flight.airline}</div>
                        <div class="flight-badge">${flight.badge}</div>
                    </div>
                    <div class="flight-divider"></div>
                    <div class="flight-price-section">
                        <div class="price-label">Precio final</div>
                        <div class="price-container">
                            <div class="original-price">${flight.originalPrice}</div>
                            <div class="current-price">
                                <span class="currency-symbol">$</span>
                                <span class="price-amount">${flight.currentPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFlightCards() {
        if (!this.flightsData) {
            console.error('No flight data available');
            return;
        }

        this.carouselTrack = document.getElementById('carouselTrack');
        if (!this.carouselTrack) {
            console.error('Carousel track element not found');
            return;
        }

        // Clear existing cards
        this.carouselTrack.innerHTML = '';

        // Generate cards from JSON data
        this.flightsData.forEach(flight => {
            const cardHTML = this.createFlightCard(flight);
            this.carouselTrack.insertAdjacentHTML('beforeend', cardHTML);
        });

        console.log(`Loaded ${this.flightsData.length} flight cards`);
    }

    async initialize() {
        await this.loadFlights();
        this.renderFlightCards();
        
        // Dispatch custom event to notify carousel that cards are loaded
        const event = new CustomEvent('flightCardsLoaded', {
            detail: { count: this.flightsData.length }
        });
        document.dispatchEvent(event);
    }

    // Method to add a new flight dynamically
    addFlight(flightData) {
        if (!this.flightsData) {
            this.flightsData = [];
        }
        
        // Generate new ID
        const newId = Math.max(...this.flightsData.map(f => f.id), 0) + 1;
        flightData.id = newId;
        
        this.flightsData.push(flightData);
        this.renderFlightCards();
        
        // Reinitialize carousel with new cards
        const event = new CustomEvent('flightCardsLoaded', {
            detail: { count: this.flightsData.length }
        });
        document.dispatchEvent(event);
    }

    // Method to get flight by ID
    getFlightById(id) {
        return this.flightsData ? this.flightsData.find(flight => flight.id === id) : null;
    }

    // Method to filter flights
    filterFlights(criteria) {
        if (!this.flightsData) return [];
        
        return this.flightsData.filter(flight => {
            return Object.keys(criteria).every(key => {
                if (key === 'title') {
                    return flight.title.toLowerCase().includes(criteria[key].toLowerCase());
                }
                if (key === 'airline') {
                    return flight.airline.toLowerCase().includes(criteria[key].toLowerCase());
                }
                if (key === 'origin') {
                    return flight.origin.toLowerCase().includes(criteria[key].toLowerCase());
                }
                return flight[key] === criteria[key];
            });
        });
    }
}

// Initialize flight loader when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const flightLoader = new FlightLoader();
    await flightLoader.initialize();
    
    // Make flightLoader globally available for other scripts
    window.flightLoader = flightLoader;
});
