const express = require('express'); 
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware to serve static files
app.use(express.static('public')); // Assuming your HTML and JS files are in a folder named 'public'

// Middleware to parse JSON bodies
app.use(express.json()); // For parsing application/json

// Combined Endpoint to get parking spots (with optional faculty and query filtering)
app.get('/api/parking-spots', (req, res) => {
    const { faculty, query } = req.query;

    fs.readFile(path.join(__dirname, 'parking_spots.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }

        let parkingLots = JSON.parse(data).parkingLots;

        // Filter by faculty
        if (faculty && faculty !== 'all') {
            parkingLots = parkingLots.filter(lot => lot.faculty.toLowerCase() === faculty.toLowerCase());
        }

        // Filter by query (for parking spot names)
        if (query) {
            parkingLots = parkingLots.filter(lot => lot.name.toLowerCase().includes(query.toLowerCase()));
        }

        res.json({ parkingLots });
    });
});

// Endpoint to handle posting reviews
app.post('/api/reviews', (req, res) => {
    const { spot, review } = req.body;

    // Check if spot and review are provided
    if (!spot || !review) {
        return res.status(400).json({ message: 'Spot and review are required' });
    }

    // Read existing parking lots data
    fs.readFile(path.join(__dirname, 'parking_spots.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading parking data');
        }

        const parkingData = JSON.parse(data);
        const parkingLot = parkingData.parkingLots.find(lot => lot.name === spot);

        if (parkingLot) {
            // Initialize reviews array if it doesn't exist
            if (!parkingLot.reviews) {
                parkingLot.reviews = []; 
            }
            // Add new review to the parking lot
            parkingLot.reviews.push(review);

            // Write updated data back to the file
            fs.writeFile(path.join(__dirname, 'parking_spots.json'), JSON.stringify(parkingData, null, 2), (err) => {
                if (err) {
                    return res.status(500).send('Error saving review');
                }
                // Return the updated review along with a success message
                res.status(201).json({ 
                    message: 'Review added successfully', 
                    spot: parkingLot.name, 
                    reviews: parkingLot.reviews 
                });
            });
        } else {
            res.status(404).send('Parking spot not found');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
