import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCO0az6MLVxaYZss-6PuugObNmmf2WdJfw",
  authDomain: "phoolishlove-ecommerce.firebaseapp.com",
  projectId: "phoolishlove-ecommerce",
  storageBucket: "phoolishlove-ecommerce.firebasestorage.app",
  messagingSenderId: "654565703771",
  appId: "1:654565703771:web:30579f55a35bcae0cabf7e",
  measurementId: "G-7ZNES2LCYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;