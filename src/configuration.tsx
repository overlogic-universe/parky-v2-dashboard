// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const apiKey: string | undefined = import.meta.env.VITE_API_KEY;
const authDomain: string | undefined = import.meta.env.VITE_AUTH_DOMAIN;
const projectId: string | undefined = import.meta.env.VITE_PROJECT_ID;
const storageBucket: string | undefined = import.meta.env.VITE_STORAGE_BUCKET;
const messagingSenderId: string | undefined = import.meta.env.VITE_MESSAGING_SENDER_ID;
const appId: string | undefined = import.meta.env.VITE_APP_ID;
const measurementId: string | undefined = import.meta.env.VITE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey:apiKey,
  authDomain: authDomain,
  projectId:projectId,
  storageBucket: storageBucket,
  messagingSenderId:messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Inisialisasi Firestore
const db = getFirestore(app);
// Inisialisasi Firebase auth
const auth = getAuth(app);

export { db, auth };
