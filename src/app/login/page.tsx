// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust the path if necessary
import { FirebaseError } from 'firebase/app'; // Import FirebaseError

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add state for error messages
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Reset the error message before each attempt
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect after successful login
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Login failed:", error.message);
        setErrorMessage(error.message); // Set the error message to display to the user
      } else {
        console.error("Unexpected error:", error);
        setErrorMessage("An unexpected error occurred. Please try again."); // General error message
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded shadow-md max-w-sm w-full">
        <h1 className="text-2xl mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded w-full p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded w-full p-2"
              required
            />
          </div>
          {errorMessage && (
            <div className="mb-4 text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Login</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
}
