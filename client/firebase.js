// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARt-htamBRIPG-BI_sNVokNp4W_DvAcgw",
  authDomain: "ta-manager-dd0ee.firebaseapp.com",
  projectId: "ta-manager-dd0ee",
  storageBucket: "ta-manager-dd0ee.firebasestorage.app",
  messagingSenderId: "22142764338",
  appId: "1:22142764338:web:a112539ef274ce53a8c32b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };