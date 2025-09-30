"use client";

import { useState, useEffect, useRef } from "react";
import * as agoraChatService from "@/lib/agoraChatService";

export default function ChatInterface({ currentUserId, onLogout }) {
  const [peerId, setPeerId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup message listener
  useEffect(() => {
    const handleMessage = (receivedMessage) => {
      console.log("📨 New message:", receivedMessage);
      setMessages((prev) => [...prev, receivedMessage]);
    };

    agoraChatService.onMessageReceived(handleMessage);

    return () => {
      agoraChatService.removeMessageListener(handleMessage);
    };
  }, []);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("⚠️ Please enter a message");
      return;
    }

    if (!peerId.trim()) {
      alert("⚠️ Please enter peer user ID");
      return;
    }

    setIsSending(true);

    try {
      const sentMessage = await agoraChatService.sendPeerMessage(
        peerId,
        message.trim()
      );

      // Add to messages list
      setMessages((prev) => [...prev, sentMessage]);
      setMessage("");

      console.log("✅ Message sent successfully");
    } catch (error) {
      console.error("❌ Send error:", error);
      alert("Failed to send message: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  // Clear chat
  const handleClearChat = () => {
    if (confirm("Clear all messages?")) {
      setMessages([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                💬 Agora Chat
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Logged in as:{" "}
                <span className="font-semibold text-blue-600">
                  {currentUserId}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear Chat
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Peer ID Input */}
        <div className="bg-white p-4 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chat with User ID:
          </label>
          <input
            type="text"
            value={peerId}
            onChange={(e) => setPeerId(e.target.value)}
            placeholder="Enter peer user ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Messages Area */}
        <div className="bg-white h-96 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">💭</div>
                <p>No messages yet. Start chatting!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${
                    msg.type === "sent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.type === "sent"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-xs opacity-75 mb-1">
                      {msg.type === "sent" ? "You" : msg.senderId}
                    </p>
                    <p className="break-words">{msg.text}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="bg-white rounded-b-2xl shadow-lg p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isSending ? "⏳" : "📤"} Send
            </button>
          </div>
        </form>

        {/* Message Count */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Total messages: {messages.length}
        </div>
      </div>
    </div>
  );
}
