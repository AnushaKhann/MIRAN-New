// This is a one-time use script to set up your database with a two-seller structure.
// This was done while adding the admin part so that we can test on 2 different sellers.

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// The full, standardized product list
const allProducts = [
    { id: 1, name: 'FRUIT PRINT MIDI DRESS', price: 4950.00, salePrice: null, discount: null, category: 'women', description: 'A beautiful midi dress with a vibrant fruit print.', images: ['/images/women/outfit1/wm1.jpg', '/images/women/outfit1/wm2.jpg', '/images/women/outfit1/wm3.jpg'] },
    { id: 2, name: 'SHORT STRETCH DRESS', price: 2550.00, salePrice: null, discount: null, category: 'women', description: 'A comfortable and flattering short stretch dress.', images: ['/images/women/outfit3/wm1.jpg', '/images/women/outfit3/wm2.jpg', '/images/women/outfit3/wm3.jpg'] },
    { id: 3, name: 'CONTRAST EMBELLISHED TRIM T-SHIRT', price: 1950.00, salePrice: null, discount: null, category: 'women', description: 'A unique t-shirt with contrast embellished trim.', images: ['/images/women/outfit2/wm1.jpg', '/images/women/outfit2/wm2.jpg', '/images/women/outfit2/wm3.jpg', '/images/women/outfit2/wm4.jpg'] },
    { id: 4, name: 'WIDE-LEG HIGH-WAIST JEANS', price: 4350.00, salePrice: null, discount: null, category: 'women', description: 'Stylish wide-leg, high-waist jeans.', images: ['/images/women/outfit4/wm1.jpg', '/images/women/outfit4/wm2.jpg', '/images/women/outfit4/wm3.jpg'] },
    { id: 5, name: 'KNIT TOP WITH SIDE BUTTONS', price: 2590.00, salePrice: null, discount: null, category: 'women', description: 'A cozy and stylish knit top.', images: ['/images/women/outfit5/wm1.jpg', '/images/women/outfit5/wm2.jpg', '/images/women/outfit5/wm3.jpg'] },
    { id: 6, name: 'PRINTED CAPE SKIRT', price: 4350.00, salePrice: null, discount: null, category: 'women', description: 'An elegant and flowing printed cape skirt.', images: ['/images/women/outfit6/wm1.jpg', '/images/women/outfit6/wm2.jpg', '/images/women/outfit6/wm3.jpg'] },
    { id: 7, name: 'RIBBED MIDI DRESS WITH BUTTONS', price: 2950.00, salePrice: null, discount: null, category: 'women', description: 'A form-fitting ribbed midi dress.', images: ['/images/women/outfit7/wm1.jpg', '/images/women/outfit7/wm2.jpg', '/images/women/outfit7/wm3.jpg'] },
    { id: 8, name: 'CROCHET SHIRT', price: 2950.00, salePrice: null, discount: null, category: 'men', description: 'An intricately designed crochet shirt.', images: ['/images/mens/outfit1/men1.jpg', '/images/mens/outfit1/men2.jpg', '/images/mens/outfit1/men3.jpg'] },
    { id: 9, name: 'FLOWING SHIRT', price: 4350.00, salePrice: null, discount: null, category: 'men', description: 'A relaxed and flowing shirt.', images: ['/images/mens/outfit2/man1.jpg', '/images/mens/outfit2/man2.jpg', '/images/mens/outfit2/man3.jpg', '/images/mens/outfit2/man4.jpg'] },
    { id: 10, name: 'STRAIGHT FIT JEANS', price: 3590.00, salePrice: null, discount: null, category: 'men', description: 'Classic straight-fit jeans.', images: ['/images/mens/outfit3/man1.jpg', '/images/mens/outfit3/man2.jpg', '/images/mens/outfit3/man3.jpg'] },
    { id: 11, name: 'SLIM FIT TROUSERS', price: 5950.00, salePrice: null, discount: null, category: 'men', description: 'Tailored slim-fit trousers.', images: ['/images/mens/outfit4/man1.jpg', '/images/mens/outfit4/man2.jpg', '/images/mens/outfit4/man3.jpg'] },
    { id: 12, name: 'STRIPED JACQUARD SHIRT', price: 7550.00, salePrice: null, discount: null, category: 'men', description: 'A premium striped jacquard shirt.', images: ['/images/mens/outfit5/man1.jpg', '/images/mens/outfit5/man2.png', '/images/mens/outfit5/man3.jpg', '/images/mens/outfit5/man4.jpg'] },
    { id: 13, name: 'JACKET WITH BUTTONS', price: 9550.00, salePrice: null, discount: null, category: 'men', description: 'A stylish and versatile jacket.', images: ['/images/mens/outfit6/man1.jpg', '/images/mens/outfit6/man2.jpg', '/images/mens/outfit6/man3.jpg'] },
    { id: 14, name: 'TEXTURED JOGGER WAIST TROUSERS', price: 4290.00, salePrice: null, discount: null, category: 'men', description: 'Comfortable jogger-style trousers.', images: ['/images/mens/outfit7/man1.jpg', '/images/mens/outfit7/man2.jpg', '/images/mens/outfit7/man3.jpg'] },
    { id: 15, name: 'CONTRAST CROCHET EMBROIDERED TOP', price: 1450.00, salePrice: null, discount: null, category: 'kids', description: 'A charming top for kids.', images: ['/images/kids/outfit1/kid1.jpg', '/images/kids/outfit1/kid2.jpg', '/images/kids/outfit1/kid3.jpg'] },
    { id: 16, name: 'OVERSHIRT WITH POCKETS', price: 2150.00, salePrice: null, discount: null, category: 'kids', description: 'A practical and stylish overshirt.', images: ['/images/kids/outfit2/kid1.jpg', '/images/kids/outfit2/kid2.jpg', '/images/kids/outfit2/kid3.jpg'] },
    { id: 17, name: 'LOOSE-FITTING JEANS WITH DARTS', price: 2550.00, salePrice: null, discount: null, category: 'kids', description: 'Comfortable and trendy loose-fitting jeans.', images: ['/images/kids/outfit3/kid1.jpg', '/images/kids/outfit3/kid2.jpg'] },
    { id: 18, name: 'TROUSERS WITH SIDE STRIPES', price: 1750.00, salePrice: null, discount: null, category: 'kids', description: 'Sporty and comfortable trousers for kids.', images: ['/images/kids/outfit4/kid1.jpg', '/images/kids/outfit4/kid2.jpg'] },
    { id: 19, name: 'EMBROIDERED WAISTCOAT WITH SKIRT', price: 5500.00, salePrice: null, discount: null, category: 'kids', description: 'An adorable embroidered waistcoat and skirt set.', images: ['/images/kids/outfit5/kid1.jpg', '/images/kids/outfit5/kid2.jpg', '/images/kids/outfit5/kid3.jpg', '/images/kids/outfit5/kid4.jpg', '/images/kids/outfit5/kid5.jpg', '/images/kids/outfit5/kid6.jpg'] },
    { id: 20, name: 'WAFFLE-KNIT SHORT DUNGAREES', price: 1950.00, salePrice: null, discount: null, category: 'kids', description: 'Cute and comfortable waffle-knit dungarees.', images: ['/images/kids/outfit6/kid1.jpg', '/images/kids/outfit6/kid2.jpg', '/images/kids/outfit6/kid3.jpg'] },
    { id: 21, name: 'BEADED PRINTED TOP', price: 2550.00, salePrice: null, discount: null, category: 'kids', description: 'A fun and vibrant printed top.', images: ['/images/kids/outfit7/kid1.jpg', '/images/kids/outfit7/kid2.jpg', '/images/kids/outfit7/kid3.jpg'] },
    { id: 22, name: 'KNIT SWEATER WITH HOOD', price: 1750.00, salePrice: null, discount: null, category: 'kids', description: 'A cozy knit sweater with a hood.', images: ['/images/kids/outfit8/kid1.jpg', '/images/kids/outfit8/kid2.jpg', '/images/kids/outfit8/kid3.jpg'] },
    { id: 23, name: 'ANIMAL PRINT SATIN TOP', price: 2950.00, salePrice: 950.00, discount: '67%', category: 'women', description: 'Top featuring a round neck with lace trim.', images: ['/images/women/outfit1-sale/wm1.jpg', '/images/women/outfit1-sale/wm22.jpg', '/images/women/outfit1-sale/wm3.jpg', '/images/women/outfit1-sale/wm4.jpg'] },
    { id: 24, name: 'PRINTED TOP WITH KNOT', price: 2950.00, salePrice: 950.00, discount: '67%', category: 'women', description: 'A fun printed top with a knot detail.', images: ['/images/women/outfit2-sale/wm1.jpg', '/images/women/outfit2-sale/wm2.jpg', '/images/women/outfit2-sale/wm3.jpg'] },
    { id: 25, name: 'TRF MID-RISE STUDDED JEANS', price: 4990.00, salePrice: 750.00, discount: '84%', category: 'women', description: 'Edgy mid-rise jeans with stylish studs.', images: ['/images/women/outfit3-sale/wm1.jpg', '/images/women/outfit3-sale/wm2.jpg', '/images/women/outfit3-sale/wm3.jpg'] },
    { id: 26, name: 'COLLECTION CREASED SATIN TROUSERS', price: 4950.00, salePrice: 1250.00, discount: '74%', category: 'women', description: 'Elegant creased satin trousers.', images: ['/images/women/outfit4-sale/wm1.jpg', '/images/women/outfit4-sale/wm2.jpg', '/images/women/outfit4-sale/wm3.jpg'] },
    { id: 27, name: 'CREASED-EFFECT FINE KNIT SWEATER', price: 3590.00, salePrice: 750.00, discount: '79%', category: 'women', description: 'A unique creased-effect sweater.', images: ['/images/women/outfit5-sale/wm1.jpg', '/images/women/outfit5-sale/wm2.jpg', '/images/women/outfit5-sale/wm3.jpg'] },
    { id: 28, name: 'FINE KNIT OVERSIZE TOP', price: 1990.00, salePrice: 750.00, discount: '62%', category: 'women', description: 'A comfortable and stylish oversized top.', images: ['/images/women/outfit6-sale/wm1.jpg', '/images/women/outfit6-sale/wm2.jpg', '/images/women/outfit6-sale/wm3.jpg'] },
    { id: 29, name: 'STRETCH SHIRT', price: 3290.00, salePrice: 1950.00, discount: '40%', category: 'men', description: 'A comfortable and stylish stretch shirt.', images: ['/images/mens/outfit2-sale/men1.jpg', '/images/mens/outfit2-sale/men2.jpg', '/images/mens/outfit2-sale/men3.jpg'] },
    { id: 30, name: 'COTTON - LINEN SHIRT', price: 3590.00, salePrice: 1950.00, discount: '45%', category: 'men', description: 'A breathable and lightweight cotton-linen blend shirt.', images: ['/images/mens/outfit3-sale/men1.jpg', '/images/mens/outfit3-sale/men2.jpg', '/images/mens/outfit3-sale/men3.jpg'] },
    { id: 31, name: 'SEMI - SHEER TEXTURED SHIRT', price: 4990.00, salePrice: 1250.00, discount: '74%', category: 'men', description: 'A fashionable semi-sheer shirt.', images: ['/images/mens/outfit4-sale/men1.jpg', '/images/mens/outfit4-sale/men2.jpg', '/images/mens/outfit4-sale/men3.jpg'] },
    { id: 32, name: 'VISCOSE - LINEN TROUSERS', price: 3590.00, salePrice: 1950.00, discount: '45%', category: 'men', description: 'Lightweight and comfortable trousers.', images: ['/images/mens/outfit5-sale/men1.jpg', '/images/mens/outfit5-sale/men2.jpg', '/images/mens/outfit5-sale/men3.jpg'] },
    { id: 33, name: 'COTTON - LINEN SWEATER', price: 2990.00, salePrice: 950.00, discount: '68%', category: 'men', description: 'A perfect sweater for cool evenings.', images: ['/images/mens/outfit6-sale/men1.jpg', '/images/mens/outfit6-sale/men2.jpg', '/images/mens/outfit6-sale/men3.jpg'] },
    { id: 34, name: 'STRAIGHT-LEG JEANS', price: 3590.00, salePrice: 1250.00, discount: '65%', category: 'men', description: 'Classic and comfortable straight-leg jeans.', images: ['/images/mens/outfit7-sale/men1.jpg', '/images/mens/outfit7-sale/men2.jpg', '/images/mens/outfit7-sale/men3.jpg'] }
];

async function migrateToTwoSellers() {
    console.log('Starting database migration to two-seller structure...');

    // --- Clean Up Old Data (Optional but Recommended for a Fresh Start) ---
    console.log('Deleting old top-level products collection...');
    const oldProducts = await db.collection('products').get();
    for (const doc of oldProducts.docs) {
        await doc.ref.delete();
    }
    console.log('Old products deleted.');

    // --- Create Two Sellers ---
    const sellerA_ID = 'classic-threads';
    const sellerB_ID = 'modern-fits';

    const sellersCollection = db.collection('sellers');
    await sellersCollection.doc(sellerA_ID).set({ name: 'Classic Threads', createdAt: admin.firestore.FieldValue.serverTimestamp() });
    await sellersCollection.doc(sellerB_ID).set({ name: 'Modern Fits', createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`Created sellers: ${sellerA_ID} and ${sellerB_ID}`);

    // --- Divide and Upload Products ---
    const halfwayPoint = Math.ceil(allProducts.length / 2);
    const productsForSellerA = allProducts.slice(0, halfwayPoint);
    const productsForSellerB = allProducts.slice(halfwayPoint);

    console.log(`Assigning ${productsForSellerA.length} products to ${sellerA_ID}...`);
    for (const product of productsForSellerA) {
        // Add sellerId to the product data itself
        const productData = { ...product, sellerId: sellerA_ID };
        await sellersCollection.doc(sellerA_ID).collection('products').doc(String(product.id)).set(productData);
    }
    console.log('Products for Seller A uploaded.');

    console.log(`Assigning ${productsForSellerB.length} products to ${sellerB_ID}...`);
    for (const product of productsForSellerB) {
        const productData = { ...product, sellerId: sellerB_ID };
        await sellersCollection.doc(sellerB_ID).collection('products').doc(String(product.id)).set(productData);
    }
    console.log('Products for Seller B uploaded.');
    
    console.log('\nDatabase migration to two sellers is complete!');
}

migrateToTwoSellers().catch(error => {
    console.error('An error occurred during the two-seller migration:', error);
});
