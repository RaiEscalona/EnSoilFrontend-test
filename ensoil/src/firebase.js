// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfnKrf_6ITxmuNcEWvlLwHDHQgQybSG6g",
  authDomain: "capstone-ensoil-123.firebaseapp.com",
  projectId: "capstone-ensoil-123",
  storageBucket: "capstone-ensoil-123.firebasestorage.app",
  messagingSenderId: "884446997603",
  appId: "1:884446997603:web:5aa1452292862a20329c56",
  measurementId: "G-Q8ZTZ73WE9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };