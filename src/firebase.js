// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYXI5hdZ-3YOugijla4vveuex9RxKyY64",
  authDomain: "capstone-ensoil-letsgoo.firebaseapp.com",
  projectId: "capstone-ensoil-letsgoo",
  storageBucket: "capstone-ensoil-letsgoo.firebasestorage.app",
  messagingSenderId: "171253533297",
  appId: "1:171253533297:web:16b263a12e3fd5efb8a9d0",
  measurementId: "G-T8QSYH76J3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };