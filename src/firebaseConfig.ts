import { initializeApp } from 'firebase/app';
import { getAuth, updateProfile, sendEmailVerification } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

const useFirestoreEmulator = import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true';
const firestoreEmulatorPort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT) || 8090;
const useFunctionsEmulator = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';
const functionsEmulatorPort = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT) || 5001;

if (window.location.hostname === 'localhost' && useFirestoreEmulator) {
  connectFirestoreEmulator(db, 'localhost', firestoreEmulatorPort);
}
if (window.location.hostname === 'localhost' && useFunctionsEmulator) {
  connectFunctionsEmulator(functions, 'localhost', functionsEmulatorPort);
}
