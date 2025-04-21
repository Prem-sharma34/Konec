import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Correct import for Realtime Database
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyBtwPtosFDqG2JeN_P9GU8vTGrTXoDzjgA",

  authDomain: "konec-28f03.firebaseapp.com",

  databaseURL: "https://konec-28f03-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "konec-28f03",

  storageBucket: "konec-28f03.firebasestorage.app",

  messagingSenderId: "522343124304",

  appId: "1:522343124304:web:d58fc8177038e703a27055",

  measurementId: "G-P0X95B9KS0"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Pass the app instance to getDatabase
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { database, auth, provider, signInWithPopup };