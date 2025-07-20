// --- GLOBAL CART LOGIC ---

function getCart() {
    return JSON.parse(localStorage.getItem('miranCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('miranCart', JSON.stringify(cart));
}

function updateCartIcon() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cart-item-count');
    if (cartBadge) {
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        cartBadge.textContent = totalItems;
    }
}

function addProductToCart(productId, size) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId && item.size === size);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: productId, size: size, quantity: 1 });
    }

    saveCart(cart);
    updateCartIcon();
    alert(`Product added to your cart (Size: ${size})!`);
}

// --- GLOBAL PRODUCT CARD RENDERER ---
function createProductHTML(product) {
    const displayPrice = product.salePrice 
        ? `<span class="original-price">₹${product.price.toFixed(2)}</span> - <span class="discount-badge">${product.discount} OFF</span> ₹${product.salePrice.toFixed(2)}` 
        : `₹${product.price.toFixed(2)}`;

    return `
        <div class="product-item">
            <div class="product-header">
                <a href="product.html?id=${product.id}">
                   <img src="${product.images[0]}" alt="${product.name}">
                </a>
            </div>
            <div class="product-footer">
                <h4>${product.name}</h4>
                <div class="price">${displayPrice}</div>
                <div class="product-actions">
                    <a href="product.html?id=${product.id}" class="btn">View Details</a>
                </div>
            </div>
        </div>
    `;
};


// --- GENERAL PAGE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const saleProductCenter = document.getElementById('sale-product-center');
    const nav = document.querySelector('.nav');
    const footer = document.querySelector('.footer');
    const hamburger = document.querySelector('.hamburger');
    const closeMenuBtn = document.querySelector('.menu .close');
    const menu = document.querySelector('.menu');
    
    updateCartIcon();

    if (hamburger && menu && closeMenuBtn) {
        hamburger.addEventListener('click', () => menu.classList.add('show'));
        closeMenuBtn.addEventListener('click', () => menu.classList.remove('show'));
    }

    // --- Homepage Product Rendering ---
    if (saleProductCenter) {
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                window.products = products; // Store products globally for other scripts
                const womenProductCenter = document.getElementById('women-product-center');
                const menProductCenter = document.getElementById('men-product-center');
                const kidsProductCenter = document.getElementById('kids-product-center');

                products.forEach(product => {
                    const productHTML = createProductHTML(product);
                    if (product.category === 'women' && womenProductCenter) womenProductCenter.innerHTML += productHTML;
                    if (product.category === 'men' && menProductCenter) menProductCenter.innerHTML += productHTML;
                    if (product.category === 'kids' && kidsProductCenter) kidsProductCenter.innerHTML += productHTML;
                    if (product.salePrice && saleProductCenter) saleProductCenter.innerHTML += productHTML;
                });
            });
    }

    window.addEventListener('scroll', () => {
        if (!footer || !nav) return;
        const footerTop = footer.offsetTop;
        const scrollPosition = window.scrollY + window.innerHeight;
        const navHeight = nav.offsetHeight;
        nav.classList.toggle('hide', scrollPosition > footerTop + navHeight);
    });

    // --- MODAL LOGIC ---
    const offerModal = document.getElementById('offer-modal');
    
    window.openOfferModal = (productId) => {
        fetch(`/api/products/${productId}`)
            .then(res => res.json())
            .then(product => {
                if (product && offerModal) {
                    const modalProductName = document.getElementById('modal-product-name');
                    const modalCurrentPrice = document.getElementById('modal-current-price');
                    const submitOfferBtn = document.getElementById('submit-offer-btn');

                    if (modalProductName) modalProductName.textContent = product.name;
                    if (modalCurrentPrice) modalCurrentPrice.textContent = `₹${(product.salePrice || product.price).toFixed(2)}`;
                    if (submitOfferBtn) {
                        submitOfferBtn.dataset.productId = product.id;
                        // FIX: Store the sellerId on the button as well
                        submitOfferBtn.dataset.sellerId = product.sellerId; 
                    }
                    
                    offerModal.classList.add('show');
                }
            });
    };

    const closeOfferModal = () => {
        if (offerModal) {
            offerModal.classList.remove('show');
            const offerPriceInput = document.getElementById('offer-price');
            if (offerPriceInput) offerPriceInput.value = '';
        }
    };

    const closeModalBtn = document.querySelector('.close-modal-btn');
    const submitOfferBtn = document.getElementById('submit-offer-btn');

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeOfferModal);
    if (offerModal) offerModal.addEventListener('click', (e) => {
        if (e.target === offerModal) closeOfferModal();
    });

    if (submitOfferBtn) {
        submitOfferBtn.addEventListener('click', () => {
            const productId = submitOfferBtn.dataset.productId;
            // FIX: Get the sellerId from the button's dataset
            const sellerId = submitOfferBtn.dataset.sellerId; 
            const offerPriceInput = document.getElementById('offer-price');
            const offerPrice = parseFloat(offerPriceInput.value);

            if (!offerPrice || offerPrice <= 0) {
                alert('Please enter a valid offer price.');
                return;
            }

            // FIX: Include the sellerId in the data sent to the server
            const offerData = { productId, offerPrice, sellerId };

            fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData),
            })
            .then(response => {
                if (!response.ok) {
                    // If the server sends an error, show it
                    throw new Error('Server responded with an error.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Your offer has been submitted successfully!');
                closeOfferModal();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('There was an error submitting your offer. Please try again.');
                closeOfferModal();
            });
        });
    }
});
