// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCWDpNAX1_2NzOnUGB-vGy4DjaT_A44Cok",
  authDomain: "note-easy-f6b86.firebaseapp.com",
  projectId: "note-easy-f6b86",
  storageBucket: "note-easy-f6b86.appspot.com",
  messagingSenderId: "531752342257",
  appId: "1:531752342257:web:2edeeea2fb221bbae8cf50",
  measurementId: "G-64G7DDME8C"
};

const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
