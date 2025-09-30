# Real-Time Chat Application

A modern, feature-rich real-time chat application built with React and Agora Chat SDK. Experience seamless messaging with advanced features like typing indicators, read receipts, and offline support.

## 🚀 Live Demo

[🔗 [Add your live link here](https://drive.google.com/file/d/1Ors447uSIFBuLzWgPmbsdaAgq6RBlIAD/view?usp=sharing)]

## ✨ Features

### 💬 Real-time Messaging
- **Instant Message Delivery**: Send and receive messages in real-time with minimal latency
- **Secure Communication**: End-to-end encrypted messaging for privacy
- **Multi-format Support**: Text messages with proper formatting and emoji support

### 👀 Read Receipts
- **Delivery Status**: See when your messages are successfully delivered
- **Read Status**: Know exactly when the recipient reads your messages
- **Visual Indicators**: 
  - ⏰ Clock icon: Message sending
  - ✓ Single check: Message sent
  - ✓✓ Double checks: Message delivered
  - ✓✓ Blue checks: Message read

### 📴 Offline Support
- **Message Queue**: Messages are queued and delivered when users come online
- **Sync on Reconnect**: Automatic synchronization of missed messages
- **Persistent Storage**: Messages are stored securely and retrieved on app restart

### ⌨️ Typing Indicators
- **Real-time Feedback**: See when the other user is typing
- **Animated Dots**: Beautiful bouncing animation for typing status
- **Smart Timeout**: Automatically hides after 2 seconds of inactivity
- **Optimized Signals**: Prevents unnecessary typing indicator updates

### 📜 Previous Message Loading
- **Infinite Scroll**: Load previous messages seamlessly as you scroll up
- **Pagination**: Efficient loading of message history in chunks
- **Scroll Preservation**: Maintains scroll position when loading older messages
- **Loading Indicators**: Visual feedback when loading more messages

### 🎨 User Experience
- **Modern UI**: Beautiful gradient design with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Intuitive Interface**: Clean and user-friendly chat interface
- **Quick Actions**: Easy peer switching and conversation management

## 🛠️ Technical Features

### Message Status Tracking
```javascript
// Message status flow
Sending → Sent → Delivered → Read