import { initializeApp } from 'firebase/app';
import { getAuth, updateProfile, sendEmailVerification } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators if running locally
if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}