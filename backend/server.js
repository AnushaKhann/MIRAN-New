const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// --- Firebase Initialization ---
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// --- Initial Setup ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- API Routes ---

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const sellersSnapshot = await db.collection('sellers').get();
        const allProducts = [];
        for (const sellerDoc of sellersSnapshot.docs) {
            const productsSnapshot = await sellerDoc.ref.collection('products').get();
            productsSnapshot.forEach(productDoc => {
                allProducts.push({ id: productDoc.id, ...productDoc.data() });
            });
        }
        res.status(200).json(allProducts);
    } catch (error) {
        res.status(500).send('Error getting products');
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const sellersSnapshot = await db.collection('sellers').get();
        let foundProduct = null;
        for (const sellerDoc of sellersSnapshot.docs) {
            const productRef = sellerDoc.ref.collection('products').doc(String(productId));
            const productDoc = await productRef.get();
            if (productDoc.exists) {
                foundProduct = { id: productDoc.id, ...productDoc.data() };
                break; 
            }
        }
        if (foundProduct) {
            res.status(200).json(foundProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).send('Error getting product');
    }
});

// Submit a new offer
app.post('/api/offers', async (req, res) => {
    try {
        const { productId, offerPrice, sellerId } = req.body;
        if (!productId || !offerPrice || !sellerId) {
            return res.status(400).json({ message: 'Product ID, offer price, and seller ID are required.' });
        }
        const newOffer = {
            productId: String(productId),
            offerPrice: Number(offerPrice),
            sellerId: sellerId,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('offers').add(newOffer);
        res.status(201).json({ message: 'Offer submitted successfully!', offerId: docRef.id });
    } catch (error) {
        res.status(500).send('Error submitting offer');
    }
});

app.get('/api/sellers/:sellerId/offers', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const offersRef = db.collection('offers');
        const snapshot = await offersRef.where('sellerId', '==', sellerId).orderBy('createdAt', 'desc').get();
        
        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const offers = [];
        for (const offerDoc of snapshot.docs) {
            const offerData = offerDoc.data();
            const productRef = db.collection('sellers').doc(sellerId).collection('products').doc(offerData.productId);
            const productDoc = await productRef.get();
            
            if(productDoc.exists) {
                offers.push({
                    offerId: offerDoc.id,
                    ...offerData,
                    product: productDoc.data()
                });
            }
        }
        res.status(200).json(offers);
    } catch (error) {
        res.status(500).send('Error fetching offers');
    }
});

// ** NEW: Update an offer's status **
app.patch('/api/offers/:offerId', async (req, res) => {
    try {
        const { offerId } = req.params;
        const { status, counterPrice } = req.body; // Expect 'status' and optional 'counterPrice'

        if (!status) {
            return res.status(400).json({ message: 'A new status is required.' });
        }

        const offerRef = db.collection('offers').doc(offerId);
        const updateData = { status: status };

        // If it's a counter-offer, add the counter price to the update
        if (status === 'countered' && counterPrice) {
            updateData.counterPrice = Number(counterPrice);
        }

        await offerRef.update(updateData);

        res.status(200).json({ message: `Offer ${offerId} has been updated to ${status}.` });

    } catch (error) {
        console.error("Error updating offer:", error);
        res.status(500).send('Error updating offer');
    }
});


// --- Page Serving Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'index.html')));
app.get('/product.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'product.html')));
app.get('/cart.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'cart.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'templates', 'admin.html')));


// --- Start The Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
