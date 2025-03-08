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
    
    // Google Maps initialization
    let map, autocomplete, marker;

    function initMap() {
        // Create map centered on a default location
        const defaultLocation = { lat: 10.762622, lng: 106.660172 }; // Ho Chi Minh City, Vietnam
        
        map = new google.maps.Map(document.getElementById('map'), {
            center: defaultLocation,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });
        
        // Create a marker for the selected location
        marker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });
        
        // Add autocomplete to address field
        autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('address-autocomplete'),
            { types: ['address'] }
        );
        
        // When a place is selected, update the map and form fields
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                alert("No details available for this address");
                return;
            }
            
            // Center map on selected location
            map.setCenter(place.geometry.location);
            marker.setPosition(place.geometry.location);
            
            // Update form fields
            document.getElementById('address').value = place.formatted_address;
            document.getElementById('lat').value = place.geometry.location.lat();
            document.getElementById('lng').value = place.geometry.location.lng();
        });
        
        // Update address when marker is dragged
        marker.addListener('dragend', function() {
            const position = marker.getPosition();
            const geocoder = new google.maps.Geocoder();
            
            geocoder.geocode({ location: position }, function(results, status) {
                if (status === 'OK' && results[0]) {
                    document.getElementById('address-autocomplete').value = results[0].formatted_address;
                    document.getElementById('address').value = results[0].formatted_address;
                    document.getElementById('lat').value = position.lat();
                    document.getElementById('lng').value = position.lng();
                }
            });
        });
    }

    // Service radio buttons update price calculation
    document.querySelectorAll('input[name="service"]').forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });

    // Update original calculatePrice function to work with radio buttons
    function calculatePrice() {
        const serviceRadios = document.querySelectorAll('input[name="service"]');
        let selectedService;
        
        for (const radio of serviceRadios) {
            if (radio.checked) {
                selectedService = radio.value;
                break;
            }
        }
        
        const weight = parseInt(weightInput.value) || 0;
        
        if (selectedService && weight > 0) {
            const basePrice = serviceRates[selectedService] * weight;
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
        
        // Combine country code with phone number
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone').value;
        bookingData.fullPhone = countryCode + phoneNumber;
        
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
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data['country-code']} ${data.phone}</p>
            <p><strong>Address:</strong> ${data.address}</p>
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
}); 