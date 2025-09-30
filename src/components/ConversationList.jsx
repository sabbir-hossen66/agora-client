"use client";

import { useState } from "react";

export default function ConversationList({
  currentUserId,
  conversations = [],
  selectedChat,
  onSelectChat,
  onLogout,
}) {
  const [newChatInput, setNewChatInput] = useState("");

  const handleStartNewChat = (e) => {
    e.preventDefault();
    const peerId = newChatInput.trim();

    if (!peerId) {
      alert("⚠️ Please enter a Peer ID");
      return;
    }

    if (peerId === currentUserId) {
      alert("⚠️ You cannot chat with yourself!");
      return;
    }

    onSelectChat(peerId);
    setNewChatInput("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return "Just now";

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Show time
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full md:w-96 flex-shrink-0 bg-white border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center ring-2 ring-purple-300">
            <span className="text-purple-600 text-xl font-bold">
              {currentUserId?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <h2 className="text-white font-semibold text-base">
              {currentUserId}
            </h2>
            <p className="text-purple-100 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 active:scale-95"
          title="Logout"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      {/* Start New Chat Section */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
        <form onSubmit={handleStartNewChat} className="space-y-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Start New Chat
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newChatInput}
              onChange={(e) => setNewChatInput(e.target.value)}
              placeholder="Enter Peer ID..."
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
              autoComplete="off"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Chat
            </button>
          </div>
        </form>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          <div>
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 sticky top-0">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                Messages ({conversations.length})
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <button
                  key={conv.peerId}
                  onClick={() => onSelectChat(conv.peerId)}
                  className={`w-full p-4 text-left hover:bg-purple-50 transition-all duration-150 ${
                    selectedChat === conv.peerId
                      ? "bg-purple-50 border-l-4 border-purple-600"
                      : "border-l-4 border-transparent hover:border-purple-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md transition-transform ${
                          selectedChat === conv.peerId
                            ? "scale-110 ring-2 ring-purple-300"
                            : ""
                        }`}
                      >
                        <span className="text-white font-bold text-lg">
                          {conv.peerId[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <span className="text-white text-xs font-bold">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${
                            conv.unreadCount > 0
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {conv.peerId}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(conv.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          conv.unreadCount > 0
                            ? "text-gray-700 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {conv.lastMessage || "Start conversation..."}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div className="space-y-3">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  No conversations yet
                </p>
                <p className="text-gray-400 text-xs">
                  Start chatting above or wait for messages
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
