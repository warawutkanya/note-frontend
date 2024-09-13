// src/lib/auth.ts
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// Function to register a new user and save user data to db
export const registerUser = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to db
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      email,
      displayName,
      createdAt: Timestamp.now(),
    });
    
    return user;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error; // Rethrow to handle errors in the component
  }
};
