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

    // Initialize Google Maps functionality after DOM is loaded
    function initializeMap() {
        // Hiển thị loading state
        const mapContainer = document.getElementById('map-container');
        mapContainer.innerHTML = '<div class="map-loading"><div class="loading-spinner"></div><p>Đang tải bản đồ...</p></div>';
        
        // Tạo bản đồ với các tùy chọn tốt hơn
        const mapOptions = {
            center: { lat: 10.762622, lng: 106.660172 }, // Mặc định Ho Chi Minh City
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'cooperative', // Cải thiện cuộn trên di động
            styles: [
                {
                    "featureType": "administrative",
                    "elementType": "geometry",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "poi",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "transit",
                    "elementType": "labels.icon",
                    "stylers": [{"visibility": "off"}]
                }
            ] // Đơn giản hóa bản đồ
        };
        
        // Khởi tạo bản đồ
        const map = new google.maps.Map(document.getElementById('map'), mapOptions);
        
        // Thêm marker với animation
        const marker = new google.maps.Marker({
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });
        
        // Xử lý marker khi kéo
        marker.addListener('dragstart', function() {
            document.getElementById('map').classList.add('map-dragging');
        });
        
        marker.addListener('dragend', function() {
            document.getElementById('map').classList.remove('map-dragging');
            const position = marker.getPosition();
            map.setCenter(position);
            
            // Hiển thị indicator đang tìm địa chỉ
            document.getElementById('address').value = 'Đang tìm địa chỉ...';
            
            // Reverse geocode lấy địa chỉ chính xác
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'location': position }, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        // Địa chỉ chi tiết, chính xác
                        const address = results[0].formatted_address;
                        document.getElementById('address-search').value = address;
                        document.getElementById('address').value = address;
                        
                        // Lấy chi tiết hơn về địa chỉ từ components
                        let streetNumber = '';
                        let route = '';
                        let locality = '';
                        let administrative_area_level_1 = '';
                        let country = '';
                        let postal_code = '';
                        
                        for (const component of results[0].address_components) {
                            const types = component.types;
                            
                            if (types.includes('street_number')) {
                                streetNumber = component.long_name;
                            } else if (types.includes('route')) {
                                route = component.long_name;
                            } else if (types.includes('locality')) {
                                locality = component.long_name;
                            } else if (types.includes('administrative_area_level_1')) {
                                administrative_area_level_1 = component.long_name;
                            } else if (types.includes('country')) {
                                country = component.long_name;
                            } else if (types.includes('postal_code')) {
                                postal_code = component.long_name;
                            }
                        }
                        
                        // Lưu chi tiết địa chỉ vào hidden fields nếu cần
                        document.getElementById('latitude').value = position.lat();
                        document.getElementById('longitude').value = position.lng();
                        
                        // Animation hiển thị kết quả
                        document.getElementById('address').classList.add('highlight-animation');
                        setTimeout(() => {
                            document.getElementById('address').classList.remove('highlight-animation');
                        }, 1000);
                    }
                } else {
                    // Xử lý lỗi
                    document.getElementById('address').value = "Không thể xác định địa chỉ, vui lòng thử lại.";
                    console.error('Geocoder failed due to: ' + status);
                }
            });
        });
        
        // Cải thiện Places Autocomplete
        const searchInput = document.getElementById('address-search');
        
        // Thêm clear button
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'clear-search';
        clearButton.innerHTML = '&times;';
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.focus();
        });
        
        // Thêm button vào container
        searchInput.parentNode.style.position = 'relative';
        searchInput.parentNode.appendChild(clearButton);
        
        // Cải thiện Places Autocomplete
        const autocompleteOptions = {
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            strictBounds: false,
            types: ['address']
        };
        
        const autocomplete = new google.maps.places.Autocomplete(searchInput, autocompleteOptions);
        
        // Không tự động submit form khi nhấn Enter
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
        
        // Xử lý khi chọn địa chỉ từ dropdown
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            
            if (!place.geometry || !place.geometry.location) {
                // Người dùng nhập địa chỉ nhưng không chọn từ dropdown
                document.getElementById('address-search').placeholder = 'Vui lòng chọn địa chỉ từ danh sách';
                return;
            }
            
            // Cập nhật bản đồ
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
            
            // Cập nhật marker
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            
            // Animate marker để thu hút sự chú ý
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 1500);
            
            // Cập nhật form fields
            document.getElementById('address').value = place.formatted_address;
            document.getElementById('latitude').value = place.geometry.location.lat();
            document.getElementById('longitude').value = place.geometry.location.lng();
            
            // Animation hiển thị kết quả
            document.getElementById('address').classList.add('highlight-animation');
            setTimeout(() => {
                document.getElementById('address').classList.remove('highlight-animation');
            }, 1000);
        });
        
        // Tự động lấy vị trí của người dùng nếu có thể
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    map.setCenter(pos);
                    marker.setPosition(pos);
                    marker.setVisible(true);
                    
                    // Reverse geocode để lấy địa chỉ
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ 'location': pos }, function(results, status) {
                        if (status === 'OK') {
                            if (results[0]) {
                                document.getElementById('address-search').value = results[0].formatted_address;
                                document.getElementById('address').value = results[0].formatted_address;
                                document.getElementById('latitude').value = pos.lat;
                                document.getElementById('longitude').value = pos.lng;
                            }
                        }
                    });
                },
                function(error) {
                    // Xử lý lỗi geolocation
                    console.log('Error: Geolocation service failed.', error.message);
                    
                    // Nếu không lấy được vị trí, hiển thị thông báo
                    const mapNotice = document.createElement('div');
                    mapNotice.className = 'map-notice';
                    mapNotice.innerHTML = '<i class="fas fa-map-marker-alt"></i> Vui lòng nhập địa chỉ của bạn';
                    document.getElementById('map').appendChild(mapNotice);
                },
                { 
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }
        
        // Thêm nút định vị hiện tại
        const locationButton = document.createElement("button");
        locationButton.innerHTML = '<i class="fas fa-location-arrow"></i>';
        locationButton.className = "custom-map-control";
        locationButton.title = "Vị trí hiện tại của bạn";
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
        
        locationButton.addEventListener("click", () => {
            // Hiện loading state
            locationButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            locationButton.disabled = true;
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        
                        map.setCenter(pos);
                        marker.setPosition(pos);
                        marker.setVisible(true);
                        
                        // Lấy địa chỉ từ vị trí
                        const geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ location: pos }, (results, status) => {
                            // Khôi phục trạng thái nút
                            locationButton.innerHTML = '<i class="fas fa-location-arrow"></i>';
                            locationButton.disabled = false;
                            
                            if (status === "OK") {
                                if (results[0]) {
                                    document.getElementById('address-search').value = results[0].formatted_address;
                                    document.getElementById('address').value = results[0].formatted_address;
                                    document.getElementById('latitude').value = pos.lat;
                                    document.getElementById('longitude').value = pos.lng;
                                } else {
                                    console.log("No results found");
                                }
                            } else {
                                console.log("Geocoder failed due to: " + status);
                            }
                        });
                    },
                    () => {
                        // Khôi phục trạng thái nút
                        locationButton.innerHTML = '<i class="fas fa-location-arrow"></i>';
                        locationButton.disabled = false;
                        
                        alert("Không thể xác định vị trí của bạn.");
                    },
                    { 
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                // Khôi phục trạng thái nút
                locationButton.innerHTML = '<i class="fas fa-location-arrow"></i>';
                locationButton.disabled = false;
                
                alert("Trình duyệt của bạn không hỗ trợ Geolocation.");
            }
        });
    }

    // Call this after DOM is loaded
    if (typeof google !== 'undefined') {
        initializeMap();
    } else {
        console.error('Google Maps API not loaded');
    }

    // Update form submission to include country code
    laundryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add country code to phone number
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone').value;
        
        // Create merged phone with country code
        const fullPhone = countryCode + phoneNumber.replace(/^0+/, '');
        
        // Set it in a hidden field or modify the form data later
        const formData = new FormData(laundryForm);
        const bookingData = {};
        
        for (const [key, value] of formData.entries()) {
            bookingData[key] = value;
        }
        
        // Replace phone with full phone
        bookingData['phone'] = fullPhone;
        
        // Continue with form submission...
    });

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