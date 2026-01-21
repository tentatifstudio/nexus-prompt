import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyATNSisF-8vFqV7-UDk7Mv782IqMHEtKsI",
  authDomain: "nexus-prompt.firebaseapp.com",
  projectId: "nexus-prompt",
  storageBucket: "nexus-prompt.firebasestorage.app",
  messagingSenderId: "831682834078",
  appId: "1:831682834078:web:e551614f0da2b97b65958f",
  measurementId: "G-Q1KY19M087"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (Optional, but good to have since you included it)
const analytics = getAnalytics(app);

// Export Auth & Provider for use in the app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
