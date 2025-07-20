// This script runs only on the cart.html page

async function renderCartPage() {
    // These global functions (getCart, saveCart, updateCartIcon) must be available from main.js
    if (typeof getCart !== 'function') {
        console.error("Error: Core cart functions are not available. Make sure main.js is loaded correctly.");
        return;
    }

    const cart = getCart();
    const cartContent = document.getElementById('cart-content');

    if (!cartContent) {
        console.error("Cart content container not found!");
        return;
    }

    if (cart.length === 0) {
        cartContent.innerHTML = '<p class="empty-cart-message">Your cart is currently empty. <a href="index.html" class="btn">Continue shopping</a>.</p>';
        return;
    }

    try {
        const itemPromises = cart.map(item =>
            fetch(`/api/products/${item.id}`).then(res => res.json()).then(details => ({ ...details, ...item }))
        );
        const cartItemsWithDetails = await Promise.all(itemPromises);

        let itemsHTML = '';
        let totalMRP = 0;
        let totalDiscount = 0;

        cartItemsWithDetails.forEach(item => {
            const currentPrice = item.salePrice || item.price;
            const itemTotal = currentPrice * item.quantity;
            totalMRP += item.price * item.quantity;
            if(item.salePrice) {
                totalDiscount += (item.price - item.salePrice) * item.quantity;
            }

            // FIX: Create a more detailed price display for the cart item
            const priceDisplay = item.salePrice
                ? `<div class="cart-item-price">
                       <span class="original-price-cart">₹${item.price.toFixed(2)}</span>
                       <span class="sale-price-cart">₹${item.salePrice.toFixed(2)}</span>
                   </div>`
                : `<div class="cart-item-price"><span class="sale-price-cart">₹${item.price.toFixed(2)}</span></div>`;


            itemsHTML += `
                <div class="cart-item">
                    <a href="product.html?id=${item.id}">
                        <img src="${item.images[0]}" alt="${item.name}" class="cart-item-img">
                    </a>
                    <div class="cart-item-info">
                        <a href="product.html?id=${item.id}"><h4>${item.name}</h4></a>
                        <p class="cart-item-size">Size: ${item.size}</p>
                        ${priceDisplay}
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button onclick="changeQuantity(${item.id}, '${item.size}', -1)">-</button>
                                <input type="number" value="${item.quantity}" readonly>
                                <button onclick="changeQuantity(${item.id}, '${item.size}', 1)">+</button>
                            </div>
                            <p><strong>₹${itemTotal.toFixed(2)}</strong></p>
                            <button class="remove-item-btn" onclick="removeItem(${item.id}, '${item.size}')"><i class='bx bx-trash'></i></button>
                        </div>
                    </div>
                </div>
            `;
        });

        const finalAmount = totalMRP - totalDiscount;

        const summaryHTML = `
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="summary-line">
                    <span>Total MRP</span>
                    <span>₹${totalMRP.toFixed(2)}</span>
                </div>
                <div class="summary-line discount">
                    <span>Discount on MRP</span>
                    <span>- ₹${totalDiscount.toFixed(2)}</span>
                </div>
                <div class="summary-line summary-total">
                    <span>Total Amount</span>
                    <span>₹${finalAmount.toFixed(2)}</span>
                </div>
                <button class="btn" style="width: 100%; margin-top: 1rem;">Proceed to Checkout</button>
            </div>
        `;

        cartContent.innerHTML = `<div class="cart-items-list">${itemsHTML}</div>${summaryHTML}`;
    } catch (error) {
        console.error("Error rendering cart page:", error);
        cartContent.innerHTML = '<p class="error-text">Could not load your cart. Please try again.</p>';
    }
}

function changeQuantity(productId, size, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId && i.size === size);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItem(productId, size);
        } else {
            saveCart(cart);
            renderCartPage();
            updateCartIcon();
        }
    }
}

function removeItem(productId, size) {
    let cart = getCart();
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart(cart);
    renderCartPage();
    updateCartIcon();
}

document.addEventListener('DOMContentLoaded', renderCartPage);
