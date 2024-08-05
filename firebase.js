// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoNPSzLkHfVDOJZTDAWnEw4vOIdHQP_yI",
  authDomain: "pantry-dd538.firebaseapp.com",
  projectId: "pantry-dd538",
  storageBucket: "pantry-dd538.appspot.com",
  messagingSenderId: "27212405510",
  appId: "1:27212405510:web:4bd711d962e8422e49dc87",
  measurementId: "G-NN210S5QZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app)
export {app, firestore}


