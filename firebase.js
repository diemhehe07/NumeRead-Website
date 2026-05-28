// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlE6KUHcip1-Lhy_WIjrbkD3rPLpj8LUQ",
  authDomain: "numeread-webapp.firebaseapp.com",
  projectId: "numeread-webapp",
  storageBucket: "numeread-webapp.firebasestorage.app",
  messagingSenderId: "1082327768131",
  appId: "1:1082327768131:web:77e4b77a541a06d13b08f6",
  measurementId: "G-E3HC7VL14Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);