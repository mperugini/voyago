// Custom SearchBox Logic with API Integration and Autocomplete
document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters to determine product type
    const urlParams = new URLSearchParams(window.location.search);
    const productSelected = urlParams.get('productSelected');
    
    console.log('🎯 Product selected from URL:', productSelected);
    
    // Initialize date inputs with today's date and minimums
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Set date minimums and defaults
    const departureInput = document.getElementById('flight-departure');
    const returnInput = document.getElementById('flight-return');
    
    if (departureInput) {
        departureInput.min = todayStr;
        departureInput.value = todayStr;
    }
    
    if (returnInput) {
        returnInput.min = todayStr;
        returnInput.value = tomorrowStr;
    }
    
    // Update return date minimum when departure changes
    if (departureInput && returnInput) {
        departureInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(selectedDate.getDate() + 1);
            returnInput.min = nextDay.toISOString().split('T')[0];
            
            // If return date is before or same as departure, set it to next day
            if (new Date(returnInput.value) <= selectedDate) {
                returnInput.value = nextDay.toISOString().split('T')[0];
            }
        });
    }
    // API Configuration (replicando la configuración de la app original)
    const API_CONFIG = {
        // URL real de la API AWS de la aplicación original
        baseURL: 'https://ln6jlvzgjd.execute-api.sa-east-1.amazonaws.com/production',
        alternativeAPI: 'https://api.aero.tur.ar', // API alternativa
        token: '25a9d36bf49ea21f6a59dad6a356dce3',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token token="25a9d36bf49ea21f6a59dad6a356dce3"',
            'Origin': 'https://a_rolar_viajes.mbc.aero.tur.ar',
            'Referer': 'https://a_rolar_viajes.mbc.aero.tur.ar/'
        },
        // Flag para usar datos simulados (cambiar a false para usar API real)
        useMockData: false
    };

    // Global variables for autocomplete
    let destinationAutocomplete = null;
    let originAutocomplete = null;
    let flightDestinationAutocomplete = null;
    
    // Utility function to normalize text (remove accents and special characters)
    function normalizeText(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    
    // Utility function to remove accents for URL encoding
    function removeAccents(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    // LocalStorage functions for last searches
    function saveLastSearch(item, type = 'hotels') {
        const keyMap = {
            'hotels': 'lastSearches',
            'flights_origin': 'lastSearchesFlight',
            'flights_destination': 'lastSearchesFlightDestination'
        };
        
        const key = keyMap[type] || 'lastSearches';
        let lastSearches = getLastSearches(type);
        
        // Remove if already exists
        lastSearches = lastSearches.filter(search => search.id !== item.id);
        
        // Add to beginning
        lastSearches.unshift(item);
        
        // Keep only last 3 searches
        lastSearches = lastSearches.slice(0, 3);
        
        localStorage.setItem(key, JSON.stringify(lastSearches));
    }
    
    function getLastSearches(type = 'hotels') {
        const keyMap = {
            'hotels': 'lastSearches',
            'flights_origin': 'lastSearchesFlight', 
            'flights_destination': 'lastSearchesFlightDestination'
        };
        
        const key = keyMap[type] || 'lastSearches';
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    // Tab switching functionality for flight types
    const tabs = document.querySelectorAll('.agency-menu-form-search-home-item');
    
    // Initialize tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('agency-menu-form-search-home-item-selected'));
            
            // Add active class to clicked tab
            this.classList.add('agency-menu-form-search-home-item-selected');
            
            // Update flight type based on selected tab
            const returnInput = document.getElementById('flight-return');
            const returnContainer = returnInput?.parentNode;
            const datesContainer = document.querySelector('.dates-container');
            const radioButton = document.querySelector(`input[name="flight-type"][value="${targetTab}"]`);
            
            if (targetTab === 'oneway') {
                // Solo ida - hide return date
                if (returnContainer) {
                    returnContainer.style.display = 'none';
                }
                if (returnInput) {
                    returnInput.disabled = true;
                    returnInput.required = false;
                    returnInput.value = '';
                }
                
                // Update dates container for single date
                if (datesContainer) {
                    datesContainer.classList.add('single-date');
                }
                
                // Update radio button
                if (radioButton) {
                    radioButton.checked = true;
                }
            } else {
                // Ida y vuelta - show return date
                if (returnContainer) {
                    returnContainer.style.display = 'flex';
                }
                if (returnInput) {
                    returnInput.disabled = false;
                    returnInput.required = true;
                    // Set default return date
                    const departureDate = document.getElementById('flight-departure').value;
                    if (departureDate) {
                        const depDate = new Date(departureDate);
                        const retDate = new Date(depDate);
                        retDate.setDate(depDate.getDate() + 1);
                        returnInput.value = retDate.toISOString().split('T')[0];
                    }
                }
                
                // Update dates container for dual dates
                if (datesContainer) {
                    datesContainer.classList.remove('single-date');
                }
                
                // Update radio button
                const roundtripRadio = document.querySelector('input[name="flight-type"][value="roundtrip"]');
                if (roundtripRadio) {
                    roundtripRadio.checked = true;
                }
            }
            
            console.log('🎫 Flight type changed to:', targetTab);
        });
    });

    // API Helper Functions
    async function makeAPICall(endpoint, params = {}) {
        try {
            const url = new URL(`${API_CONFIG.baseURL}${endpoint}`);
            Object.keys(params).forEach(key => {
                if (params[key]) url.searchParams.append(key, params[key]);
            });

            console.log('🔗 API Call:', url.toString());
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: API_CONFIG.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📡 API Response:', data);
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            return { error: error.message };
        }
    }

    // Autocomplete functionality
    function createAutocompleteDropdown(inputElement) {
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 9999;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 0 0 4px 4px;
            width: 100%;
        `;
        
        // Ensure parent has relative positioning and proper styling for passenger dropdown
        const parent = inputElement.parentNode;
        if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }
        // Add overflow visible to ensure dropdown is not clipped
        parent.style.overflow = 'visible';
        parent.appendChild(dropdown);
        console.log('📦 Dropdown created and added to parent');
        console.log('📦 Parent position:', getComputedStyle(parent).position);
        console.log('📦 Dropdown z-index:', dropdown.style.zIndex);
        return dropdown;
    }

    function addAutocompleteItem(dropdown, item, onSelect) {
        const itemElement = document.createElement('div');
        itemElement.className = 'autocomplete-item';
        itemElement.style.cssText = `
            padding: 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            background: white;
        `;
        
        itemElement.innerHTML = `
            <div>
                <div style="font-weight: 600; color: #333;">${item.text || item.name || item.city || item.description}</div>
                <div style="font-size: 12px; color: #666;">${item.airport || ''}</div>
            </div>
        `;
        
        itemElement.addEventListener('mouseenter', () => {
            itemElement.style.backgroundColor = '#f5f5f5';
        });
        
        itemElement.addEventListener('mouseleave', () => {
            itemElement.style.backgroundColor = 'white';
        });
        
        itemElement.addEventListener('click', () => {
            onSelect(item);
            dropdown.style.display = 'none';
        });
        
        dropdown.appendChild(itemElement);
    }

    function addSeparatorLine(dropdown) {
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background: #eee;
            margin: 5px 0;
        `;
        dropdown.appendChild(separator);
    }

    function addSeparatorHeader(dropdown, text, icon = '') {
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 12px;
            background: #f8f9fa;
            font-size: 12px;
            font-weight: 600;
            color: #666;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        header.innerHTML = `${icon} ${text}`;
        dropdown.appendChild(header);
    }

    // Passenger selection component
    function createPassengerSelector(inputElement) {
        const dropdown = document.createElement('div');
        dropdown.className = 'passenger-dropdown';
        dropdown.style.cssText = `
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            background: white !important;
            border: 1px solid var(--color-neutral-300) !important;
            border-top: none !important;
            z-index: 999999 !important;
            display: none !important;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
            border-radius: 0 0 8px 8px !important;
            padding: 20px !important;
            width: calc(100% - 2px) !important;
            min-height: 200px !important;
            margin-top: 0px !important;
        `;

        // Initial passenger counts
        let adults = 1;
        let children = 0;
        let childrenAges = []; // Array to store ages of children

        function updateDisplay() {
            let displayText = `${adults} adulto${adults > 1 ? 's' : ''}`;
            if (children > 0) {
                displayText += `, ${children} menor${children > 1 ? 'es' : ''}`;
            }
            inputElement.value = displayText;
            inputElement.dataset.adults = adults;
            inputElement.dataset.children = children;
            inputElement.dataset.total = adults + children;
            inputElement.dataset.childrenAges = JSON.stringify(childrenAges);
            
            // Create passenger variable in format: adults-child1age-child2age-...
            let passengerVariable = adults.toString();
            if (children > 0) {
                for (let i = 0; i < children; i++) {
                    const age = childrenAges[i] !== undefined ? childrenAges[i] : 11;
                    passengerVariable += `-${age}`;
                }
            }
            inputElement.dataset.passengerVariable = passengerVariable;
            console.log('👥 Passenger variable updated:', passengerVariable);
        }

        function createPassengerRow(label, subtitle, count, onIncrement, onDecrement) {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
            `;

            const labelContainer = document.createElement('div');
            labelContainer.innerHTML = `
                <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${label}</div>
                <div style="font-size: 12px; color: #666;">${subtitle}</div>
            `;

            const controlsContainer = document.createElement('div');
            controlsContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 15px;
            `;

            const decrementBtn = document.createElement('button');
            decrementBtn.innerHTML = '-';
            decrementBtn.style.cssText = `
                width: 32px;
                height: 32px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: 600;
            `;

            const countDisplay = document.createElement('span');
            countDisplay.textContent = count;
            countDisplay.style.cssText = `
                min-width: 20px;
                text-align: center;
                font-weight: 600;
            `;

            const incrementBtn = document.createElement('button');
            incrementBtn.innerHTML = '+';
            incrementBtn.style.cssText = `
                width: 32px;
                height: 32px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: 600;
            `;

            decrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onDecrement();
                countDisplay.textContent = label === 'Adultos' ? adults : children;
                if (label === 'Menores') {
                    updateAgeSelectors();
                }
                updateDisplay();
            });

            incrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onIncrement();
                countDisplay.textContent = label === 'Adultos' ? adults : children;
                if (label === 'Menores') {
                    updateAgeSelectors();
                }
                updateDisplay();
            });

            controlsContainer.appendChild(decrementBtn);
            controlsContainer.appendChild(countDisplay);
            controlsContainer.appendChild(incrementBtn);

            row.appendChild(labelContainer);
            row.appendChild(controlsContainer);

            return row;
        }

        // Create passenger rows
        const adultsRow = createPassengerRow(
            'Adultos',
            'Desde 12 años',
            adults,
            () => { if (adults < 9) adults++; },
            () => { if (adults > 1) adults--; }
        );

        const childrenRow = createPassengerRow(
            'Menores',
            'Hasta 11 años',
            children,
            () => { if (children < 9) children++; },
            () => { if (children > 0) children--; }
        );

        dropdown.appendChild(adultsRow);
        dropdown.appendChild(childrenRow);
        
        // Container for children ages
        const ageContainer = document.createElement('div');
        ageContainer.className = 'children-ages-container';
        ageContainer.style.cssText = `
            display: ${children > 0 ? 'block' : 'none'};
            padding-top: 15px;
            border-top: 1px solid #eee;
            margin-top: 15px;
        `;
        
        function updateAgeSelectors() {
            ageContainer.innerHTML = '';
            
            if (children > 0) {
                ageContainer.style.display = 'block';
                
                // Header for ages section
                const ageHeader = document.createElement('div');
                ageHeader.innerHTML = `
                    <div style="font-weight: 600; color: #333; margin-bottom: 10px;">Edad Menor</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 15px;">Al finalizar el viaje</div>
                `;
                ageContainer.appendChild(ageHeader);
                
                // Create age selectors
                for (let i = 0; i < children; i++) {
                    const ageRow = document.createElement('div');
                    ageRow.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                    `;
                    
                    const ageLabel = document.createElement('div');
                    ageLabel.textContent = `Menor ${i + 1}`;
                    ageLabel.style.cssText = `font-weight: 500; color: #333;`;
                    
                    const ageSelect = document.createElement('select');
                    ageSelect.style.cssText = `
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: white;
                        min-width: 100px;
                    `;
                    
                    // Add age options
                    for (let age = 0; age <= 11; age++) {
                        const option = document.createElement('option');
                        option.value = age;
                        option.textContent = `${age} Años`;
                        if (childrenAges[i] === age || (childrenAges[i] === undefined && age === 11)) {
                            option.selected = true;
                        }
                        ageSelect.appendChild(option);
                    }
                    
                    // Update age when changed
                    ageSelect.addEventListener('change', () => {
                        childrenAges[i] = parseInt(ageSelect.value);
                        updateDisplay();
                    });
                    
                    // Set initial age if not set
                    if (childrenAges[i] === undefined) {
                        childrenAges[i] = 11;
                    }
                    
                    ageRow.appendChild(ageLabel);
                    ageRow.appendChild(ageSelect);
                    ageContainer.appendChild(ageRow);
                }
            } else {
                ageContainer.style.display = 'none';
                childrenAges = [];
            }
        }
        
        dropdown.appendChild(ageContainer);

        // Add done button
        const doneButton = document.createElement('button');
        doneButton.textContent = 'Listo';
        doneButton.style.cssText = `
            width: 100%;
            padding: 12px;
            background: #000;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
        `;

        doneButton.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.style.display = 'none';
        });

        dropdown.appendChild(doneButton);

        // Initialize display
        updateDisplay();

        // Position dropdown
        const parent = inputElement.parentNode;
        console.log('📍 Parent element:', parent);
        console.log('📍 Parent current position:', getComputedStyle(parent).position);
        
        if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
            console.log('📍 Set parent position to relative');
        }
        
        parent.appendChild(dropdown);
        console.log('📍 Dropdown appended to parent');
        console.log('📍 Dropdown in DOM:', document.body.contains(dropdown));

        return dropdown;
    }

    // Create passenger selection modal
    function createPassengerSelectionModal() {
        const modal = document.createElement('div');
        modal.className = 'passenger-modal';
        modal.innerHTML = `
            <div class="passenger-modal-header">
                <button class="passenger-modal-back">←</button>
                <h1 class="passenger-modal-title">Pasajeros</h1>
            </div>
            <div class="passenger-modal-content">
                <div class="passenger-section">
                    <div class="passenger-info">
                        <h3>Mayores</h3>
                        <p>Desde 18 años</p>
                    </div>
                    <div class="passenger-controls">
                        <button class="passenger-btn" id="adults-minus">−</button>
                        <span class="passenger-count" id="adults-count">2</span>
                        <button class="passenger-btn" id="adults-plus">+</button>
                    </div>
                </div>
                <div class="passenger-section">
                    <div class="passenger-info">
                        <h3>Menores</h3>
                        <p>Hasta 17 años</p>
                    </div>
                    <div class="passenger-controls">
                        <button class="passenger-btn" id="children-minus">−</button>
                        <span class="passenger-count" id="children-count">0</span>
                        <button class="passenger-btn" id="children-plus">+</button>
                    </div>
                </div>
                <div class="children-ages-section" id="children-ages-section" style="display: none;"></div>
                <div class="class-section">
                    <h3>Clase</h3>
                    <select class="class-selector" id="travel-class">
                        <option value="economy">Económica</option>
                        <option value="premium">Premium Primera clase</option>
                        <option value="business">Ejecutiva</option>
                        <option value="first">Primera</option>
                    </select>
                </div>
            </div>
            <div class="passenger-modal-footer">
                <button class="apply-btn">Aplicar</button>
            </div>
        `;
        
        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            z-index: 999999;
            display: none;
            flex-direction: column;
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Initialize passenger selector
    function initPassengerSelector() {
        const passengerInput = document.getElementById('flight-passengers');
        
        if (!passengerInput) {
            console.error('❌ Passenger input not found!');
            return;
        }

        // Create modal
        const passengerModal = createPassengerSelectionModal();
        const modalBack = passengerModal.querySelector('.passenger-modal-back');
        const applyBtn = passengerModal.querySelector('.apply-btn');
        
        // Get control elements
        const adultsCount = passengerModal.querySelector('#adults-count');
        const childrenCount = passengerModal.querySelector('#children-count');
        const adultsPlus = passengerModal.querySelector('#adults-plus');
        const adultsMinus = passengerModal.querySelector('#adults-minus');
        const childrenPlus = passengerModal.querySelector('#children-plus');
        const childrenMinus = passengerModal.querySelector('#children-minus');
        const travelClass = passengerModal.querySelector('#travel-class');
        const childrenAgesSection = passengerModal.querySelector('#children-ages-section');
        
        // State
        let adults = 2;
        let children = 0;
        let selectedClass = 'economy';
        let childrenAges = []; // Array to store ages
        
        // Update children ages section
        function updateChildrenAgesSection() {
            if (children === 0) {
                childrenAgesSection.style.display = 'none';
                childrenAges = [];
            } else {
                childrenAgesSection.style.display = 'block';
                
                // Adjust ages array
                while (childrenAges.length < children) {
                    childrenAges.push(11); // Default age
                }
                while (childrenAges.length > children) {
                    childrenAges.pop();
                }
                
                // Create age selectors
                childrenAgesSection.innerHTML = '';
                for (let i = 0; i < children; i++) {
                    const ageRow = document.createElement('div');
                    ageRow.className = 'children-age-row';
                    ageRow.innerHTML = `
                        <span class="age-label">Menor ${i + 1}</span>
                        <select class="age-selector" data-index="${i}">
                            ${Array.from({length: 17}, (_, age) => age + 1).map(age => 
                                `<option value="${age}" ${age === childrenAges[i] ? 'selected' : ''}>${age} año${age > 1 ? 's' : ''}</option>`
                            ).join('')}
                        </select>
                    `;
                    
                    // Add event listener to age selector
                    const ageSelector = ageRow.querySelector('.age-selector');
                    ageSelector.addEventListener('change', function() {
                        const index = parseInt(this.dataset.index);
                        childrenAges[index] = parseInt(this.value);
                        updatePassengerDisplay();
                    });
                    
                    childrenAgesSection.appendChild(ageRow);
                }
            }
        }

        // Update display
        function updatePassengerDisplay() {
            adultsCount.textContent = adults;
            childrenCount.textContent = children;
            
            // Enable/disable buttons
            adultsMinus.disabled = adults <= 1;
            childrenMinus.disabled = children <= 0;
            adultsPlus.disabled = adults >= 9;
            childrenPlus.disabled = children >= 8;
            
            // Update children ages section
            updateChildrenAgesSection();
            
            // Update input display
            let displayText = `${adults} adulto${adults > 1 ? 's' : ''}`;
            if (children > 0) {
                displayText += `, ${children} menor${children > 1 ? 'es' : ''}`;
            }
            
            const classText = travelClass.options[travelClass.selectedIndex].text;
            passengerInput.value = `${displayText}, ${classText}`;
            
            // Update datasets
            passengerInput.dataset.adults = adults;
            passengerInput.dataset.children = children;
            passengerInput.dataset.total = adults + children;
            passengerInput.dataset.class = selectedClass;
            passengerInput.dataset.childrenAges = JSON.stringify(childrenAges);
            
            // Create passenger variable with real ages
            let passengerVariable = adults.toString();
            if (children > 0) {
                for (let i = 0; i < children; i++) {
                    const age = childrenAges[i] || 11;
                    passengerVariable += `-${age}`;
                }
            }
            passengerInput.dataset.passengerVariable = passengerVariable;
        }
        
        // Event listeners
        adultsPlus.addEventListener('click', () => {
            if (adults < 9) {
                adults++;
                updatePassengerDisplay();
            }
        });
        
        adultsMinus.addEventListener('click', () => {
            if (adults > 1) {
                adults--;
                updatePassengerDisplay();
            }
        });
        
        childrenPlus.addEventListener('click', () => {
            if (children < 8) {
                children++;
                updatePassengerDisplay();
            }
        });
        
        childrenMinus.addEventListener('click', () => {
            if (children > 0) {
                children--;
                updatePassengerDisplay();
            }
        });
        
        travelClass.addEventListener('change', () => {
            selectedClass = travelClass.value;
            updatePassengerDisplay();
        });
        
        // Show modal when input is clicked
        passengerInput.addEventListener('click', (e) => {
            e.preventDefault();
            passengerModal.style.display = 'flex';
        });
        
        // Make input readonly
        passengerInput.setAttribute('readonly', 'true');
        
        // Close modal
        modalBack.addEventListener('click', () => {
            passengerModal.style.display = 'none';
        });
        
        applyBtn.addEventListener('click', () => {
            passengerModal.style.display = 'none';
        });
        
        // Initialize display
        updatePassengerDisplay();
        
        console.log('✅ Passenger modal selector initialized successfully');
    }

    // Location Search for Hotels
    async function searchHotelDestinations(query) {
        if (query.length < 2) return [];
        
        // Use mock data if configured
        if (API_CONFIG.useMockData) {
            return getMockHotelDestinations(query);
        }
        
        try {
            const data = await makeAPICall('/locations', {
                q: query
            });
            
            // API returns data.data with items that have {id, text} format
            if (data && data.data && Array.isArray(data.data)) {
                return data.data.map(item => ({
                    id: item.id,
                    text: item.text,
                    name: item.text.split(', ')[1] || item.text, // Extract city name
                    country: item.text.split(', ')[0] || '', // Extract country name
                    type: 'city'
                }));
            }
            
            return data.locations || data.results || [];
        } catch (error) {
            console.warn('API failed, using mock data for hotel destinations');
            return getMockHotelDestinations(query);
        }
    }

    // Location Search for Flight Origins
    async function searchFlightOrigins(query) {
        if (query.length < 2) return [];
        
        // Use mock data if configured
        if (API_CONFIG.useMockData) {
            return getMockFlightDestinations(query);
        }
        
        try {
            const data = await makeAPICall('/cities', {
                criteria: query
            });
            
            // API returns data.data with items that have {id, text} format
            if (data && data.data && Array.isArray(data.data)) {
                const results = data.data.map(item => ({
                    id: item.id, // This should be the numeric ID from API
                    text: item.text,
                    name: item.text.split(', ')[1] ? item.text.split(', ')[1].split(' (')[0] : item.text, // Extract city name
                    country: item.text.split(', ')[0] || '', // Extract country name
                    code: item.text.match(/\(([^)]+)\)/) ? item.text.match(/\(([^)]+)\)/)[1] : '', // Extract code
                    airport: item.text,
                    type: 'airport'
                }));
                console.log('🌐 Processed API flight origin results:', results);
                return results;
            }
            
            console.log('⚠️ API data format unexpected:', data);
            return data.airports || data.results || [];
        } catch (error) {
            console.warn('🌐 API failed for flight origins, using mock data:', error.message);
            return getMockFlightDestinations(query);
        }
    }

    // Location Search for Flight Destinations  
    async function searchFlightDestinations(query) {
        if (query.length < 2) return [];
        
        // Use mock data if configured
        if (API_CONFIG.useMockData) {
            return getMockFlightDestinations(query);
        }
        
        try {
            const data = await makeAPICall('/locations', {
                q: query
            });
            
            // API returns data.data with items that have {id, text} format
            if (data && data.data && Array.isArray(data.data)) {
                const results = data.data.map(item => ({
                    id: item.id, // This should be the numeric ID from API
                    text: item.text,
                    name: item.text.split(', ')[1] ? item.text.split(', ')[1].split(' (')[0] : item.text, // Extract city name
                    country: item.text.split(', ')[0] || '', // Extract country name
                    code: item.text.match(/\(([^)]+)\)/) ? item.text.match(/\(([^)]+)\)/)[1] : '', // Extract code
                    airport: item.text,
                    type: 'airport'
                }));
                console.log('🌐 Processed API flight destination results:', results);
                return results;
            }
            
            console.log('⚠️ API data format unexpected:', data);
            return data.airports || data.results || [];
        } catch (error) {
            console.warn('🌐 API failed for flight destinations, using mock data:', error.message);
            return getMockFlightDestinations(query);
        }
    }

    // Mock data fallbacks
    function getMockHotelDestinations(query) {
        const mockDestinations = [
            { name: 'Buenos Aires', country: 'Argentina', id: 'BUE', type: 'city', text: 'Argentina, Buenos Aires' },
            { name: 'Miami', country: 'Estados Unidos', id: 'MIA', type: 'city', text: 'Estados Unidos, Miami' },
            { name: 'París', country: 'Francia', id: 'PAR', type: 'city', text: 'Francia, París' },
            { name: 'Roma', country: 'Italia', id: 'ROM', type: 'city', text: 'Italia, Roma' },
            { name: 'Barcelona', country: 'España', id: 'BCN', type: 'city', text: 'España, Barcelona' },
            { name: 'Nueva York', country: 'Estados Unidos', id: 'NYC', type: 'city', text: 'Estados Unidos, Nueva York' },
            { name: 'Londres', country: 'Reino Unido', id: 'LON', type: 'city', text: 'Reino Unido, Londres' },
            { name: 'Madrid', country: 'España', id: 'MAD', type: 'city', text: 'España, Madrid' },
            { name: 'Cancún', country: 'México', id: 'CUN', type: 'city', text: 'México, Cancún' },
            { name: 'Río de Janeiro', country: 'Brasil', id: 'RIO', type: 'city', text: 'Brasil, Río de Janeiro' }
        ];
        
        const normalizedQuery = normalizeText(query);
        return mockDestinations.filter(dest => 
            normalizeText(dest.name).includes(normalizedQuery) ||
            normalizeText(dest.country).includes(normalizedQuery)
        );
    }

    function getMockFlightDestinations(query) {
        const mockAirports = [
            { name: 'Buenos Aires', code: 'BUE', country: 'Argentina', airport: 'Ezeiza International Airport', text: 'Argentina, Buenos Aires (BUE)', id: 975 },
            { name: 'Miami', code: 'MIA', country: 'Estados Unidos', airport: 'Miami International Airport', text: 'Estados Unidos, Miami (MIA)', id: 4239 },
            { name: 'Lima', code: 'LIM', country: 'Perú', airport: 'Jorge Chávez International Airport', text: 'Perú, Lima (LIM)', id: 2834 },
            { name: 'París', code: 'CDG', country: 'Francia', airport: 'Charles de Gaulle Airport', text: 'Francia, París (CDG)', id: 1382 },
            { name: 'Roma', code: 'FCO', country: 'Italia', airport: 'Leonardo da Vinci Airport', text: 'Italia, Roma (FCO)', id: 2946 },
            { name: 'Barcelona', code: 'BCN', country: 'España', airport: 'Barcelona El Prat Airport', text: 'España, Barcelona (BCN)', id: 1335 },
            { name: 'Nueva York', code: 'JFK', country: 'Estados Unidos', airport: 'John F. Kennedy International Airport', text: 'Estados Unidos, Nueva York (JFK)', id: 4206 },
            { name: 'Londres', code: 'LHR', country: 'Reino Unido', airport: 'Heathrow Airport', text: 'Reino Unido, Londres (LHR)', id: 2789 },
            { name: 'Madrid', code: 'MAD', country: 'España', airport: 'Adolfo Suárez Madrid-Barajas Airport', text: 'España, Madrid (MAD)', id: 1679 },
            { name: 'Cancún', code: 'CUN', country: 'México', airport: 'Cancún International Airport', text: 'México, Cancún (CUN)', id: 3847 },
            { name: 'Río de Janeiro', code: 'GIG', country: 'Brasil', airport: 'Galeão International Airport', text: 'Brasil, Río de Janeiro (GIG)', id: 891 }
        ];
        
        const normalizedQuery = normalizeText(query);
        return mockAirports.filter(airport => 
            normalizeText(airport.name).includes(normalizedQuery) ||
            normalizeText(airport.code).includes(normalizedQuery) ||
            normalizeText(airport.country).includes(normalizedQuery)
        );
    }

    // Initialize Autocomplete for Hotel Destination
    function initHotelDestinationAutocomplete() {
        const input = document.getElementById('hotel-destination');
        if (!input) {
            console.warn('Hotel destination input not found');
            return;
        }
        console.log('🎯 Initializing autocomplete for input:', input);
        console.log('🎯 Input parent:', input.parentNode);
        const dropdown = createAutocompleteDropdown(input);
        console.log('🎯 Dropdown created:', dropdown);
        let timeoutId;

        input.addEventListener('input', async function() {
            clearTimeout(timeoutId);
            const query = this.value.trim();
            
            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }

            timeoutId = setTimeout(async () => {
                const results = await searchHotelDestinations(query);
                const lastSearches = getLastSearches('hotels');
                dropdown.innerHTML = '';
                
                let allItems = [];
                
                // Add search results first
                if (results.length > 0) {
                    allItems = results.slice(0, 5); // Limit API results to make room for last searches
                }
                
                // Add separator and last searches if we have results and last searches
                if (results.length > 0 && lastSearches.length > 0) {
                    allItems.push({ separatorLine: true });
                    allItems.push({ 
                        separator: true, 
                        text: "Últimas búsquedas",
                        icon: "🔍"
                    });
                    allItems = allItems.concat(lastSearches.slice(0, 3));
                } else if (results.length === 0 && lastSearches.length > 0) {
                    // Only show last searches if no API results
                    allItems.push({ 
                        separator: true, 
                        text: "Últimas búsquedas",
                        icon: "🔍"
                    });
                    allItems = allItems.concat(lastSearches.slice(0, 5));
                }
                
                if (allItems.length > 0) {
                    allItems.forEach(item => {
                        if (item.separatorLine) {
                            addSeparatorLine(dropdown);
                        } else if (item.separator) {
                            addSeparatorHeader(dropdown, item.text, item.icon);
                        } else {
                            addAutocompleteItem(dropdown, item, (selected) => {
                                input.value = selected.text || selected.name;
                                input.dataset.selectedId = selected.id;
                                input.dataset.selectedType = selected.type;
                                // Save to last searches
                                saveLastSearch(selected, 'hotels');
                            });
                        }
                    });
                    dropdown.style.display = 'block';
                } else {
                    dropdown.style.display = 'none';
                }
            }, 300);
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    // Create full-screen city selection modal
    function createCitySelectionModal() {
        const modal = document.createElement('div');
        modal.className = 'city-modal';
        modal.innerHTML = `
            <div class="city-modal-header">
                <button class="city-modal-back">←</button>
                <h1 class="city-modal-title">Ingresa el nombre de la ciudad</h1>
            </div>
            <div class="city-modal-content">
                <div class="city-modal-search">
                    <input type="text" class="city-modal-input" placeholder="Ingresá al menos 3 letras">
                </div>
                <div class="city-modal-results"></div>
            </div>
        `;
        
        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            z-index: 999999;
            display: none;
            flex-direction: column;
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Initialize Autocomplete for Flight Origins and Destinations
    function initFlightAutocomplete() {
        const originInput = document.getElementById('flight-origin');
        const destinationInput = document.getElementById('flight-destination');
        
        // Create the modal once
        const cityModal = createCitySelectionModal();
        const modalInput = cityModal.querySelector('.city-modal-input');
        const modalResults = cityModal.querySelector('.city-modal-results');
        const modalBack = cityModal.querySelector('.city-modal-back');
        const modalTitle = cityModal.querySelector('.city-modal-title');
        
        let currentTargetInput = null;
        let currentSearchType = null;
        
        // Handle modal close
        modalBack.addEventListener('click', () => {
            cityModal.style.display = 'none';
            modalInput.value = '';
            modalResults.innerHTML = '';
        });
        
        // Only process flight inputs, not hotel inputs
        [originInput, destinationInput].forEach(input => {
            if (!input) {
                console.warn('Flight input not found');
                return;
            }
            
            // Replace input event with click event to open modal
            input.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Set current target
                currentTargetInput = this;
                currentSearchType = this.id === 'flight-origin' ? 'flights_origin' : 'flights_destination';
                
                // Update modal title based on input type
                const isOrigin = this.id === 'flight-origin';
                modalTitle.textContent = isOrigin ? 'Selecciona ciudad de origen' : 'Selecciona ciudad de destino';
                
                // Show modal
                cityModal.style.display = 'flex';
                
                // Focus on modal input
                setTimeout(() => {
                    modalInput.focus();
                }, 100);
            });
            
            // Make input readonly to prevent keyboard on mobile
            input.setAttribute('readonly', 'true');
        });
        
        // Handle search in modal
        let timeoutId;
        modalInput.addEventListener('input', async function() {
            clearTimeout(timeoutId);
            const query = this.value.trim();
            
            if (query.length < 2) {
                modalResults.innerHTML = '';
                return;
            }

            const isOrigin = currentTargetInput.id === 'flight-origin';

            timeoutId = setTimeout(async () => {
                const results = isOrigin ? await searchFlightOrigins(query) : await searchFlightDestinations(query);
                const lastSearches = getLastSearches(currentSearchType);
                modalResults.innerHTML = '';
                
                let allItems = [];
                
                // Add search results first
                if (results.length > 0) {
                    allItems = results.slice(0, 8);
                }
                
                // Add last searches if no results
                if (results.length === 0 && lastSearches.length > 0) {
                    allItems = lastSearches.slice(0, 5);
                }
                
                if (allItems.length > 0) {
                    allItems.forEach(item => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'city-modal-result';
                        resultItem.innerHTML = `
                            <div class="result-main">${item.text || item.name}</div>
                            <div class="result-airport">${item.airport || ''}</div>
                        `;
                        
                        resultItem.addEventListener('click', () => {
                            // Set values to target input
                            currentTargetInput.value = item.text || item.name;
                            currentTargetInput.dataset.selectedCode = item.code;
                            currentTargetInput.dataset.selectedAirport = item.airport;
                            currentTargetInput.dataset.selectedId = item.id;
                            
                            // Save to last searches
                            saveLastSearch(item, currentSearchType);
                            
                            // Close modal
                            cityModal.style.display = 'none';
                            modalInput.value = '';
                            modalResults.innerHTML = '';
                        });
                        
                        modalResults.appendChild(resultItem);
                    });
                }
            }, 300);
        });
    }

    // Initialize Hotel Destination Modal (similar to flights but for hotels)
    function initHotelDestinationModal() {
        const destinationInput = document.getElementById('hotel-destination');
        
        if (!destinationInput) {
            console.warn('Hotel destination input not found');
            return;
        }
        
        // Create the modal once
        const cityModal = createCitySelectionModal();
        const modalInput = cityModal.querySelector('.city-modal-input');
        const modalResults = cityModal.querySelector('.city-modal-results');
        const modalBack = cityModal.querySelector('.city-modal-back');
        const modalTitle = cityModal.querySelector('.city-modal-title');
        
        // Handle modal close
        modalBack.addEventListener('click', () => {
            cityModal.style.display = 'none';
            modalInput.value = '';
            modalResults.innerHTML = '';
        });
        
        // Open modal when destination input is clicked
        destinationInput.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update modal title
            modalTitle.textContent = 'Selecciona destino del hotel';
            
            // Show modal
            cityModal.style.display = 'flex';
            
            // Focus on modal input
            setTimeout(() => {
                modalInput.focus();
            }, 100);
        });
        
        // Handle search in modal
        let timeoutId;
        modalInput.addEventListener('input', async function() {
            clearTimeout(timeoutId);
            const query = this.value.trim();
            
            if (query.length < 2) {
                modalResults.innerHTML = '';
                return;
            }

            timeoutId = setTimeout(async () => {
                const results = await searchHotelDestinations(query);
                const lastSearches = getLastSearches('hotels');
                modalResults.innerHTML = '';
                
                let allItems = [];
                
                // Add search results first
                if (results.length > 0) {
                    allItems = results.slice(0, 8);
                }
                
                // Add last searches if no results
                if (results.length === 0 && lastSearches.length > 0) {
                    allItems = lastSearches.slice(0, 5);
                }
                
                if (allItems.length > 0) {
                    allItems.forEach(item => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'city-modal-result';
                        resultItem.innerHTML = `
                            <div class="result-main">${item.text || item.name}</div>
                            <div class="result-country">${item.country || ''}</div>
                        `;
                        
                        resultItem.addEventListener('click', () => {
                            // Set values to destination input
                            destinationInput.value = item.text || item.name;
                            destinationInput.dataset.selectedId = item.id;
                            destinationInput.dataset.selectedType = item.type;
                            
                            // Save to last searches
                            saveLastSearch(item, 'hotels');
                            
                            // Close modal
                            cityModal.style.display = 'none';
                            modalInput.value = '';
                            modalResults.innerHTML = '';
                        });
                        
                        modalResults.appendChild(resultItem);
                    });
                }
            }, 300);
        });
        
        console.log('✅ Hotel destination modal initialized successfully');
    }

    // Initialize Hotel Guest Selection Modal (Per-Room Distribution)
    function initHotelGuestModal() {
        const guestInput = document.getElementById('hotel-guests');
        
        if (!guestInput) {
            console.warn('Hotel guests input not found');
            return;
        }

        // Create guest selection modal
        const modal = document.createElement('div');
        modal.className = 'hotel-guest-modal';
        modal.innerHTML = `
            <div class="guest-modal-header">
                <button class="guest-modal-back">←</button>
                <h1 class="guest-modal-title">Habitaciones</h1>
            </div>
            <div class="guest-modal-content" id="rooms-container">
                <!-- Rooms will be dynamically created here -->
            </div>
            <div class="guest-modal-footer">
                <button class="add-room-btn">Añadir habitación</button>
                <button class="apply-btn">Aplicar</button>
            </div>
        `;
        
        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            z-index: 999999;
            display: none;
            flex-direction: column;
        `;
        
        document.body.appendChild(modal);
        
        // Get control elements
        const modalBack = modal.querySelector('.guest-modal-back');
        const applyBtn = modal.querySelector('.apply-btn');
        const addRoomBtn = modal.querySelector('.add-room-btn');
        const roomsContainer = modal.querySelector('#rooms-container');
        
        // State - Array of rooms, each with adults, children, and childrenAges
        let rooms = [
            { adults: 2, children: 0, childrenAges: [] }
        ];
        
        // Create a single room section
        function createRoomSection(roomIndex) {
            const room = rooms[roomIndex];
            const canDelete = rooms.length > 1;
            
            const roomSection = document.createElement('div');
            roomSection.className = 'room-section';
            roomSection.dataset.roomIndex = roomIndex;
            
            roomSection.innerHTML = `
                <div class="room-header">
                    <h3 class="room-title">Habitación ${roomIndex + 1}</h3>
                    ${canDelete ? '<button class="delete-room-btn">Eliminar</button>' : ''}
                </div>
                
                <div class="guest-section">
                    <div class="guest-info">
                        <h4>Mayores</h4>
                        <p>Desde 18 años</p>
                    </div>
                    <div class="guest-controls">
                        <button class="guest-btn adults-minus" data-room="${roomIndex}">−</button>
                        <span class="guest-count adults-count">${room.adults}</span>
                        <button class="guest-btn adults-plus" data-room="${roomIndex}">+</button>
                    </div>
                </div>
                
                <div class="guest-section">
                    <div class="guest-info">
                        <h4>Menores</h4>
                        <p>Hasta 17 años</p>
                    </div>
                    <div class="guest-controls">
                        <button class="guest-btn children-minus" data-room="${roomIndex}">−</button>
                        <span class="guest-count children-count">${room.children}</span>
                        <button class="guest-btn children-plus" data-room="${roomIndex}">+</button>
                    </div>
                </div>
                
                <div class="children-ages-container" ${room.children === 0 ? 'style="display: none;"' : ''}></div>
            `;
            
            // Update children ages for this room
            updateChildrenAgesForRoom(roomSection, roomIndex);
            
            return roomSection;
        }
        
        // Update children ages section for a specific room
        function updateChildrenAgesForRoom(roomSection, roomIndex) {
            const room = rooms[roomIndex];
            const agesContainer = roomSection.querySelector('.children-ages-container');
            
            if (room.children === 0) {
                agesContainer.style.display = 'none';
                agesContainer.innerHTML = '';
                room.childrenAges = [];
            } else {
                agesContainer.style.display = 'block';
                
                // Adjust ages array
                while (room.childrenAges.length < room.children) {
                    room.childrenAges.push(10); // Default age
                }
                while (room.childrenAges.length > room.children) {
                    room.childrenAges.pop();
                }
                
                // Create age selectors
                agesContainer.innerHTML = '';
                for (let i = 0; i < room.children; i++) {
                    const ageRow = document.createElement('div');
                    ageRow.className = 'age-row';
                    ageRow.innerHTML = `
                        <span class="age-label">Edad del menor ${i + 1}</span>
                        <p class="age-subtitle">Al finalizar el viaje</p>
                        <select class="age-selector" data-room="${roomIndex}" data-child="${i}">
                            ${Array.from({length: 17}, (_, age) => age + 1).map(age => 
                                `<option value="${age}" ${age === room.childrenAges[i] ? 'selected' : ''}>${age} año${age > 1 ? 's' : ''}</option>`
                            ).join('')}
                        </select>
                    `;
                    
                    // Add event listener to age selector
                    const ageSelector = ageRow.querySelector('.age-selector');
                    ageSelector.addEventListener('change', function() {
                        const roomIdx = parseInt(this.dataset.room);
                        const childIdx = parseInt(this.dataset.child);
                        rooms[roomIdx].childrenAges[childIdx] = parseInt(this.value);
                        updateGuestDisplay();
                    });
                    
                    agesContainer.appendChild(ageRow);
                }
            }
        }
        
        // Render all rooms
        function renderAllRooms() {
            roomsContainer.innerHTML = '';
            
            rooms.forEach((room, index) => {
                const roomSection = createRoomSection(index);
                roomsContainer.appendChild(roomSection);
            });
            
            // Add event listeners to all buttons
            addRoomEventListeners();
        }
        
        // Add event listeners to room buttons
        function addRoomEventListeners() {
            // Adults plus/minus buttons
            document.querySelectorAll('.adults-plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const roomIndex = parseInt(btn.dataset.room);
                    if (rooms[roomIndex].adults < 8) {
                        rooms[roomIndex].adults++;
                        updateRoomDisplay(roomIndex);
                        updateGuestDisplay();
                    }
                });
            });
            
            document.querySelectorAll('.adults-minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const roomIndex = parseInt(btn.dataset.room);
                    if (rooms[roomIndex].adults > 1) {
                        rooms[roomIndex].adults--;
                        updateRoomDisplay(roomIndex);
                        updateGuestDisplay();
                    }
                });
            });
            
            // Children plus/minus buttons
            document.querySelectorAll('.children-plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const roomIndex = parseInt(btn.dataset.room);
                    if (rooms[roomIndex].children < 4) {
                        rooms[roomIndex].children++;
                        updateRoomDisplay(roomIndex);
                        updateGuestDisplay();
                    }
                });
            });
            
            document.querySelectorAll('.children-minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const roomIndex = parseInt(btn.dataset.room);
                    if (rooms[roomIndex].children > 0) {
                        rooms[roomIndex].children--;
                        updateRoomDisplay(roomIndex);
                        updateGuestDisplay();
                    }
                });
            });
            
            // Delete room buttons
            document.querySelectorAll('.delete-room-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const roomSection = btn.closest('.room-section');
                    const roomIndex = parseInt(roomSection.dataset.roomIndex);
                    rooms.splice(roomIndex, 1);
                    renderAllRooms();
                    updateGuestDisplay();
                });
            });
        }
        
        // Update display for a specific room
        function updateRoomDisplay(roomIndex) {
            const roomSection = document.querySelector(`[data-room-index="${roomIndex}"]`);
            const room = rooms[roomIndex];
            
            // Update counts
            roomSection.querySelector('.adults-count').textContent = room.adults;
            roomSection.querySelector('.children-count').textContent = room.children;
            
            // Update children ages
            updateChildrenAgesForRoom(roomSection, roomIndex);
        }

        // Update main input display
        function updateGuestDisplay() {
            const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
            const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
            const totalRooms = rooms.length;
            
            let displayText = `${totalAdults} adulto${totalAdults > 1 ? 's' : ''}`;
            if (totalChildren > 0) {
                displayText += `, ${totalChildren} niño${totalChildren > 1 ? 's' : ''}`;
            }
            displayText += `, ${totalRooms} habitación${totalRooms > 1 ? 'es' : ''}`;
            
            guestInput.value = displayText;
            
            // Store room distribution in dataset
            guestInput.dataset.totalAdults = totalAdults;
            guestInput.dataset.totalChildren = totalChildren;
            guestInput.dataset.totalRooms = totalRooms;
            guestInput.dataset.roomsDistribution = JSON.stringify(rooms);
        }
        
        // Add room functionality
        addRoomBtn.addEventListener('click', () => {
            if (rooms.length < 8) {
                rooms.push({ adults: 2, children: 0, childrenAges: [] });
                renderAllRooms();
                updateGuestDisplay();
            }
        });
        
        // Show modal when input is clicked
        guestInput.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });
        
        // Make input readonly
        guestInput.setAttribute('readonly', 'true');
        
        // Close modal
        modalBack.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        applyBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Initialize
        renderAllRooms();
        updateGuestDisplay();
        
        console.log('✅ Hotel guest modal (per-room) initialized successfully');
    }

    // Hotel search with API integration
    function initHotelSearch() {
        const searchHotelsBtn = document.getElementById('search-hotels-btn');
        if (searchHotelsBtn) {
            searchHotelsBtn.addEventListener('click', async function() {
                // Get hotel search data
                const destination = document.getElementById('hotel-destination').value;
                const checkin = document.getElementById('hotel-checkin').value;
                const checkout = document.getElementById('hotel-checkout').value;
                const guests = document.getElementById('hotel-guests').value;

                // Validate required fields for hotels
                if (!destination || !checkin || !checkout) {
                    alert('Por favor completa todos los campos obligatorios (Destino, Check-in, Check-out)');
                    return;
                }

                // Validate dates
                const checkinDate = new Date(checkin);
                const checkoutDate = new Date(checkout);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (checkinDate < today) {
                    alert('La fecha de check-in debe ser igual o posterior a hoy');
                    return;
                }

                if (checkoutDate <= checkinDate) {
                    alert('La fecha de check-out debe ser posterior a la fecha de check-in');
                    return;
                }

                // Show loading
                this.disabled = true;
                this.innerHTML = 'Buscando...';

                try {
                    // Get the selected ID from destination input dataset
                    const destinationId = document.getElementById('hotel-destination').dataset.selectedId || 'BUE';
                    
                    // Format dates for URL
                    const checkinFormatted = checkin;
                    const checkoutFormatted = checkout;
                    
                    // Calculate number of nights
                    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
                    
                    // Format destination text for URL (remove accents)
                    let destinationText = removeAccents(destination.trim());
                    destinationText = encodeURIComponent(destinationText);
                    
                    // Get guest information from input datasets (per-room distribution)
                    const guestInput = document.getElementById('hotel-guests');
                    const totalAdults = parseInt(guestInput.dataset.totalAdults) || 2;
                    const totalChildren = parseInt(guestInput.dataset.totalChildren) || 0;
                    const totalRooms = parseInt(guestInput.dataset.totalRooms) || 1;
                    const roomsDistribution = JSON.parse(guestInput.dataset.roomsDistribution || '[{"adults":2,"children":0,"childrenAges":[]}]');
                    
                    // Create distribution format per room: room1_adults-age1-age2,room2_adults-age3,etc
                    const distributionParts = [];
                    roomsDistribution.forEach((room, index) => {
                        let roomPart = room.adults.toString();
                        if (room.children > 0) {
                            for (let i = 0; i < room.children; i++) {
                                const age = room.childrenAges[i] || 10;
                                roomPart += `-${age}`;
                            }
                        }
                        distributionParts.push(roomPart);
                    });
                    
                    // Join all rooms with commas
                    const distribution = distributionParts.join(',');
                    
                    console.log('🏨 Hotel distribution format:', distribution);
                    console.log('🏨 Rooms breakdown:', roomsDistribution);
                    
                    // Build hotel search URL with proper distribution format (no nights parameter, only distribution)
                    const hotelSearchURL = `https://a_rolar_viajes.mbc.aero.tur.ar/hotel/search/${destinationText}/${destinationId}/${checkinFormatted}/${checkoutFormatted}/${distribution}/undefined/undefined/undefined/price/asc/undefined/undefined/1/10/true`;
                    
                    // Print to console with styling
                    console.group('🏨 BÚSQUEDA DE HOTELES');
                    console.log('📍 Destino:', destination);
                    console.log('📅 Check-in:', checkin);
                    console.log('📅 Check-out:', checkout);
                    console.log('🌙 Noches:', nights);
                    console.log('👥 Total adultos:', totalAdults);
                    console.log('👶 Total niños:', totalChildren);
                    console.log('🏨 Habitaciones:', totalRooms);
                    console.log('📊 Distribución por habitación:');
                    roomsDistribution.forEach((room, index) => {
                        const ages = room.childrenAges.length > 0 ? ` (edades: ${room.childrenAges.join(', ')})` : '';
                        console.log(`   Habitación ${index + 1}: ${room.adults} adultos, ${room.children} niños${ages}`);
                    });
                    console.log('🔗 Formato URL:', distribution);
                    console.log('🔗 URL generada:', hotelSearchURL);
                    console.groupEnd();

                    // Show success message and navigate
                    showSearchSuccess('hoteles', `${destination}`);
                    
                    // Navigate to the search results
                    setTimeout(() => {
                        window.location.href = hotelSearchURL;
                    }, 1000); // Give time to see the success message
                    
                } catch (error) {
                    console.error('Error en búsqueda de hoteles:', error);
                    showErrorMessage('Error al buscar hoteles. Ver consola para más detalles.');
                }

                // Reset button
                this.disabled = false;
                this.innerHTML = 'Buscar Hoteles';
            });
        }
    }

    // Flight search with API integration
    const searchFlightsBtn = document.getElementById('search-flights-btn');
    if (searchFlightsBtn) {
        searchFlightsBtn.addEventListener('click', async function() {
        // Get flight search data
        const origin = document.getElementById('flight-origin').value;
        const destination = document.getElementById('flight-destination').value;
        const departure = document.getElementById('flight-departure').value;
        const returnDate = document.getElementById('flight-return').value;
        const passengers = document.getElementById('flight-passengers').value;

        // Validate required fields for flights
        if (!origin || !destination || !departure) {
            alert('Por favor completa todos los campos obligatorios (Origen, Destino, Fecha de salida)');
            return;
        }

        // Validate dates
        const departureDate = new Date(departure);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (departureDate < today) {
            alert('La fecha de salida debe ser igual o posterior a hoy');
            return;
        }

        // Check if return date is needed and valid
        const flightType = document.querySelector('input[name="flight-type"]:checked')?.value || 'roundtrip';
        if (flightType === 'roundtrip' && returnDate) {
            const returnDateObj = new Date(returnDate);
            if (returnDateObj <= departureDate) {
                alert('La fecha de regreso debe ser posterior a la fecha de salida');
                return;
            }
        }
        
        // Show loading
        this.disabled = true;
        this.innerHTML = 'Buscando...';

        try {
            // Build flight search URL following the specific format pattern
            // Get the selected IDs from input datasets
            const originId = document.getElementById('flight-origin').dataset.selectedId || '975';
            const destinationId = document.getElementById('flight-destination').dataset.selectedId || '4239';
            const passengerVariable = document.getElementById('flight-passengers').dataset.passengerVariable || '2';
            
            // Format dates for URL
            const departureFormatted = departure;
            const returnFormatted = flightType === 'roundtrip' ? returnDate : '';
            
            // Format origin and destination names for URL path
            // Format should be: "Country, Code - City" for origin and "Country, City" for destination
            let originText = origin.trim();
            let destinationText = destination.trim();
            
            // Parse origin text to get proper format
            const originParts = origin.trim().match(/^([^,]+),\s*(.+?)\s*\(([^)]+)\)$/);
            if (originParts) {
                // Convert "Argentina, Buenos Aires (BUE)" to "Argentina, BUE - Buenos Aires"
                originText = `${originParts[1]}, ${originParts[3]} - ${originParts[2]}`;
            }
            
            // Parse destination text to get proper format  
            const destinationParts = destination.trim().match(/^([^,]+),\s*(.+?)\s*\(([^)]+)\)$/);
            if (destinationParts) {
                // Convert "Argentina, San Carlos de Bariloche (BRC)" to "Argentina, San Carlos de Bariloche"
                destinationText = `${destinationParts[1]}, ${destinationParts[2]}`;
            }
            
            // URL encode the text
            originText = encodeURIComponent(originText);
            destinationText = encodeURIComponent(destinationText);
            
            console.log('🔍 Origin formatted for URL:', originText);
            console.log('🔍 Destination formatted for URL:', destinationText);
            
            // Build flight search URL with proper format
            let flightSearchURL;
            if (flightType === 'oneway') {
                // Solo ida format
                flightSearchURL = `https://a_rolar_viajes.mbc.aero.tur.ar/flight/search/${originText}/${destinationText}/${originId}/${destinationId}/${departureFormatted}/${departureFormatted}/${passengerVariable}/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/price/asc/undefined/true/1`;
            } else {
                // Ida y vuelta format
                flightSearchURL = `https://a_rolar_viajes.mbc.aero.tur.ar/flight/search/${originText}/${destinationText}/${originId}/${destinationId}/${departureFormatted}/${returnFormatted}/${passengerVariable}/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/price/asc/undefined/false/1`;
            }
            
            // Print to console with styling
            console.group('✈️ BÚSQUEDA DE VUELOS');
            console.log('📍 Origen:', origin);
            console.log('📍 Destino:', destination);
            console.log('📅 Salida:', departure);
            if (flightType === 'roundtrip') {
                console.log('📅 Regreso:', returnDate);
            }
            console.log('👥 Pasajeros:', passengers);
            console.log('🎫 Tipo:', flightType === 'roundtrip' ? 'Ida y vuelta' : 'Solo ida');
            console.log('🔗 URL generada:', flightSearchURL);
            console.groupEnd();

            // Show success message and navigate
            showSearchSuccess('vuelos', `${origin} → ${destination}`);
            
            // Navigate to the search results
            setTimeout(() => {
                window.location.href = flightSearchURL;
            }, 1000); // Give time to see the success message
            
        } catch (error) {
            console.error('Error en búsqueda de vuelos:', error);
            showErrorMessage('Error al buscar vuelos. Ver consola para más detalles.');
        }

        // Reset button
        this.disabled = false;
        this.innerHTML = 'Buscar';
        });
    }

    // Remove duplicate flight search handler (already handled above)

    // Success message function
    function showSearchSuccess(type, details) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        successMsg.innerHTML = `
            ✅ Búsqueda de ${type} realizada<br>
            <small>${details}</small><br>
            <small>Redirigiendo a resultados...</small>
        `;

        // Add animation CSS
        if (!document.getElementById('success-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'success-animation-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 5000);
    }

    // Error message function
    function showErrorMessage(message) {
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        errorMsg.innerHTML = `❌ ${message}`;
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 4000);
    }

    // Set default values for existing date inputs (avoid duplicate const declarations)
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Use existing date variables from top of file
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Set default values for hotel inputs if they exist
    const hotelCheckin = document.getElementById('hotel-checkin');
    const hotelCheckout = document.getElementById('hotel-checkout');
    
    if (hotelCheckin) hotelCheckin.value = formatDate(today);
    if (hotelCheckout) hotelCheckout.value = formatDate(tomorrow);

    // Handle flight type change
    function initFlightTypeSelector() {
        const returnInput = document.getElementById('flight-return');
        const returnLabel = returnInput?.parentNode?.querySelector('label');
        const returnContainer = returnInput?.parentNode;
        
        document.querySelectorAll('input[name="flight-type"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'oneway') {
                    // Solo ida - hide return date
                    if (returnContainer) {
                        returnContainer.style.display = 'none';
                    }
                    if (returnInput) {
                        returnInput.disabled = true;
                        returnInput.required = false;
                        returnInput.value = '';
                    }
                    
                    // Update dates container for single date
                    const datesContainer = document.querySelector('.dates-container');
                    if (datesContainer) {
                        datesContainer.classList.add('single-date');
                    }
                } else {
                    // Ida y vuelta - show return date
                    if (returnContainer) {
                        returnContainer.style.display = 'flex';
                    }
                    if (returnInput) {
                        returnInput.disabled = false;
                        returnInput.required = true;
                        // Set default return date (tomorrow if departure is today, or next day after departure)
                        const departureDate = document.getElementById('flight-departure').value;
                        if (departureDate) {
                            const depDate = new Date(departureDate);
                            const retDate = new Date(depDate);
                            retDate.setDate(depDate.getDate() + 1);
                            returnInput.value = retDate.toISOString().split('T')[0];
                        }
                    }
                    
                    // Update dates container for dual dates
                    const datesContainer = document.querySelector('.dates-container');
                    if (datesContainer) {
                        datesContainer.classList.remove('single-date');
                    }
                }
            });
        });
        
        // Initialize with current selection
        const selectedType = document.querySelector('input[name="flight-type"]:checked');
        if (selectedType) {
            selectedType.dispatchEvent(new Event('change'));
        }
    }

    // Swap locations functionality
    function initSwapButton() {
        const swapButton = document.getElementById('swap-locations');
        const originInput = document.getElementById('flight-origin');
        const destinationInput = document.getElementById('flight-destination');
        
        if (swapButton && originInput && destinationInput) {
            swapButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Swap values
                const originValue = originInput.value;
                const destinationValue = destinationInput.value;
                
                originInput.value = destinationValue;
                destinationInput.value = originValue;
                
                // Swap dataset values if they exist
                const originId = originInput.dataset.selectedId;
                const destinationId = destinationInput.dataset.selectedId;
                
                originInput.dataset.selectedId = destinationId || '';
                destinationInput.dataset.selectedId = originId || '';
                
                const originCode = originInput.dataset.selectedCode;
                const destinationCode = destinationInput.dataset.selectedCode;
                
                originInput.dataset.selectedCode = destinationCode || '';
                destinationInput.dataset.selectedCode = originCode || '';
                
                console.log('🔄 Locations swapped');
            });
        }
    }

    // Initialize autocomplete features
    console.log('🔧 Initializing autocomplete features...');
    
    // Check if all elements exist
    console.log('🔍 Checking elements:');
    console.log('  hotel-destination:', document.getElementById('hotel-destination'));
    console.log('  flight-origin:', document.getElementById('flight-origin'));
    console.log('  flight-destination:', document.getElementById('flight-destination'));
    console.log('  flight-passengers:', document.getElementById('flight-passengers'));
    
    // Initialize based on product type
    if (productSelected === 'hotels') {
        // Hotel-specific initialization is handled in configureSearchboxForProduct
    } else {
        // Flight-specific initialization (default)
        initHotelDestinationAutocomplete();
        initFlightAutocomplete();
        initPassengerSelector();
        initSwapButton();
    }
    
    // Initialize with default roundtrip selection
    const defaultTab = document.querySelector('.agency-menu-form-search-home-item-selected');
    if (defaultTab) {
        defaultTab.click();
    }

    // Configure searchbox based on URL parameter
    configureSearchboxForProduct(productSelected);
    
    console.log('🚀 SearchBox con API y Autocomplete inicializado correctamente');
    console.log('💡 Tip: Escribe al menos 2 caracteres para ver sugerencias');
    console.log('🔧 API Base URL:', API_CONFIG.baseURL);
    console.log('🎯 Configured for product:', productSelected || 'flights (default)');
    
    // Function to configure searchbox based on product type
    function configureSearchboxForProduct(product) {
        const headerTitle = document.querySelector('.header-title');
        const searchForm = document.getElementById('flights-form');
        
        if (product === 'hotels') {
            // Configure for hotels
            if (headerTitle) {
                headerTitle.textContent = 'Alojamientos';
            }
            
            // Hide flight-specific elements
            const flightTabs = document.querySelector('.search-tabs');
            const flightTypeSelector = document.querySelector('.flight-type-selector');
            const swapButton = document.querySelector('.swap-button');
            const originDestinationContainer = document.querySelector('.origin-destination-container');
            const passengersContainer = document.querySelector('.passengers-container');
            
            if (flightTabs) flightTabs.style.display = 'none';
            if (flightTypeSelector) flightTypeSelector.style.display = 'none';
            if (swapButton) swapButton.style.display = 'none';
            
            // Modify form for hotel search
            if (searchForm && originDestinationContainer) {
                // Change origin to destination only
                const originCol = originDestinationContainer.querySelector('.search-form-col:first-child');
                if (originCol) {
                    const label = originCol.querySelector('label');
                    const input = originCol.querySelector('input');
                    if (label) label.textContent = 'Destino';
                    if (input) {
                        input.id = 'hotel-destination';
                        input.placeholder = 'Buenos Aires, Ciudad de Buenos Aires, Argentina';
                        input.setAttribute('readonly', 'true'); // Make readonly for modal
                    }
                }
                
                // Hide the second column (destination for flights)
                const destCol = originDestinationContainer.querySelector('.search-form-col:nth-child(2)');
                if (destCol) destCol.style.display = 'none';
                
                // Center the destination field
                originDestinationContainer.style.justifyContent = 'center';
                const originColElement = originDestinationContainer.querySelector('.search-form-col:first-child');
                if (originColElement) {
                    originColElement.style.flex = '1';
                    originColElement.style.maxWidth = '100%';
                }
            }
            
            // Update dates labels
            const datesContainer = document.querySelector('.dates-container');
            if (datesContainer) {
                const departureLabel = datesContainer.querySelector('.search-form-col:first-child label');
                const returnLabel = datesContainer.querySelector('.search-form-col:last-child label');
                const departureInput = datesContainer.querySelector('.search-form-col:first-child input');
                const returnInput = datesContainer.querySelector('.search-form-col:last-child input');
                
                if (departureLabel) departureLabel.textContent = 'Check-in';
                if (returnLabel) returnLabel.textContent = 'Check-out';
                if (departureInput) departureInput.id = 'hotel-checkin';
                if (returnInput) {
                    returnInput.id = 'hotel-checkout';
                    returnInput.style.display = 'block';
                    returnInput.disabled = false;
                }
            }
            
            // Update passengers label
            if (passengersContainer) {
                const label = passengersContainer.querySelector('label');
                const input = passengersContainer.querySelector('input');
                if (label) label.textContent = 'Huéspedes';
                if (input) {
                    input.id = 'hotel-guests';
                    input.placeholder = '2 huéspedes, 1 habitación';
                }
            }
            
            // Update search button
            const searchBtn = document.getElementById('search-flights-btn');
            if (searchBtn) {
                searchBtn.id = 'search-hotels-btn';
                searchBtn.textContent = 'Buscar Hoteles';
            }
            
            // Initialize hotel search after DOM modification
            setTimeout(() => {
                initHotelSearch();
                initHotelDestinationModal();
                initHotelGuestModal();
            }, 100);
            
            console.log('🏨 Searchbox configured for hotels');
            
        } else {
            // Configure for flights (default)
            if (headerTitle) {
                headerTitle.textContent = 'Vuelos';
            }
            
            console.log('✈️ Searchbox configured for flights');
        }
    }
});