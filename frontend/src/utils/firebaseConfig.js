import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Correct import for Realtime Database
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKKHLJmr6LEYKF6C8-EUgNXzldVQpQMbc",
  authDomain: "randomchat-c08b6.firebaseapp.com",
  databaseURL: "https://randomchat-c08b6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "randomchat-c08b6",
  storageBucket: "randomchat-c08b6.firebasestorage.app",
  messagingSenderId: "158865023370",
  appId: "1:158865023370:web:8aabbc75b84619f0e12873"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Pass the app instance to getDatabase
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { database, auth, provider, signInWithPopup };