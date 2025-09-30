// শুধু browser এ import হবে
let AgoraRTM = null;

// Browser check করে import করা
if (typeof window !== 'undefined') {
  AgoraRTM = require('agora-rtm-sdk').default;
}

class AgoraService {
  constructor() {
    this.client = null;
    this.currentUserId = null;
    this.isLoggedIn = false;
  }

  // RTM client create করা
  createClient(appId) {
    // Browser check
    if (typeof window === 'undefined' || !AgoraRTM) {
      console.warn('AgoraRTM শুধু browser এ কাজ করে');
      return null;
    }
    
    // ⚠️ AGORA APP ID: তোমার backend এর 'be2ac313cccd40c7a0c3ba62d6269025'
    this.client = AgoraRTM.createInstance(appId);
    return this.client;
  }

  // Login করা Agora তে
  async login(userId, token) {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      await this.client.login({ uid: userId, token: token });
      this.currentUserId = userId;
      this.isLoggedIn = true;
      console.log('✅ Agora login successful');
      return true;
    } catch (error) {
      console.error('❌ Agora login failed:', error);
      throw error;
    }
  }

  // Logout করা
  async logout() {
    try {
      if (this.client && this.isLoggedIn) {
        await this.client.logout();
        this.isLoggedIn = false;
        this.currentUserId = null;
        console.log('✅ Logged out successfully');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  // Peer-to-peer message পাঠানো
  async sendPeerMessage(peerId, message) {
    try {
      if (!this.isLoggedIn) {
        throw new Error('Not logged in');
      }

      // Message send করা
      await this.client.sendMessageToPeer(
        { text: message }, // Message content
        peerId // যাকে পাঠাবে তার user ID
      );
      
      console.log('✅ Message sent to:', peerId);
      return true;
    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    }
  }

  // Message receive করার listener setup
  onMessageReceived(callback) {
    if (this.client) {
      this.client.on('MessageFromPeer', (message, peerId) => {
        // Callback function এ message pass করা
        callback({
          text: message.text,
          senderId: peerId,
          timestamp: Date.now()
        });
      });
    }
  }

  // Connection state change listener
  onConnectionStateChanged(callback) {
    if (this.client) {
      this.client.on('ConnectionStateChanged', (state, reason) => {
        callback(state, reason);
      });
    }
  }

  // Current user ID return করা
  getCurrentUserId() {
    return this.currentUserId;
  }
}

// Singleton instance export করা
const agoraService = new AgoraService();
export default agoraService;