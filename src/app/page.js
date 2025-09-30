'use client';

import { useState, useEffect } from 'react';
import ChatLogin from '@/components/ChatLogin';
import ChatInterface from '@/components/ChatInterface';
import * as agoraChatService from '@/lib/agoraChatService';
import { tokenService } from '@/lib/tokenService';
import ConversationList from '@/components/ConversationList';

const AGORA_APP_KEY = "611402009#1605378";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);

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

  // Load conversations after login
  useEffect(() => {
    if (isLoggedIn) {
      // Initial load with slight delay to ensure connection is established
      setTimeout(() => {
        loadConversations();
      }, 1000);
      
      // Refresh less frequently to avoid losing local state
      const interval = setInterval(loadConversations, 30000); // 30 seconds instead of 5
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Listen for new messages and update conversations in real-time
  useEffect(() => {
    if (isLoggedIn) {
      const handleNewMessage = (message) => {
        console.log('📨 New message received from:', message.senderId, ':', message.text);
        
        // Update conversation list immediately in local state
        setConversations(prev => {
          // Remove existing conversation with this peer
          const filtered = prev.filter(c => c.peerId !== message.senderId);
          
          // Find existing conversation to preserve unread count
          const existing = prev.find(c => c.peerId === message.senderId);
          const isCurrentChat = selectedChat === message.senderId;
          
          // Add/update conversation at the top
          return [{
            peerId: message.senderId,
            lastMessage: message.text,
            timestamp: message.timestamp || Date.now(),
            unreadCount: isCurrentChat ? 0 : (existing?.unreadCount || 0) + 1
          }, ...filtered];
        });
        
        // Don't call loadConversations() here - it resets the state
      };

      agoraChatService.onMessageReceived(handleNewMessage);

      return () => {
        agoraChatService.removeMessageListener(handleNewMessage);
      };
    }
  }, [isLoggedIn, selectedChat]);

  // Load conversation list
  const loadConversations = async () => {
    try {
      const convos = await agoraChatService.getConversationList();
      
      // Only update if we got actual data from API
      if (convos && convos.length > 0) {
        setConversations(prev => {
          // Merge API data with existing local conversations
          const merged = [...convos];
          
          // Add any local conversations that aren't in API response
          prev.forEach(local => {
            if (!convos.find(c => c.peerId === local.peerId)) {
              merged.push(local);
            }
          });
          
          // Sort by timestamp
          return merged.sort((a, b) => b.timestamp - a.timestamp);
        });
        console.log('📋 Conversations loaded from API:', convos.length);
      } else {
        console.log('📋 No conversations from API, keeping local state');
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // Login handler
  const handleLogin = async (userId) => {
    if (!agoraChatService.isClientReady()) {
      alert('❌ Client এখনো ready না!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await tokenService.generateUserToken(userId);
      await agoraChatService.login(userId, token);
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
      setSelectedChat(null);
      setConversations([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle chat selection
  const handleSelectChat = (peerId) => {
    console.log('📱 Chat selected:', peerId);
    setSelectedChat(peerId);
    
    // Mark messages as read (reset unread count)
    setConversations(prev => 
      prev.map(conv => 
        conv.peerId === peerId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  // Handle sent messages - update conversation list
  const handleMessageSent = (peerId, messageText) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.peerId !== peerId);
      const existing = prev.find(c => c.peerId === peerId);
      
      return [{
        peerId,
        lastMessage: messageText,
        timestamp: Date.now(),
        unreadCount: 0 // Sent by us, so no unread
      }, ...filtered];
    });
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

  // ============================================
  // MAIN CHAT INTERFACE - Always Split Screen
  // ============================================
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Left Sidebar - Use ConversationList Component */}
      <ConversationList
        currentUserId={currentUserId}
        conversations={conversations}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        onLogout={handleLogout}
      />

      {/* Right Side - Chat Interface or Welcome Screen */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatInterface
            currentUserId={currentUserId}
            onLogout={handleLogout}
            initialPeerId={selectedChat}
            onMessageSent={handleMessageSent}
          />
        ) : (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="text-center max-w-md px-6">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-6xl">💬</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Welcome to Agora Chat
              </h2>
              <p className="text-gray-600 mb-6">
                Select a conversation from the left or start a new chat by entering a Peer ID
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}