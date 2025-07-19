// This script runs only on the cart.html page

/**
 * Renders all items in the cart to the page.
 */
async function renderCartPage() {
    // These global functions (getCart, saveCart, updateCartIcon) must be available from main.js
    if (typeof getCart !== 'function') {
        console.error("Error: Core cart functions are not available. Make sure main.js is loaded correctly.");
        return;
    }

    const cart = getCart();
    const cartContent = document.getElementById('cart-content');

    if (!cartContent) {
        console.error("Cart content container not found on this page!");
        return;
    }

    if (cart.length === 0) {
        cartContent.innerHTML = '<p class="empty-cart-message">Your cart is currently empty. <a href="index.html" class="btn">Continue shopping</a>.</p>';
        return;
    }

    try {
        // Create an array of promises to fetch full details for all items in the cart
        const itemDetailPromises = cart.map(item =>
            fetch(`/api/products/${item.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Product with ID ${item.id} not found.`);
                    }
                    return response.json();
                })
                .then(productDetails => {
                    // Combine server data with local cart quantity
                    return { ...productDetails, quantity: item.quantity };
                })
        );

        const cartItemsWithDetails = await Promise.all(itemDetailPromises);

        let itemsHTML = '';
        let subtotal = 0;

        cartItemsWithDetails.forEach(item => {
            const itemTotal = (item.salePrice || item.price) * item.quantity;
            subtotal += itemTotal;

            itemsHTML += `
                <div class="cart-item">
                    <img src="${item.images[0]}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="price">₹${(item.salePrice || item.price).toFixed(2)}</p>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                                <input type="number" value="${item.quantity}" readonly>
                                <button onclick="changeQuantity(${item.id}, 1)">+</button>
                            </div>
                            <p><strong>₹${itemTotal.toFixed(2)}</strong></p>
                            <button class="remove-item-btn" onclick="removeItem(${item.id})"><i class='bx bx-trash'></i></button>
                        </div>
                    </div>
                </div>
            `;
        });

        const summaryHTML = `
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="summary-line">
                    <span>Subtotal</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-line">
                    <span>Shipping</span>
                    <span>FREE</span>
                </div>
                <div class="summary-line summary-total">
                    <span>Total</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <button class="btn" style="width: 100%; margin-top: 1rem;">Proceed to Checkout</button>
            </div>
        `;

        cartContent.innerHTML = `
            <div class="cart-items-list">
                ${itemsHTML}
            </div>
            ${summaryHTML}
        `;
    } catch (error) {
        console.error("Error rendering cart page:", error);
        cartContent.innerHTML = '<p class="error-text">Could not load your cart. One or more items may no longer be available. Please try again.</p>';
    }
}

/**
 * Changes the quantity of an item in the cart.
 * @param {number} productId - The ID of the product to change.
 * @param {number} change - The amount to change by (+1 or -1).
 */
function changeQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            // If quantity drops to 0 or below, remove the item
            removeItem(productId);
        } else {
            saveCart(cart);
            renderCartPage(); // Re-render the page with new totals
            updateCartIcon(); // Update the header icon
        }
    }
}

/**
 * Removes an item completely from the cart.
 * @param {number} productId - The ID of the product to remove.
 */
function removeItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartPage();
    updateCartIcon();
}

// --- Initial Render ---
// When the cart.html page's content is loaded, this function will run.
document.addEventListener('DOMContentLoaded', renderCartPage);
