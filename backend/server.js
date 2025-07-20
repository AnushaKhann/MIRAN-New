// --- Import Required Packages ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// --- Firebase Initialization ---
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// --- Initial Setup ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// --- API Routes (Now using Firestore) ---

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const productsCollection = db.collection('products');
        const snapshot = await productsCollection.get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No products found' });
        }
        let products = [];
        snapshot.forEach(doc => {
            // Firestore's doc.id is a string, so we ensure our data matches that
            products.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send('Error getting products');
    }
});

// Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const docRef = db.collection('products').doc(String(productId));
        const doc = await docRef.get();

        if (!doc.exists) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json({ id: doc.id, ...doc.data() });
        }
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).send('Error getting product');
    }
});

// Submit a new offer
app.post('/api/offers', async (req, res) => {
    try {
        const { productId, offerPrice } = req.body;

        // Basic validation
        if (!productId || !offerPrice) {
            return res.status(400).json({ message: 'Product ID and offer price are required.' });
        }

        const newOffer = {
            productId: productId,
            offerPrice: Number(offerPrice),
            status: 'pending', // Initial status of every new offer
            createdAt: admin.firestore.FieldValue.serverTimestamp() // The current time
        };

        // Add the new offer to the 'offers' collection
        const docRef = await db.collection('offers').add(newOffer);

        console.log('New offer saved with ID:', docRef.id);
        res.status(201).json({ message: 'Offer submitted successfully!', offerId: docRef.id });

    } catch (error) {
        console.error("Error submitting offer:", error);
        res.status(500).send('Error submitting offer');
    }
});


// --- Page Serving Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'index.html'));
});

// ADDED: This explicitly handles requests for the index.html file
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'index.html'));
});

// This handles requests for the product.html file
app.get('/product.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'product.html'));
});

// This handles requests for the cart.html file
app.get('/cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'cart.html'));
});


// --- Start The Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
