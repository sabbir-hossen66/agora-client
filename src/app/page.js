'use client';

import { useState, useEffect } from 'react';
import ChatLogin from '@/components/ChatLogin';
import ChatInterface from '@/components/ChatInterface';
import * as agoraChatService from '@/lib/agoraChatService';
import { tokenService } from '@/lib/tokenService';

// ⚠️ তোমার Agora App Key এখানে দাও
// Format: "orgname#appname" (e.g., "41117440#383391")
const AGORA_APP_KEY = "611402009#1605378";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize client on mount
  useEffect(() => {
    try {
      const success = agoraChatService.initializeClient(AGORA_APP_KEY);
      
      if (!success) {
        setError('Failed to initialize Agora Chat client');
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const handleLogin = async (userId) => {
    if (!agoraChatService.isClientReady()) {
      alert('❌ Client এখনো ready না!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Backend থেকে token নাও
      const token = await tokenService.generateUserToken(userId);
      console.log('✅ Token received');

      // Agora Chat এ login করো
      await agoraChatService.login(userId, token);

      // State update করো
      setCurrentUserId(userId);
      setIsLoggedIn(true);

      console.log('✅ Login successful!');
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await agoraChatService.logout();
      setIsLoggedIn(false);
      setCurrentUserId(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Error state
  if (error && !agoraChatService.isClientReady()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Initialization Failed
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl">💬</div>
            </div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">
            {isLoggedIn ? 'Processing...' : 'Initializing Chat...'}
          </p>
        </div>
      </div>
    );
  }

  // Login page
  if (!isLoggedIn) {
    return <ChatLogin onLoginSuccess={handleLogin} />;
  }

  // Chat interface
  return (
    <ChatInterface
      currentUserId={currentUserId}
      onLogout={handleLogout}
    />
  );
}