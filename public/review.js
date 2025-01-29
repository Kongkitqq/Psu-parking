const reviewsContainer = document.getElementById('reviews-container');
const searchInput = document.getElementById('search-bar');

// Function to fetch parking spots from the API
async function fetchParkingSpots() {
    const response = await fetch('/api/parking-spots');
    const data = await response.json();
    return data.parkingLots;
}

// Function to display reviews
async function displayReviews() {
    const allParkingLots = await fetchParkingSpots();
    const searchTerm = searchInput.value.toLowerCase();

    // Clear previous reviews
    reviewsContainer.innerHTML = ''; 
    
    allParkingLots.forEach(lot => {
        if (lot.name.toLowerCase().includes(searchTerm)) { // Filter based on search term
            const reviewDiv = document.createElement('div');
            reviewDiv.classList.add('parking-spot');
            reviewDiv.innerHTML = `
                <h3>${lot.name}</h3>
                <img src="${lot.image}" alt="${lot.name}" width="200">
                <h3>รีวิว</h3>
                <p>${lot.reviews.length > 0 ? lot.reviews.join('<br>') : 'ยังไม่มีรีวิว'}</p>
                <form class="review-form">
                    <textarea class="review-text" placeholder="เขียนรีวิวของคุณที่นี่..." required></textarea>
                    <button type="submit">ส่งรีวิว</button>
                </form>
                <div class="submitted-reviews"></div>
            `;

            // Handle form submission for reviews
            const form = reviewDiv.querySelector('.review-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault(); // Prevent form from submitting the traditional way

                const reviewText = form.querySelector('.review-text').value;

                if (reviewText.trim()) {
                    // Send the new review to the server
                    const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            spot: lot.name,
                            review: reviewText
                        })
                    });

                    if (response.ok) {
                        // Reload reviews to show the updated list
                        displayReviews(); // Call displayReviews to refresh the reviews section
                    } else {
                        console.error('Failed to submit review');
                    }
                }
            });

            reviewsContainer.appendChild(reviewDiv);
        }
    });
}

// Event listener for the search input
searchInput.addEventListener('input', displayReviews);

// Initial load of reviews
displayReviews();
