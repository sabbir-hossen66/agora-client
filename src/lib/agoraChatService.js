"use client";

import AgoraChat from "agora-chat";

// Global state
let chatClient = null;
let currentUserId = null;
let isLoggedIn = false;
let messageListeners = [];

// Initialize chat client
export const initializeClient = (appKey) => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Agora Chat শুধু browser এ কাজ করবে');
    return false;
  }

  try {
    chatClient = new AgoraChat.connection({
      appKey: appKey,
    });

    setupEventHandlers();
    console.log('✅ Agora Chat client initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize chat client:', error);
    return false;
  }
};

// Setup event handlers
const setupEventHandlers = () => {
  if (!chatClient) return;

  chatClient.addEventHandler("connection&message", {
    onConnected: () => {
      isLoggedIn = true;
      console.log('✅ Connected to Agora Chat');
    },
    onDisconnected: () => {
      isLoggedIn = false;
      console.log('⚠️ Disconnected from Agora Chat');
    },
    onTextMessage: (message) => {
      console.log('📨 Message received:', message);
      
      const formattedMessage = {
        id: message.id,
        text: message.msg,
        senderId: message.from,
        receiverId: message.to,
        timestamp: message.time || Date.now(),
        type: 'received'
      };

      messageListeners.forEach(listener => {
        listener(formattedMessage);
      });
    },
    onTokenWillExpire: () => {
      console.warn('⚠️ Token is about to expire');
    },
    onTokenExpired: () => {
      console.error('❌ Token has expired');
      isLoggedIn = false;
    },
    onError: (error) => {
      console.error('❌ Agora Chat error:', error);
    },
  });
};

// Login
export const login = async (userId, token) => {
  if (!chatClient) {
    throw new Error('Client not initialized. Call initializeClient first.');
  }

  try {
    await chatClient.open({
      user: userId,
      accessToken: token,
    });

    currentUserId = userId;
    isLoggedIn = true;

    console.log('✅ Login successful:', userId);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  if (!chatClient || !isLoggedIn) {
    return;
  }

  try {
    await chatClient.close();
    isLoggedIn = false;
    currentUserId = null;
    messageListeners = [];
    
    console.log('✅ Logged out successfully');
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
};

// Send peer-to-peer message
export const sendPeerMessage = async (peerId, messageText) => {
  if (!isLoggedIn) {
    throw new Error('You must be logged in to send messages');
  }

  try {
    const option = {
      chatType: "singleChat",
      type: "txt",
      to: peerId,
      msg: messageText,
    };

    const msg = AgoraChat.message.create(option);
    await chatClient.send(msg);

    console.log('✅ Message sent to:', peerId);

    return {
      id: msg.id,
      text: messageText,
      senderId: currentUserId,
      receiverId: peerId,
      timestamp: Date.now(),
      type: 'sent'
    };
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    throw error;
  }
};

// Add message listener
export const onMessageReceived = (callback) => {
  messageListeners.push(callback);
};

// Remove message listener
export const removeMessageListener = (callback) => {
  messageListeners = messageListeners.filter(
    listener => listener !== callback
  );
};

// Check if client is ready
export const isClientReady = () => {
  return chatClient !== null;
};

// Get current user ID
export const getCurrentUserId = () => {
  return currentUserId;
};

// Check login status
export const checkLoginStatus = () => {
  return isLoggedIn;
};