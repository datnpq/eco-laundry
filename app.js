const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for booking
app.post('/api/bookings', (req, res) => {
    const bookingData = req.body;
    
    // In a real app, you'd store this in a database
    console.log('New booking received:', bookingData);
    
    // Generate a booking ID
    const bookingId = 'LAUNDRY-' + Date.now().toString().slice(-6);
    
    // Return success response
    res.json({
        success: true,
        message: 'Booking created successfully',
        bookingId: bookingId
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the app`);
}); 