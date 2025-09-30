'use client';

import { useState, useEffect } from 'react';
import ChatLogin from '@/components/ChatLogin';

import agoraService from '@/lib/agoraService';
import { tokenService } from '@/lib/tokenService';
import ChatInterface from '@/components/ChatInterface';


// ⚠️ গুরুত্বপূর্ণ: তোমার backend এর App ID এখানে দাও
const AGORA_APP_ID = 'be2ac313cccd40c7a0c3ba62d6269025';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Agora client initialize করা
    agoraService.createClient(AGORA_APP_ID);
  }, []);

  // Login handler
  const handleLogin = async (userId) => {
    setLoading(true);
    try {
      // Backend থেকে token নেওয়া
      const token = await tokenService.generateUserToken(userId);
      
      // Agora তে login করা
      await agoraService.login(userId, token);
      
      // State update করা
      setCurrentUserId(userId);
      setIsLoggedIn(true);
      
      console.log('✅ Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserId(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Login হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Login না করলে Login page দেখাবে
  if (!isLoggedIn) {
    return <ChatLogin onLoginSuccess={handleLogin} />;
  }

  // Login করার পর Chat Interface দেখাবে
  return (
    <ChatInterface
      currentUserId={currentUserId} 
      onLogout={handleLogout} 
    />
  );
}
