document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const laundryForm = document.getElementById('laundry-form');
    const modal = document.getElementById('booking-confirmation');
    const closeBtn = document.querySelector('.close');
    const closeModalBtn = document.getElementById('close-modal');
    const bookingDetails = document.getElementById('booking-details');
    
    // Set minimum date to today for the date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pickup-date').min = today;
    
    // Form submission handler
    laundryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(laundryForm);
        const bookingData = {};
        
        for (const [key, value] of formData.entries()) {
            bookingData[key] = value;
        }
        
        // Send data to server (mock for now)
        saveBooking(bookingData)
            .then(response => {
                displayBookingDetails(bookingData);
                openModal();
                laundryForm.reset();
            })
            .catch(error => {
                alert('There was an error booking your laundry pickup. Please try again.');
                console.error('Booking error:', error);
            });
    });
    
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
        
        bookingDetails.innerHTML = `
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Service:</strong> ${serviceTypes[data.service]}</p>
            <p><strong>Pickup Date:</strong> ${formatDate(data['pickup-date'])}</p>
            <p><strong>Pickup Time:</strong> ${pickupTimes[data['pickup-time']]}</p>
            <p><strong>Estimated Weight:</strong> ${data.weight} lbs</p>
            <p><strong>Booking ID:</strong> LAUNDRY-${Date.now().toString().slice(-6)}</p>
        `;
    }
    
    // Format date to be more readable
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Modal controls
    function openModal() {
        modal.style.display = 'flex';
    }
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    closeBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}); 