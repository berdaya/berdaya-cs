"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if authenticated on client-side
    const auth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(auth === 'true');
    
    // Add event listener for auth changes
    const handleStorageChange = () => {
      const authState = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authState === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for auth changes within the same window
    window.addEventListener('authStateChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleStorageChange);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    router.push('/');
  };
  
  return (
    <nav className="bg-gray-900 text-white p-4 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-lg">Chatbot Admin</div>
        <div className="space-x-6">
          {isAuthenticated ? (
            <>
              <Link 
                href="/playground" 
                className={`hover:text-gray-300 transition-colors ${
                  pathname === '/playground' ? 'text-gray-300 border-b border-gray-300' : 'text-gray-400'
                }`}
              >
                Playground
              </Link>
              <Link 
                href="/history" 
                className={`hover:text-gray-300 transition-colors ${
                  pathname === '/history' ? 'text-gray-300 border-b border-gray-300' : 'text-gray-400'
                }`}
              >
                History
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/" 
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}