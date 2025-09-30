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
      delivery: true,
    });

    setupEventHandlers();
   
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

    },

    onDisconnected: () => {
      isLoggedIn = false;
  
    },

    // Text message received
    onTextMessage: (message) => {
      try {
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
          try {
            listener(formattedMessage);
          } catch (err) {
            console.error('Error in message listener:', err);
          }
        });
      } catch (error) {
        console.error('❌ Error in onTextMessage:', error);
      }
    },

    // CMD message (typing indicator)
onCmdMessage: (message) => {
  try {
    
    if (message.action === 'typing') {
      // Check different possible properties
      const msgContent = message.msg || message.message || message.ext?.msg;
      const isTyping = msgContent === 'start';
      
      console.log('⌨️ Typing status:', { 
        from: message.from, 
        msgContent, 
        isTyping 
      });
      
      typingListeners.forEach(listener => {
        try {
          listener({
            userId: message.from,
            isTyping: isTyping
          });
        } catch (err) {
          console.error('Error in typing listener:', err);
        }
      });
    }
  } catch (error) {
    console.error('❌ Error in onCmdMessage:', error);
  }
},

    // Delivery receipt received
    onDeliveredMessage: (message) => {
      try {
        console.log('✅ Message delivered:', message);
        readReceiptListeners.forEach(listener => {
          try {
            listener({
              messageId: message.mid,
              status: 'delivered',
              from: message.from,
              to: message.to
            });
          } catch (err) {
            console.error('Error in receipt listener:', err);
          }
        });
      } catch (error) {
        console.error('❌ Error in onDeliveredMessage:', error);
      }
    },

    // Read receipt received
    onReadMessage: (message) => {
      try {
        console.log('👀 Message read:', message);
        readReceiptListeners.forEach(listener => {
          try {
            listener({
              messageId: message.mid,
              status: 'read',
              from: message.from,
              to: message.to
            });
          } catch (err) {
            console.error('Error in receipt listener:', err);
          }
        });
      } catch (error) {
        console.error('❌ Error in onReadMessage:', error);
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

    console.log('✅ Login successful:', { userId, isLoggedIn });
    
    // Verify login status after 1 second
    setTimeout(() => {
      console.log('🔍 Login verification:', { isLoggedIn, currentUserId });
    }, 1000);
    
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
  console.log('📤 Attempting to send message:', { isLoggedIn, peerId });
  
  if (!isLoggedIn) {
    throw new Error('You must be logged in to send messages');
  }

  if (!chatClient) {
    throw new Error('Chat client not initialized');
  }

  try {
    const option = {
      chatType: "singleChat",
      type: "txt",
      to: peerId,
      msg: messageText,
      delivery: true,
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
  if (!isLoggedIn || !chatClient) {
    console.warn('⚠️ Cannot send typing indicator');
    return;
  }

  try {
    const option = {
      chatType: "singleChat",
      type: "cmd",
      to: peerId,
      action: "typing",
      ext: {
        msg: isTyping ? "start" : "stop"  
      }
    };

    const msg = AgoraChat.message.create(option);
    await chatClient.send(msg);
    console.log('✅ Typing indicator sent:', { to: peerId, isTyping });
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
      searchDirection: 'up',
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
      cursor: result.cursor,
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