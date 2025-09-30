"use client";

import { useState, useEffect } from "react";
import { Send, LogOut, User } from "lucide-react";
import MessageList from "./MessageList";
import agoraService from "@/lib/agoraService";

export default function ChatInterface({ currentUserId, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connected");

  useEffect(() => {
    // Message receive করার listener setup
    agoraService.onMessageReceived((message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Connection state change listener
    agoraService.onConnectionStateChanged((state, reason) => {
      setConnectionStatus(state);
      console.log("Connection state:", state, "Reason:", reason);
    });
  }, []);

  // Message পাঠানোর function
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Validation
    if (!newMessage.trim() || !recipientId.trim()) {
      alert("Message এবং Recipient ID দুটোই দিতে হবে!");
      return;
    }

    try {
      // Message পাঠানো
      await agoraService.sendPeerMessage(recipientId, newMessage.trim());

      // নিজের message কে message list এ add করা
      setMessages((prev) => [
        ...prev,
        {
          text: newMessage.trim(),
          senderId: currentUserId,
          timestamp: Date.now(),
        },
      ]);

      // Input field clear করা
      setNewMessage("");
    } catch (error) {
      console.error("Message send error:", error);
      alert("Message পাঠাতে ব্যর্থ হয়েছে!");
    }
  };

  // Logout করার function
  const handleLogout = async () => {
    try {
      await agoraService.logout();
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">{currentUserId}</span>
          <span
            className={`ml-4 text-sm ${
              connectionStatus === "CONNECTED"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ● {connectionStatus}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Recipient Input */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-semibold text-gray-700">
            কাকে message পাঠাবে:
          </label>
          <input
            type="text"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="Recipient User ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} currentUserId={currentUserId} />

      {/* Message Input */}
      <div className="bg-white border-t px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="তোমার message লেখো..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>পাঠাও</span>
          </button>
        </form>
      </div>
    </div>
  );
}
