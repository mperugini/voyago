// Demo script to show how to add flights dynamically
// This file demonstrates the API available for managing flights

document.addEventListener('DOMContentLoaded', () => {
    // Wait for flight loader to be available
    setTimeout(() => {
        if (window.flightLoader) {
            console.log('Flight Loader API is ready!');
            
            // Example: Add a new flight dynamically
            // Uncomment the following lines to test adding a new flight
            
            /*
            const newFlight = {
                category: "Vuelos",
                title: "Vuelos para Dubai",
                origin: "Saliendo de Buenos Aires",
                airline: "Por Emirates",
                badge: "Ida y vuelta",
                originalPrice: "$ 1.500.000",
                currentPrice: "1.200.000",
                image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
            };
            
            // Add the new flight
            window.flightLoader.addFlight(newFlight);
            console.log('New flight added to carousel!');
            */
            
            // Example: Filter flights
            // Uncomment to test filtering
            
            /*
            const filteredFlights = window.flightLoader.filterFlights({
                airline: 'American Airlines'
            });
            console.log('Flights by American Airlines:', filteredFlights);
            */
            
            // Example: Get flight by ID
            // Uncomment to test getting a specific flight
            
            /*
            const flight = window.flightLoader.getFlightById(1);
            console.log('Flight with ID 1:', flight);
            */
        }
    }, 1000);
});

// Global functions for easy testing in browser console
window.addNewFlight = function(title, origin, airline, originalPrice, currentPrice) {
    if (!window.flightLoader) {
        console.error('Flight Loader not available');
        return;
    }
    
    const newFlight = {
        category: "Vuelos",
        title: title || "Nuevo Vuelo",
        origin: origin || "Saliendo de Buenos Aires",
        airline: airline || "Por Aerolínea",
        badge: "Ida y vuelta",
        originalPrice: originalPrice || "$ 1.000.000",
        currentPrice: currentPrice || "800.000",
        image: "https://media.staticontent.com/media/pictures/57fcebe7-e3e6-4465-8f39-32d5f9f73e46"
    };
    
    window.flightLoader.addFlight(newFlight);
    console.log('New flight added:', newFlight);
};

window.filterFlightsByAirline = function(airline) {
    if (!window.flightLoader) {
        console.error('Flight Loader not available');
        return;
    }
    
    const filtered = window.flightLoader.filterFlights({ airline: airline });
    console.log(`Flights by ${airline}:`, filtered);
    return filtered;
};

window.getAllFlights = function() {
    if (!window.flightLoader) {
        console.error('Flight Loader not available');
        return;
    }
    
    console.log('All flights:', window.flightLoader.flightsData);
    return window.flightLoader.flightsData;
};
