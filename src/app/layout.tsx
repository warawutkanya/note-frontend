"use client"; // Ensure this component is treated as a Client Component

import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import "./globals.css";

const AuthNavLinks: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login'); // Redirect to the login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <ul className="flex justify-between items-center space-x-4 text-white">
      <div className="flex-1">
        {user ? (
          <>
            <li className="inline mr-4">
              <a href="/" className="hover:underline">
                หน้าหลัก
              </a>
            </li>
            <li className="inline">
              <a href="/notes" className="hover:underline">
                สร้าง Note
              </a>
            </li>
          </>
        ) : null}
      </div>
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            ออกจากระบบ
          </button>
        ) : (
          <a
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:underline"
          >
            Login
          </a>
        )}
      </div>
    </ul>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          {/* Navigation Bar */}
          <nav className="bg-gray-800 p-4">
            <AuthNavLinks />
          </nav>
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
