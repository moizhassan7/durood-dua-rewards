import { initializeApp } from 'firebase/app';
import { getAuth, updateProfile, sendEmailVerification } from 'firebase/auth'; // New imports
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // New import
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBao-UisoHNCFcpWXDl0Na61yVKEb9P608",
  authDomain: "darood-app-84a5f.firebaseapp.com",
  projectId: "darood-app-84a5f",
  storageBucket: "darood-app-84a5f.firebasestorage.app",
  messagingSenderId: "150574670250",
  appId: "1:150574670250:web:354aa827674daa7dd5cbd3",
  measurementId: "G-734V5H31DB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // New export