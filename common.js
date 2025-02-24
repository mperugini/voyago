async function fetchCityData(cityId) {
    const url = `https://mobile.despegar.com/backend-mobile/v10/trip-mode/home?current_city=${cityId}&site=ar`;
    
    const headers = {
        'X-UpaId': 'ios-default-upa-id',
        'Content-Type': 'application/json',
        'X-ClientInfo': JSON.stringify({ deviceOs: 'iOS' })
    };
    
    try {
        const response = await fetch(url, { method: 'GET', headers: headers, credentials: 'include' });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.cities_by_date) {
            return { city: data.cities_by_date };
        } else {
            throw new Error('No se encontró la clave "cities_by_date" en la respuesta.');
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        return null;
    }
}

// Ejemplo de uso
document.addEventListener("DOMContentLoaded", async () => {
    const cityId = "CIT_1569"; // Puedes cambiarlo dinámicamente
    const cityData = await fetchCityData(cityId);
    console.log(cityData);
});
