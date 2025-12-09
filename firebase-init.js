// firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
// Ensure the projectId is correctly defined here.
const firebaseConfig = {
    apiKey: "AIzaSyA-wV9myRJyD6eTp-Ak3mLWU8qnWKr30qw",
    authDomain: "letsgo-c4a7c.firebaseapp.com",
    projectId: "letsgo-c4a7c", // This line is crucial
    storageBucket: "letsgo-c4a7c.firebasestorage.app",
    messagingSenderId: "327919496932",
    appId: "1:327919496932:web:fa47bd11a0d13e7c97c6f1",
    measurementId: "G-HB81DELVQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
const db = getFirestore(app);

export { db };