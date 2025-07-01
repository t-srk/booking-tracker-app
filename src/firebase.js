// src/firebase.js
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcEn21TygkF_xdJ37X4WqxiYzb1knSwN4",
  authDomain: "booking-app-242b5.firebaseapp.com",
  projectId: "booking-app-242b5",
  storageBucket: "booking-app-242b5.firebasestorage.app",
  messagingSenderId: "453367090063",
  appId: "1:453367090063:web:27562df6f282136c7f19fa",
  measurementId: "G-VQLB9BD4TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db }; // <- export db for use in your application
