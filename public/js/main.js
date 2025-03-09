document.addEventListener('DOMContentLoaded', function() {
    // Set animation index for staggered animations
    document.querySelectorAll('.benefit i').forEach((icon, index) => {
        icon.style.setProperty('--i', index);
    });

    document.querySelectorAll('.impact-stat').forEach((stat, index) => {
        stat.style.setProperty('--i', index);
    });
    
    // Get DOM elements
    const laundryForm = document.getElementById('laundry-form');
    const modal = document.getElementById('booking-confirmation');
    const closeBtn = document.querySelector('.close');
    const closeModalBtn = document.getElementById('close-modal');
    const bookingDetails = document.getElementById('booking-details');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // New elements for price calculation
    const serviceSelect = document.getElementById('service');
    const weightInput = document.getElementById('weight');
    const priceDisplay = document.createElement('div');
    priceDisplay.className = 'price-display';
    priceDisplay.innerHTML = '<span>Estimated Price: <strong>$0.00</strong></span>';
    
    // Insert price display after the weight input
    weightInput.parentNode.insertAdjacentElement('afterend', priceDisplay);
    
    // Service price rates per pound
    const serviceRates = {
        'wash-fold': 2.50,
        'dry-cleaning': 6.75,
        'ironing': 3.50,
        'bedding': 3.25
    };
    
    // Calculate price function
    function calculatePrice() {
        const service = serviceSelect.value;
        const weight = parseInt(weightInput.value) || 0;
        
        if (service && weight > 0) {
            const basePrice = serviceRates[service] * weight;
            const formattedPrice = basePrice.toFixed(2);
            
            // Animate price change
            priceDisplay.classList.add('pulse-animation');
            setTimeout(() => priceDisplay.classList.remove('pulse-animation'), 500);
            
            priceDisplay.innerHTML = `<span>Estimated Price: <strong>$${formattedPrice}</strong></span>`;
            
            // Apply discount for larger orders
            if (weight >= 10) {
                const discount = (basePrice * 0.1).toFixed(2);
                priceDisplay.innerHTML += `<span class="discount-info">10% discount applied: -$${discount}</span>`;
                const finalPrice = (basePrice * 0.9).toFixed(2);
                priceDisplay.innerHTML += `<span class="final-price">Final Price: <strong>$${finalPrice}</strong></span>`;
            }
        } else {
            priceDisplay.innerHTML = '<span>Estimated Price: <strong>$0.00</strong></span>';
        }
    }
    
    // Update price on service or weight change
    serviceSelect.addEventListener('change', calculatePrice);
    weightInput.addEventListener('input', calculatePrice);
    
    // Set minimum date to today for the date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pickup-date').min = today;
    
    // Form submission handler
    laundryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = laundryForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        submitBtn.disabled = true;
        
        // Update progress steps
        updateProgressStep(1);
        
        // Collect form data
        const formData = new FormData(laundryForm);
        const bookingData = {};
        
        for (const [key, value] of formData.entries()) {
            bookingData[key] = value;
        }
        
        // Send data to server (mock for now)
        saveBooking(bookingData)
            .then(response => {
                // Update progress step
                updateProgressStep(2);
                
                // Reset button
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    
                    displayBookingDetails(bookingData);
                    openModal();
                    laundryForm.reset();
                    calculatePrice();
                }, 1000);
            })
            .catch(error => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                alert('There was an error booking your laundry pickup. Please try again.');
                console.error('Booking error:', error);
            });
    });
    
    // Progress step update
    function updateProgressStep(step) {
        progressSteps.forEach((stepElement, index) => {
            if (index < step) {
                stepElement.classList.add('completed');
                stepElement.classList.remove('active');
            } else if (index === step) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active', 'completed');
            }
        });
    }
    
    // Mock API call function
    function saveBooking(data) {
        // In a real app, this would be a fetch request to your backend
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Booking data sent to server:', data);
                resolve({ success: true, id: 'LAUNDRY-' + Date.now() });
            }, 1000);
        });
    }
    
    // Display booking details in the modal
    function displayBookingDetails(data) {
        const serviceTypes = {
            'wash-fold': 'Wash & Fold',
            'dry-cleaning': 'Eco-Dry Cleaning',
            'ironing': 'Wash & Iron',
            'bedding': 'Bedding & Linens'
        };
        
        const pickupTimes = {
            '9-11': '9:00 AM - 11:00 AM',
            '11-1': '11:00 AM - 1:00 PM',
            '1-3': '1:00 PM - 3:00 PM',
            '3-5': '3:00 PM - 5:00 PM',
            '5-7': '5:00 PM - 7:00 PM'
        };
        
        // Calculate price for confirmation
        const weight = parseInt(data.weight);
        const service = data.service;
        let price = serviceRates[service] * weight;
        const discountApplied = weight >= 10;
        
        if (discountApplied) {
            price = price * 0.9; // 10% discount
        }
        
        bookingDetails.innerHTML = `
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Service:</strong> ${serviceTypes[service]}</p>
            <p><strong>Pickup Date:</strong> ${formatDate(data['pickup-date'])}</p>
            <p><strong>Pickup Time:</strong> ${pickupTimes[data['pickup-time']]}</p>
            <p><strong>Estimated Weight:</strong> ${weight} lbs</p>
            <p><strong>Price:</strong> $${price.toFixed(2)}${discountApplied ? ' (10% discount applied)' : ''}</p>
            <p><strong>Booking ID:</strong> LAUNDRY-${Date.now().toString().slice(-6)}</p>
        `;
    }
    
    // Format date to be more readable
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Modal controls with animation
    function openModal() {
        modal.style.display = 'flex';
        // Trigger reflow to ensure transition works
        modal.offsetWidth;
        modal.classList.add('show');
    }
    
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition to complete
    }
    
    closeBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Add animation when scrolling to elements
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.benefit, .impact-stat');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.visibility = 'visible';
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for scroll animation elements
    document.querySelectorAll('.benefit, .impact-stat').forEach(element => {
        element.style.visibility = 'hidden';
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Run animation on scroll
    window.addEventListener('scroll', animateOnScroll);
    // Run once on page load
    animateOnScroll();

    // Google Maps Platform Web Components Integration
    const SHORT_NAME_ADDRESS_COMPONENT_TYPES = new Set([
        'street_number', 
        'administrative_area_level_1', 
        'postal_code'
    ]);

    const ADDRESS_COMPONENT_TYPES_IN_FORM = [
        'location',
        'locality',
        'administrative_area_level_1',
        'postal_code',
        'country',
    ];

    function getFormInputElement(componentType) {
        return document.getElementById(`${componentType}-input`);
    }

    async function initMap() {
        // Wait for extended component library elements to be defined
        await customElements.whenDefined('gmpx-split-layout');
        await customElements.whenDefined('gmp-map');
        await customElements.whenDefined('gmp-advanced-marker');
        
        const mapEl = document.getElementById('map');
        const markerEl = document.getElementById('marker');
        
        // Set default location (San Francisco)
        const defaultLocation = { lat: 37.7749, lng: -122.4194 };
        mapEl.center = defaultLocation;
        markerEl.position = defaultLocation;
        
        // Initialize Places Autocomplete
        const { Autocomplete } = await google.maps.importLibrary("places");
        const locationInput = getFormInputElement('location');
        
        const autocomplete = new Autocomplete(locationInput, {
            fields: ['address_components', 'geometry', 'formatted_address'],
            types: ['address'],
        });
        
        // Focus on address input when page loads
        locationInput.focus();
        
        // When a place is selected
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry) {
                // User entered text but didn't select a suggestion
                locationInput.placeholder = "Please select an address from dropdown";
                return;
            }
            
            // Update map and marker
            renderAddress(place);
            
            // Fill in address fields
            fillInAddress(place);
            
            // Store coordinates
            if (place.geometry && place.geometry.location) {
                document.getElementById('latitude').value = place.geometry.location.lat();
                document.getElementById('longitude').value = place.geometry.location.lng();
            }
            
            // Store formatted address
            if (place.formatted_address) {
                document.getElementById('formatted_address').value = place.formatted_address;
            }
            
            // Highlight the fields
            highlightFields();
            
            // Focus on apartment field
            document.getElementById('address2').focus();
        });
        
        // Reset button handler
        document.querySelector('.reset-button').addEventListener('click', () => {
            // Clear all fields
            document.querySelectorAll('.panel input').forEach(input => {
                input.value = '';
            });
            
            // Clear hidden fields
            document.getElementById('formatted_address').value = '';
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
            
            // Reset map to default location
            mapEl.center = defaultLocation;
            markerEl.position = defaultLocation;
            
            // Focus on address input
            locationInput.focus();
        });
    }

    function renderAddress(place) {
        const mapEl = document.getElementById('map');
        const markerEl = document.getElementById('marker');
        
        if (place.geometry && place.geometry.location) {
            const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
            
            mapEl.center = location;
            markerEl.position = location;
            mapEl.zoom = 15; // Zoom in when a place is selected
        }
    }

    function fillInAddress(place) {
        function getComponentName(componentType) {
            for (const component of place.address_components || []) {
                if (component.types[0] === componentType) {
                    return SHORT_NAME_ADDRESS_COMPONENT_TYPES.has(componentType) ?
                        component.short_name :
                        component.long_name;
                }
            }
            return '';
        }
        
        function getComponentText(componentType) {
            if (componentType === 'location') {
                const streetNumber = getComponentName('street_number');
                const route = getComponentName('route');
                return streetNumber && route ? `${streetNumber} ${route}` : '';
            }
            return getComponentName(componentType);
        }
        
        // Fill in each field
        for (const componentType of ADDRESS_COMPONENT_TYPES_IN_FORM) {
            const value = getComponentText(componentType);
            const inputElement = getFormInputElement(componentType);
            
            if (inputElement && value) {
                inputElement.value = value;
            }
        }
    }

    function highlightFields() {
        const inputFields = document.querySelectorAll('.panel input[type="text"]');
        
        inputFields.forEach(field => {
            if (field.value) {
                field.classList.add('highlight-field');
                setTimeout(() => {
                    field.classList.remove('highlight-field');
                }, 1000);
            }
        });
    }

    // Make initMap available globally
    window.initMap = initMap;

    // Add radio button animation
    const radioOptions = document.querySelectorAll('.radio-option label');
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            this.classList.add('pulse-animation');
            setTimeout(() => {
                this.classList.remove('pulse-animation');
            }, 500);
        });
    });
}); 