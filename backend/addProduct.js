// This script is used to add one or more new products to your Firestore database.

const admin = require('firebase-admin');

// --- Firebase Initialization ---
// Make sure the 'serviceAccountKey.json' file is in your backend folder
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- !!! EDIT THIS ARRAY TO ADD YOUR NEW PRODUCTS !!! ---
// To add a new product, simply create a new object in this array.
// Make sure the 'id' is unique and continues from your last product ID.
const newProducts = [
    // Whenever you want to add a new product, just uncomment the following object and edit it as needed.
    
    // {
    //     id: 35, // The next available ID
    //     name: 'STYLISH DENIM JACKET',
    //     price: 6990.00,
    //     salePrice: null,
    //     discount: null,
    //     category: 'men',
    //     description: 'A classic denim jacket with a modern fit. A wardrobe essential.',
    //     images: [
    //         '/images/mens/outfit8/men1.jpg', // Make sure you have created this folder and added images
    //         '/images/mens/outfit8/men2.jpg'
    //     ]
    // },
    // You can add more products here if you want to upload several at once.
    // {
    //     id: 36,
    //     name: 'Another New Product',
    //     ...
    // }
];


/**
 * A function to upload the products defined in the `newProducts` array.
 */
async function uploadNewProducts() {
  const productsCollection = db.collection('products');
  console.log('Starting upload of new products...');

  if (newProducts.length === 0) {
    console.log('No new products to upload. Please add items to the `newProducts` array.');
    return;
  }

  for (const product of newProducts) {
    // We use the product's own id as the document ID in Firestore
    const docRef = productsCollection.doc(String(product.id));
    await docRef.set(product);
    console.log(`SUCCESS: Uploaded product ${product.id}: ${product.name}`);
  }

  console.log('All new products have been successfully uploaded!');
}

// Run the upload function
uploadNewProducts().catch(error => {
  console.error('ERROR: Could not upload new products:', error);
});
