"use client";

import AgoraChat from "agora-chat";

// Global state
let chatClient = null;
let currentUserId = null;
let isLoggedIn = false;
let messageListeners = [];
let typingListeners = [];
let readReceiptListeners = [];

// Initialize chat client
export const initializeClient = (appKey) => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Agora Chat শুধু browser এ কাজ করবে');
    return false;
  }

  try {
    chatClient = new AgoraChat.connection({
      appKey: appKey,
      delivery: true, // Enable delivery receipts
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

    // Text message received
    onTextMessage: (message) => {
      console.log('📨 Message received:', message);
      
      const formattedMessage = {
        id: message.id,
        text: message.msg,
        senderId: message.from,
        receiverId: message.to,
        timestamp: message.time || Date.now(),
        type: 'received',
        status: 'received'
      };

      // Send delivery receipt
      sendDeliveryReceipt(message.id, message.from);

      // Notify all listeners
      messageListeners.forEach(listener => {
        listener(formattedMessage);
      });
    },

    // Delivery receipt received
    onDeliveredMessage: (message) => {
      console.log('✅ Message delivered:', message);
      readReceiptListeners.forEach(listener => {
        listener({
          messageId: message.mid,
          status: 'delivered',
          from: message.from,
          to: message.to
        });
      });
    },

    // Read receipt received
    onReadMessage: (message) => {
      console.log('👀 Message read:', message);
      readReceiptListeners.forEach(listener => {
        listener({
          messageId: message.mid,
          status: 'read',
          from: message.from,
          to: message.to
        });
      });
    },

    // Channel message (typing indicator)
    onChannelMessage: (message) => {
      if (message.type === 'cmd' && message.action === 'typing') {
        typingListeners.forEach(listener => {
          listener({
            userId: message.from,
            isTyping: message.msg === 'start'
          });
        });
      }
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
    typingListeners = [];
    readReceiptListeners = [];
    
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
      delivery: true, // Request delivery receipt
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
      type: 'sent',
      status: 'sent'
    };
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    throw error;
  }
};

// Send typing indicator
export const sendTypingIndicator = async (peerId, isTyping) => {
  if (!isLoggedIn) return;

  try {
    const option = {
      chatType: "singleChat",
      type: "cmd",
      to: peerId,
      action: "typing",
      msg: isTyping ? "start" : "stop",
    };

    const msg = AgoraChat.message.create(option);
    await chatClient.send(msg);
  } catch (error) {
    console.error('❌ Failed to send typing indicator:', error);
  }
};

// Send delivery receipt
const sendDeliveryReceipt = async (messageId, to) => {
  try {
    await chatClient.send({
      type: 'delivery',
      id: messageId,
      to: to
    });
  } catch (error) {
    console.error('❌ Failed to send delivery receipt:', error);
  }
};

// Send read receipt
export const sendReadReceipt = async (messageId, to) => {
  if (!isLoggedIn) return;

  try {
    await chatClient.send({
      type: 'read',
      id: messageId,
      to: to
    });
    console.log('✅ Read receipt sent for message:', messageId);
  } catch (error) {
    console.error('❌ Failed to send read receipt:', error);
  }
};

// Fetch message history
export const fetchMessageHistory = async (peerId, pageSize = 20, cursor = null) => {
  if (!isLoggedIn) {
    throw new Error('You must be logged in to fetch messages');
  }

  try {
    const options = {
      targetId: peerId,
      pageSize: pageSize,
      chatType: 'singleChat',
      searchDirection: 'up', // Load older messages
    };

    if (cursor) {
      options.cursor = cursor;
    }

    const result = await chatClient.getHistoryMessages(options);
    
    console.log('✅ Message history fetched:', result.messages.length);

    const formattedMessages = result.messages.map(msg => ({
      id: msg.id,
      text: msg.msg,
      senderId: msg.from,
      receiverId: msg.to,
      timestamp: msg.time,
      type: msg.from === currentUserId ? 'sent' : 'received',
      status: msg.from === currentUserId ? 'sent' : 'received'
    }));

    return {
      messages: formattedMessages,
      cursor: result.cursor, // For pagination
      isLast: result.isLast
    };
  } catch (error) {
    console.error('❌ Failed to fetch message history:', error);
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

// Add typing listener
export const onTypingStatusChanged = (callback) => {
  typingListeners.push(callback);
};

// Remove typing listener
export const removeTypingListener = (callback) => {
  typingListeners = typingListeners.filter(
    listener => listener !== callback
  );
};

// Add read receipt listener
export const onReadReceiptReceived = (callback) => {
  readReceiptListeners.push(callback);
};

// Remove read receipt listener
export const removeReadReceiptListener = (callback) => {
  readReceiptListeners = readReceiptListeners.filter(
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