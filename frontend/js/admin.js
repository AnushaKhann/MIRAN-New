document.addEventListener('DOMContentLoaded', () => {
    const sellerSelect = document.getElementById('seller-select');
    const offersContainer = document.getElementById('offers-list-container');

    // Function to fetch and display offers for the selected seller
    async function loadOffers(sellerId) {
        if (!sellerId) return;
        offersContainer.innerHTML = '<p class="loading-text">Loading offers...</p>';

        try {
            const response = await fetch(`/api/sellers/${sellerId}/offers`);
            if (!response.ok) throw new Error('Failed to fetch offers.');
            const offers = await response.json();

            if (offers.length === 0) {
                offersContainer.innerHTML = '<p class="empty-cart-message">No incoming offers for this seller.</p>';
                return;
            }

            let offersHTML = '';
            offers.forEach(offer => {
                const product = offer.product;
                const offerPrice = offer.offerPrice;
                const originalPrice = product.salePrice || product.price;

                // Add a class based on the offer status for styling
                const statusClass = `status-${offer.status}`;

                offersHTML += `
                    <div class="offer-item ${statusClass}">
                        <img src="${product.images[0]}" alt="${product.name}" class="offer-item-img">
                        <div class="offer-details">
                            <h4>${product.name}</h4>
                            <p>Status: <strong class="offer-status">${offer.status}</strong></p>
                        </div>
                        <div class="offer-pricing">
                            <p>Original Price: ₹${originalPrice.toFixed(2)}</p>
                            <p>Customer Offer: <strong>₹${offerPrice.toFixed(2)}</strong></p>
                            ${offer.status === 'countered' ? `<p>Our Counter: <strong>₹${offer.counterPrice.toFixed(2)}</strong></p>` : ''}
                        </div>
                        <div class="offer-actions">
                            <button class="btn btn-accept" onclick="handleOffer('${offer.offerId}', 'accepted')" ${offer.status !== 'pending' ? 'disabled' : ''}>Accept</button>
                            <button class="btn btn-reject" onclick="handleOffer('${offer.offerId}', 'rejected')" ${offer.status !== 'pending' ? 'disabled' : ''}>Reject</button>
                            <button class="btn btn-offer" onclick="counterOffer('${offer.offerId}')" ${offer.status !== 'pending' ? 'disabled' : ''}>Counter</button>
                        </div>
                    </div>
                `;
            });
            offersContainer.innerHTML = offersHTML;

        } catch (error) {
            console.error("Error loading offers:", error);
            offersContainer.innerHTML = '<p class="error-text">Could not load offers.</p>';
        }
    }

    // Event listener for the seller dropdown
    sellerSelect.addEventListener('change', (e) => {
        loadOffers(e.target.value);
    });

    // Make loadOffers globally accessible so we can refresh the list
    window.loadCurrentSellerOffers = () => {
        loadOffers(sellerSelect.value);
    };

    // Initial load for the default selected seller
    loadCurrentSellerOffers();
});

// --- Offer Action Functions ---

async function handleOffer(offerId, status, counterPrice = null) {
    const body = { status };
    if (counterPrice) {
        body.counterPrice = counterPrice;
    }

    try {
        const response = await fetch(`/api/offers/${offerId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Server responded with an error.');
        }

        const data = await response.json();
        console.log(data.message);
        
        // Refresh the list to show the updated status
        window.loadCurrentSellerOffers();

    } catch (error) {
        console.error(`Error updating offer to ${status}:`, error);
        alert(`Failed to update offer. Please try again.`);
    }
}

function counterOffer(offerId) {
    const newPrice = prompt("Enter your counter-offer price (e.g., 850):");
    if (newPrice && !isNaN(newPrice) && Number(newPrice) > 0) {
        handleOffer(offerId, 'countered', newPrice);
    } else if (newPrice) {
        alert("Please enter a valid number for the counter-offer.");
    }
}
