"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if access is already granted
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      router.push('/playground');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Compare with environment variable
    if (accessCode === process.env.NEXT_PUBLIC_ACCESS_CODE) {
      // Store authentication in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      // Dispatch custom event to notify components about auth change
      window.dispatchEvent(new Event('authStateChanged'));
      
      router.push('/playground');
    } else {
      setError('Invalid access code');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Access Required</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Access Code
            </label>
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
              required
            />
          </div>
          
          {error && (
            <div className="text-gray-800 bg-gray-200 p-2 rounded text-sm border-l-4 border-gray-700">{error}</div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-all font-medium"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}