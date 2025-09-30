"use client";

import { useState, useEffect, useRef } from "react";
import * as agoraChatService from "@/lib/agoraChatService";
import {
  Send,
  LogOut,
  User,
  Clock,
  CheckCheck,
  Check,
  Loader2,
  ArrowDown,
} from "lucide-react";
import TypingIndicator from "./TypingIndicator";

export default function ChatInterface({ currentUserId, onLogout }) {
  const [peerId, setPeerId] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    cursor: null,
    hasMore: true,
  });
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Handle scroll to check if user is at bottom
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;
    setShowScrollButton(!isAtBottom);

    // Load more messages when scrolled to top
    if (
      container.scrollTop === 0 &&
      historyPagination.hasMore &&
      !loadingHistory
    ) {
      loadMoreMessages();
    }
  };

  // Load message history
  const loadMessageHistory = async (peerId) => {
    setLoadingHistory(true);
    try {
      const result = await agoraChatService.fetchMessageHistory(peerId, 20);

      setMessages(result.messages.reverse());
      setHistoryPagination({
        cursor: result.cursor,
        hasMore: !result.isLast,
      });

      setTimeout(() => scrollToBottom(false), 100);
    } catch (error) {
      console.error("Failed to load message history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!currentChat || !historyPagination.hasMore || loadingHistory) return;

    setLoadingHistory(true);
    const previousScrollHeight =
      messagesContainerRef.current?.scrollHeight || 0;

    try {
      const result = await agoraChatService.fetchMessageHistory(
        currentChat,
        20,
        historyPagination.cursor
      );

      setMessages((prev) => [...result.messages.reverse(), ...prev]);
      setHistoryPagination({
        cursor: result.cursor,
        hasMore: !result.isLast,
      });

      // Maintain scroll position
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop =
            newScrollHeight - previousScrollHeight;
        }
      }, 0);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Start chat with peer
  const handleStartChat = async () => {
    if (!peerId.trim()) {
      alert("⚠️ Please enter a Peer ID");
      return;
    }

    setLoading(true);
    setCurrentChat(peerId);
    setMessages([]);
    setHistoryPagination({ cursor: null, hasMore: true });

    // Load message history
    await loadMessageHistory(peerId);
    setLoading(false);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !currentChat) return;

    try {
      // Stop typing indicator
      await agoraChatService.sendTypingIndicator(currentChat, false);
      setIsTyping(false);

      const sentMessage = await agoraChatService.sendPeerMessage(
        currentChat,
        messageInput
      );

      setMessages((prev) => [...prev, sentMessage]);
      setMessageInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message: " + error.message);
    }
  };

  // Handle typing
  const handleTyping = async (e) => {
    setMessageInput(e.target.value);

    if (!currentChat) return;

    // Start typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      await agoraChatService.sendTypingIndicator(currentChat, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await agoraChatService.sendTypingIndicator(currentChat, false);
    }, 2000);
  };

  // Update message status
  const updateMessageStatus = (messageId, status) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
    );
  };

  // Setup listeners
  useEffect(() => {
    // Message received listener
    const handleMessageReceived = (message) => {
      if (currentChat && message.senderId === currentChat) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // Send read receipt
        agoraChatService.sendReadReceipt(message.id, message.senderId);
      }
    };

    // Typing status listener
    const handleTypingStatus = ({ userId, isTyping }) => {
      if (currentChat && userId === currentChat) {
        setOtherUserTyping(isTyping);
      }
    };

    // Read receipt listener
    const handleReadReceipt = ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    };

    agoraChatService.onMessageReceived(handleMessageReceived);
    agoraChatService.onTypingStatusChanged(handleTypingStatus);
    agoraChatService.onReadReceiptReceived(handleReadReceipt);

    return () => {
      agoraChatService.removeMessageListener(handleMessageReceived);
      agoraChatService.removeTypingListener(handleTypingStatus);
      agoraChatService.removeReadReceiptListener(handleReadReceipt);
    };
  }, [currentChat]);

  // Get message status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">💬</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Agora Chat
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                {currentUserId}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Start Chat Section */}
        {!currentChat && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto mt-20 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Start a Conversation
              </h2>
              <p className="text-gray-600">Enter a Peer ID to begin chatting</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={peerId}
                onChange={(e) => setPeerId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleStartChat()}
                placeholder="Enter Peer ID (e.g., user123)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
              />

              <button
                onClick={handleStartChat}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Start Chat"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {currentChat && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 h-[calc(100vh-200px)]">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentChat}</h3>
                  {otherUserTyping && (
                    <p className="text-xs text-purple-200 flex items-center gap-1">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></span>
                      </span>
                      typing...
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentChat(null);
                  setPeerId("");
                  setMessages([]);
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-medium"
              >
                Back
              </button>
            </div>

            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white"
              style={{ height: "calc(100% - 140px)" }}
            >
              {/* Loading more indicator */}
              {loadingHistory && (
                <div className="text-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600 mx-auto" />
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "sent" ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${
                      msg.type === "sent"
                        ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                    }`}
                  >
                    <p className="break-words">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                        msg.type === "sent"
                          ? "text-purple-200"
                          : "text-gray-500"
                      }`}
                    >
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.type === "sent" && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <TypingIndicator
                userName={currentChat}
                isVisible={otherUserTyping}
              />

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-24 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-110"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            )}

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-gray-50 border-t border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
