import { createRoot } from 'react-dom/client'
// Ensure firebase is initialized and emulators are connected (in dev)
// before any other modules import Firestore/Functions. This prevents
// "Firestore has already been started and its settings can no longer be changed" errors.
import './firebaseConfig'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
